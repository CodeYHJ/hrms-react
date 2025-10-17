package handler

import (
	"hrms/model"
	"hrms/service"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CreateSalaryTemplate 创建薪资模板
func CreateSalaryTemplate(c *gin.Context) {
	var template model.SalaryTemplateWithItems
	if err := c.ShouldBindJSON(&template); err != nil {
		log.Printf("[CreateSalaryTemplate] 参数绑定错误: %v", err)
		sendFail(c, 5001, "参数绑定错误: "+err.Error())
		return
	}

	err := service.CreateSalaryTemplate(c, &template)
	if err != nil {
		log.Printf("[CreateSalaryTemplate] 创建模板失败: %v", err)
		sendFail(c, 5002, "创建模板失败: "+err.Error())
		return
	}

	sendSuccess(c, nil, "创建成功")
}

// UpdateSalaryTemplate 更新薪资模板
func UpdateSalaryTemplate(c *gin.Context) {
	var template model.SalaryTemplateWithItems
	if err := c.ShouldBindJSON(&template); err != nil {
		log.Printf("[UpdateSalaryTemplate] 参数绑定错误: %v", err)
		sendFail(c, 5001, "参数绑定错误: "+err.Error())
		return
	}

	err := service.UpdateSalaryTemplate(c, &template)
	if err != nil {
		log.Printf("[UpdateSalaryTemplate] 更新模板失败: %v", err)
		sendFail(c, 5002, "更新模板失败: "+err.Error())
		return
	}

	sendSuccess(c, nil, "更新成功")
}

// DeleteSalaryTemplate 删除薪资模板
func DeleteSalaryTemplate(c *gin.Context) {
	templateID := c.Param("template_id")
	if templateID == "" {
		sendFail(c, 5001, "模板ID不能为空")
		return
	}

	err := service.DeleteSalaryTemplate(c, templateID)
	if err != nil {
		log.Printf("[DeleteSalaryTemplate] 删除模板失败: %v", err)
		sendFail(c, 5002, "删除模板失败: "+err.Error())
		return
	}

	sendSuccess(c, nil, "删除成功")
}

// GetSalaryTemplate 获取薪资模板详情
func GetSalaryTemplate(c *gin.Context) {
	templateID := c.Param("template_id")
	if templateID == "" {
		sendFail(c, 5001, "模板ID不能为空")
		return
	}

	template, err := service.GetSalaryTemplate(c, templateID)
	if err != nil {
		log.Printf("[GetSalaryTemplate] 获取模板失败: %v", err)
		sendFail(c, 5002, "获取模板失败: "+err.Error())
		return
	}

	sendSuccess(c, template, "获取成功")
}

// QuerySalaryTemplates 查询薪资模板列表
func QuerySalaryTemplates(c *gin.Context) {
	var query model.TemplateQueryRequest
	if err := c.ShouldBindQuery(&query); err != nil {
		log.Printf("[QuerySalaryTemplates] 参数绑定错误: %v", err)
		sendFail(c, 5001, "参数绑定错误: "+err.Error())
		return
	}

	// 设置默认分页参数
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 10
	}

	result, err := service.QuerySalaryTemplates(c, &query)
	if err != nil {
		log.Printf("[QuerySalaryTemplates] 查询模板失败: %v", err)
		sendFail(c, 5002, "查询模板失败: "+err.Error())
		return
	}

	sendTotalSuccess(c, result.Data, result.Total, "")
}

// ApplySalaryTemplate 应用薪资模板
func ApplySalaryTemplate(c *gin.Context) {
	var applyReq model.TemplateApplyRequest
	if err := c.ShouldBindJSON(&applyReq); err != nil {
		log.Printf("[ApplySalaryTemplate] 参数绑定错误: %v", err)
		sendFail(c, 5001, "参数绑定错误: "+err.Error())
		return
	}

	result, err := service.ApplySalaryTemplate(c, &applyReq)
	if err != nil {
		log.Printf("[ApplySalaryTemplate] 应用模板失败: %v", err)
		sendFail(c, 5002, "应用模板失败: "+err.Error())
		return
	}

	sendSuccess(c, result, "应用成功")
}

// GetApplicableTemplates 获取适用于指定员工的可应用模板
func GetApplicableTemplates(c *gin.Context) {
	staffID := c.Param("staff_id")
	if staffID == "" {
		sendFail(c, 5001, "员工ID不能为空")
		return
	}

	templates, err := service.GetApplicableTemplates(c, staffID)
	if err != nil {
		log.Printf("[GetApplicableTemplates] 获取可应用模板失败: %v", err)
		sendFail(c, 5002, "获取可应用模板失败: "+err.Error())
		return
	}

	sendSuccess(c, templates, "获取成功")
}

// ToggleTemplateStatus 切换模板启用状态
func ToggleTemplateStatus(c *gin.Context) {
	templateID := c.Param("template_id")
	if templateID == "" {
		sendFail(c, 5001, "模板ID不能为空")
		return
	}

	statusStr := c.Query("status")
	status, err := strconv.ParseBool(statusStr)
	if err != nil {
		sendFail(c, 5001, "状态参数错误")
		return
	}

	err = service.ToggleTemplateStatus(c, templateID, status)
	if err != nil {
		log.Printf("[ToggleTemplateStatus] 切换模板状态失败: %v", err)
		sendFail(c, 5002, "切换模板状态失败: "+err.Error())
		return
	}

	sendSuccess(c, nil, "状态更新成功")
}