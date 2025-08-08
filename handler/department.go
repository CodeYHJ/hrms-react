package handler

import (
	"hrms/model"
	"hrms/resource"
	"hrms/service"
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func init() {
	Register(func(r *gin.RouterGroup) {
		// 部门相关
		departGroup := r.Group("/depart")
		departGroup.POST("/create", DepartCreate)
		departGroup.DELETE("/del/:dep_id", DepartDel)
		departGroup.POST("/edit", DepartEdit)
		departGroup.GET("/query/:dep_id", DepartQuery)
	})
}

// 创建部门
// @Summary 创建部门
// @Tags 部门管理
// @Accept  json
// @Produce  json
// @Param department body model.DepartmentCreateDTO true "部门信息"
// @Router /api/depart/create [post]
func DepartCreate(c *gin.Context) {
	var departmentCreateDTO model.DepartmentCreateDTO
	if err := c.BindJSON(&departmentCreateDTO); err != nil {
		log.Printf("[handler.DepartCreate] err = %v", err)
		sendFail(c, 5001, "创建部门失败:"+err.Error())
		return
	}
	var departmentCheck model.Department
	var result *gorm.DB
	// 找不到记录也会抛出ErrRecordNotFound错误，但这其实不算错误情况
	resource.HrmsDB(c).Where("dep_name = ?", departmentCreateDTO.DepName).First(&departmentCheck)
	if departmentCheck.DepName == departmentCreateDTO.DepName {
		log.Printf("[HrmsDB.Create] 部门已存在, dep = %v", departmentCheck)
		sendFail(c, 2001, "部门名称已存在")
		return
	}
	departmentCreate := model.Department{
		DepId:       service.RandomID("dep"),
		DepDescribe: departmentCreateDTO.DepDescribe,
		DepName:     departmentCreateDTO.DepName,
	}
	if result = resource.HrmsDB(c).Create(&departmentCreate); result.Error != nil {
		result.Rollback()
		log.Printf("[HrmsDB.Create] err = %v", result.Error)

		sendFail(c, 5001, "创建部门失败:"+result.Error.Error())
		return
	}
	if result = resource.HrmsDB(c).Where("id = ?", departmentCreate.ID); result.Error != nil {
		log.Printf("[HrmsDB.Create] 插入数据失败， departmentCreate = %v", departmentCreate)

		sendFail(c, 5001, "创建部门失败:"+result.Error.Error())
		return
	}
	sendSuccess(c, departmentCreate, "创建部门成功")
}

// 删除部门
// @Summary 删除部门
// @Tags 部门管理
// @Accept  json
// @Produce  json
// @Param dep_id path string true "部门ID"
// @Router /api/depart/del/{dep_id} [delete]
func DepartDel(c *gin.Context) {
	depId := c.Param("dep_id")
	if err := resource.HrmsDB(c).Where("dep_id = ?", depId).Delete(&model.Department{}).Error; err != nil {
		log.Printf("[DepartDel] err = %v", err)

		sendFail(c, 5001, "删除部门失败"+err.Error())
		return
	}

	sendSuccess(c, nil, "删除部门成功")
}

// 编辑部门
// @Summary 编辑部门
// @Tags 部门管理
// @Accept  json
// @Produce  json
// @Param department body model.DepartmentEditDTO true "部门信息"
// @Router /api/depart/edit [post]
func DepartEdit(c *gin.Context) {
	var departmentEditDTO model.DepartmentEditDTO
	if err := c.BindJSON(&departmentEditDTO); err != nil {
		log.Printf("[DepartEdit] err = %v", err)

		sendFail(c, 5001, "编辑部门失败:"+err.Error())
		return
	}
	resource.HrmsDB(c).Model(&model.Department{}).Where("dep_id = ?", departmentEditDTO.DepId).
		Updates(&model.Department{DepDescribe: departmentEditDTO.DepDescribe, DepName: departmentEditDTO.DepName})

	sendSuccess(c, nil, "编辑部门成功")
}

// 查询部门
// @Summary 查询部门
// @Tags 部门管理
// @Accept  json
// @Produce  json
// @Param dep_id path string true "部门ID"
// @Param page query int false "页码"
// @Param limit query int false "每页数量"
// @Router /api/depart/query/{dep_id} [get]
func DepartQuery(c *gin.Context) {
	var total int64 = 1
	// 分页
	start, limit := service.AcceptPage(c)
	depId := c.Param("dep_id")
	var deps []model.Department
	if depId == "all" {
		// 查询全部
		if start == -1 && start == -1 {
			resource.HrmsDB(c).Find(&deps)
		} else {
			resource.HrmsDB(c).Offset(start).Limit(limit).Find(&deps)
		}
		if len(deps) == 0 {
			// 不存在
			sendFail(c, 2001, "不存在")
			return
		}
		// 总记录数
		resource.HrmsDB(c).Model(&model.Department{}).Count(&total)

		sendTotalSuccess(c, deps, total, "")
		return
	}
	resource.HrmsDB(c).Where("dep_id = ?", depId).Find(&deps)
	if len(deps) == 0 {
		// 不存在
		sendFail(c, 2001, "不存在")
		return
	}
	total = int64(len(deps))

	sendTotalSuccess(c, deps, total, "")
}
