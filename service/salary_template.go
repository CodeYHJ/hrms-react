package service

import (
	"encoding/json"
	"errors"
	"hrms/model"
	"hrms/resource"
	"log"

	"github.com/gin-gonic/gin"
)

// CreateSalaryTemplate 创建薪资模板
func CreateSalaryTemplate(c *gin.Context, template *model.SalaryTemplateWithItems) error {
	// 验证模板ID是否已存在
	existingTemplate := &model.SalaryTemplate{}
	result := resource.HrmsDB(c).Where("template_id = ?", template.TemplateID).First(existingTemplate)
	if result.Error == nil {
		return errors.New("模板ID已存在")
	}

	// 开始事务
	tx := resource.HrmsDB(c).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 保存模板
	if err := tx.Create(&template.SalaryTemplate).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 保存模板项目
	for i := range template.Items {
		template.Items[i].TemplateID = template.TemplateID
		if err := tx.Create(&template.Items[i]).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

// UpdateSalaryTemplate 更新薪资模板
func UpdateSalaryTemplate(c *gin.Context, template *model.SalaryTemplateWithItems) error {
	// 验证模板是否存在
	existingTemplate := &model.SalaryTemplate{}
	result := resource.HrmsDB(c).Where("template_id = ?", template.TemplateID).First(existingTemplate)
	if result.Error != nil {
		return errors.New("模板不存在")
	}

	// 开始事务
	tx := resource.HrmsDB(c).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 删除模板项目
	if err := tx.Where("template_id = ?", template.TemplateID).Delete(&model.SalaryTemplateItem{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 删除模板
	if err := tx.Where("template_id = ?", template.TemplateID).Delete(&model.SalaryTemplate{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// DeleteSalaryTemplate 删除薪资模板
func DeleteSalaryTemplate(c *gin.Context, templateID string) error {
	// 验证模板是否存在
	existingTemplate := &model.SalaryTemplate{}
	result := resource.HrmsDB(c).Where("template_id = ?", templateID).First(existingTemplate)
	if result.Error != nil {
		return errors.New("模板不存在")
	}

	// 开始事务
	tx := resource.HrmsDB(c).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 删除模板项目
	if err := tx.Where("template_id = ?", templateID).Delete(&model.SalaryTemplateItem{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 删除模板
	if err := tx.Where("template_id = ?", templateID).Delete(&model.SalaryTemplate{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// GetSalaryTemplate 获取薪资模板详情
func GetSalaryTemplate(c *gin.Context, templateID string) (*model.SalaryTemplateWithItems, error) {
	// 获取模板
	template := &model.SalaryTemplate{}
	result := resource.HrmsDB(c).Where("template_id = ?", templateID).First(template)
	if result.Error != nil {
		return nil, errors.New("模板不存在")
	}

	// 获取模板项目
	var items []model.SalaryTemplateItem
	if err := resource.HrmsDB(c).Where("template_id = ?", templateID).Order("sort_order ASC").Find(&items).Error; err != nil {
		return nil, err
	}

	return &model.SalaryTemplateWithItems{
		SalaryTemplate: *template,
		Items:          items,
	}, nil
}

// QuerySalaryTemplates 查询薪资模板列表
func QuerySalaryTemplates(c *gin.Context, query *model.TemplateQueryRequest) (*model.TemplateQueryResponse, error) {
	var templates []model.SalaryTemplate
	db := resource.HrmsDB(c).Model(&model.SalaryTemplate{})

	// 构建查询条件
	if query.TemplateID != "" {
		db = db.Where("template_id LIKE ?", "%"+query.TemplateID+"%")
	}
	if query.TemplateName != "" {
		db = db.Where("template_name LIKE ?", "%"+query.TemplateName+"%")
	}
	if query.TemplateType != "" {
		db = db.Where("template_type = ?", query.TemplateType)
	}
	if query.IsActive != nil {
		db = db.Where("is_active = ?", *query.IsActive)
	}

	// 获取总数
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, err
	}

	// 分页查询
	start := (query.Page - 1) * query.PageSize
	if err := db.Offset(start).Limit(query.PageSize).Order("created_at DESC").Find(&templates).Error; err != nil {
		return nil, err
	}

	// 获取每个模板的项目
	var result []model.SalaryTemplateWithItems
	for _, template := range templates {
		var items []model.SalaryTemplateItem
		if err := resource.HrmsDB(c).Where("template_id = ?", template.TemplateID).Order("sort_order ASC").Find(&items).Error; err != nil {
			return nil, err
		}
		result = append(result, model.SalaryTemplateWithItems{
			SalaryTemplate: template,
			Items:          items,
		})
	}

	return &model.TemplateQueryResponse{
		Total: total,
		Data:  result,
	}, nil
}

// ApplySalaryTemplate 应用薪资模板
func ApplySalaryTemplate(c *gin.Context, applyReq *model.TemplateApplyRequest) (*model.TemplateApplyResponse, error) {
	// 获取模板详情
	template, err := GetSalaryTemplate(c, applyReq.TemplateID)
	if err != nil {
		return nil, err
	}

	// 验证模板是否启用
	if !template.IsActive {
		return nil, errors.New("模板未启用")
	}

	// 计算各项薪资
	result := &model.TemplateApplyResponse{
		Base:       applyReq.BaseSalary,
		Subsidy:    0,
		Bonus:      0,
		Commission: 0,
		Other:      0,
	}

	for _, item := range template.Items {
		var amount int64
		if item.CalculationType == "fixed" && item.Amount != nil {
			amount = *item.Amount
		} else if item.CalculationType == "percentage" && item.Percentage != nil {
			// 百分比计算，基于基本工资
			amount = int64(float64(applyReq.BaseSalary) * (*item.Percentage / 100.0))
		}

		// 根据项目类型累加到对应字段
		switch item.ItemType {
		case "base":
			result.Base += amount
		case "subsidy":
			result.Subsidy += amount
		case "bonus":
			result.Bonus += amount
		case "commission":
			result.Commission += amount
		case "other":
			result.Other += amount
		}
	}

	return result, nil
}

// GetApplicableTemplates 获取适用于指定员工的可应用模板
func GetApplicableTemplates(c *gin.Context, staffID string) ([]model.SalaryTemplateWithItems, error) {
	// 获取员工信息
	staff := &model.Staff{}
	result := resource.HrmsDB(c).Where("staff_id = ?", staffID).First(staff)
	if result.Error != nil {
		return nil, errors.New("员工不存在")
	}

	// 查询所有启用的模板
	var templates []model.SalaryTemplate
	if err := resource.HrmsDB(c).Where("is_active = ?", true).Find(&templates).Error; err != nil {
		return nil, err
	}

	// 筛选适用于该员工的模板
	var applicableTemplates []model.SalaryTemplateWithItems
	for _, template := range templates {
		// 检查职级匹配
		if template.ApplicableRankIDs != "" {
			var rankIDs []string
			if err := json.Unmarshal([]byte(template.ApplicableRankIDs), &rankIDs); err != nil {
				log.Printf("解析职级ID列表失败: %v", err)
				continue
			}
			rankMatched := false
			for _, rankID := range rankIDs {
				if rankID == staff.RankId {
					rankMatched = true
					break
				}
			}
			if !rankMatched {
				continue
			}
		}

		// 检查部门匹配
		if template.ApplicableDepIDs != "" {
			var depIDs []string
			if err := json.Unmarshal([]byte(template.ApplicableDepIDs), &depIDs); err != nil {
				log.Printf("解析部门ID列表失败: %v", err)
				continue
			}
			depMatched := false
			for _, depID := range depIDs {
				if depID == staff.DepId {
					depMatched = true
					break
				}
			}
			if !depMatched {
				continue
			}
		}

		// 获取模板项目
		var items []model.SalaryTemplateItem
		if err := resource.HrmsDB(c).Where("template_id = ?", template.TemplateID).Order("sort_order ASC").Find(&items).Error; err != nil {
			return nil, err
		}

		applicableTemplates = append(applicableTemplates, model.SalaryTemplateWithItems{
			SalaryTemplate: template,
			Items:          items,
		})
	}

	return applicableTemplates, nil
}

// ToggleTemplateStatus 切换模板启用状态
func ToggleTemplateStatus(c *gin.Context, templateID string, status bool) error {
	// 验证模板是否存在
	existingTemplate := &model.SalaryTemplate{}
	result := resource.HrmsDB(c).Where("template_id = ?", templateID).First(existingTemplate)
	if result.Error != nil {
		return errors.New("模板不存在")
	}

	// 更新状态
	if err := resource.HrmsDB(c).Model(&model.SalaryTemplate{}).Where("template_id = ?", templateID).Update("is_active", status).Error; err != nil {
		return err
	}

	return nil
}
