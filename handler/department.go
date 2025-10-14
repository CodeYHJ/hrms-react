package handler

import (
	"fmt"
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
		departGroup.GET("/tree", DepartTree)
		departGroup.GET("/list", DepartList)
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
		// 获取操作用户信息用于失败日志
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "CREATE", "DEPARTMENT",
			"创建部门失败", err.Error())
		log.Printf("[handler.DepartCreate] err = %v", err)
		sendFail(c, 5001, "添加部门失败:"+err.Error())
		return
	}

	// 获取操作用户信息用于成功日志
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	var departmentCheck model.Department
	var result *gorm.DB
	// 找不到记录也会抛出ErrRecordNotFound错误，但这其实不算错误情况
	resource.HrmsDB(c).Where("dep_name = ?", departmentCreateDTO.DepName).First(&departmentCheck)
	if departmentCheck.DepName == departmentCreateDTO.DepName {
		log.Printf("[HrmsDB.Create] 部门已存在, dep = %v", departmentCheck)
		LogOperationFailure(c, staffId, staffName, "CREATE", "DEPARTMENT",
			"创建部门失败: "+departmentCreateDTO.DepName, "部门已存在")
		sendFail(c, 2001, "部门已存在")
		return
	}
	// 确保parent_dep_id默认为'0'
	parentDepId := departmentCreateDTO.ParentDepId
	if parentDepId == "" {
		parentDepId = "0"
	}

	departmentCreate := model.Department{
		DepId:       service.RandomID("dep"),
		DepDescribe: departmentCreateDTO.DepDescribe,
		DepName:     departmentCreateDTO.DepName,
		ParentDepId: parentDepId,
	}
	if result = resource.HrmsDB(c).Create(&departmentCreate); result.Error != nil {
		result.Rollback()
		log.Printf("[HrmsDB.Create] err = %v", result.Error)
		LogOperationFailure(c, staffId, staffName, "CREATE", "DEPARTMENT",
			"创建部门失败: "+departmentCreateDTO.DepName, result.Error.Error())
		sendFail(c, 5001, "添加部门失败:"+result.Error.Error())
		return
	}
	if result = resource.HrmsDB(c).Where("id = ?", departmentCreate.ID); result.Error != nil {
		log.Printf("[HrmsDB.Create] 插入数据失败， departmentCreate = %v", departmentCreate)
		LogOperationFailure(c, staffId, staffName, "CREATE", "DEPARTMENT",
			"创建部门失败: "+departmentCreateDTO.DepName, result.Error.Error())
		sendFail(c, 5001, "添加部门失败:"+result.Error.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "CREATE", "DEPARTMENT",
		"创建部门成功: "+departmentCreateDTO.DepName)
	sendSuccess(c, departmentCreate, "添加部门成功")
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

	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 查询要删除的部门信息用于日志记录
	var department model.Department
	resource.HrmsDB(c).Where("dep_id = ?", depId).First(&department)

	if err := resource.HrmsDB(c).Where("dep_id = ?", depId).Delete(&model.Department{}).Error; err != nil {
		log.Printf("[DepartDel] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "DELETE", "DEPARTMENT",
			"删除部门失败: "+department.DepName, err.Error())
		sendFail(c, 5001, "删除失败"+err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "DELETE", "DEPARTMENT",
		"删除部门成功: "+department.DepName)
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
		// 获取操作用户信息用于失败日志
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "DEPARTMENT",
			"编辑部门失败", err.Error())
		log.Printf("[DepartEdit] err = %v", err)
		sendFail(c, 5001, "编辑部门失败:"+err.Error())
		return
	}

	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 查询原部门信息用于日志记录
	var originalDepartment model.Department
	resource.HrmsDB(c).Where("dep_id = ?", departmentEditDTO.DepId).First(&originalDepartment)

	// 确保parent_dep_id默认为'0'
	parentDepId := departmentEditDTO.ParentDepId
	if parentDepId == "" {
		parentDepId = "0"
	}

	result := resource.HrmsDB(c).Model(&model.Department{}).Where("dep_id = ?", departmentEditDTO.DepId).
		Updates(&model.Department{
			DepDescribe: departmentEditDTO.DepDescribe,
			DepName:     departmentEditDTO.DepName,
			ParentDepId: parentDepId,
		})

	if result.Error != nil {
		LogOperationFailure(c, staffId, staffName, "UPDATE", "DEPARTMENT",
			"编辑部门失败: "+originalDepartment.DepName, result.Error.Error())
		sendFail(c, 5001, "编辑部门失败:"+result.Error.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "DEPARTMENT",
		"编辑部门成功: "+originalDepartment.DepName)
	sendSuccess(c, nil, "编辑部门成功")
}

// 查询部门
// @Summary 查询部门
// @Tags 部门管理
// @Accept  json
// @Produce  json
// @Param dep_id path string true "部门ID，all为查询全部并返回树形结构"
// @Param page query int false "页码"
// @Param limit query int false "每页数量"
// @Router /api/depart/query/{dep_id} [get]
func DepartQuery(c *gin.Context) {
	var total int64 = 1
	// 分页
	// start, limit := service.AcceptPage(c)
	depId := c.Param("dep_id")
	var deps []model.Department

	if depId == "all" {
		// 查询全部并返回树形结构
		resource.HrmsDB(c).Find(&deps)
		if len(deps) == 0 {
			// 返回空树
			sendSuccess(c, []model.DepartmentTreeNode{}, "获取成功")
			return
		}
		// 构建部门树
		tree := model.BuildDepartmentTree(deps)
		fmt.Printf("tree = %v", tree)
		sendSuccess(c, tree, "获取成功")
		return
	}

	// 查询单个部门
	resource.HrmsDB(c).Where("dep_id = ?", depId).Find(&deps)
	if len(deps) == 0 {
		// 不存在
		sendFail(c, 2001, "不存在")
		return
	}
	total = int64(len(deps))
	sendTotalSuccess(c, deps, total, "")
}

// 获取部门树
// @Summary 获取部门树
// @Tags 部门管理
// @Accept  json
// @Produce  json
// @Router /api/depart/tree [get]
func DepartTree(c *gin.Context) {
	var deps []model.Department
	resource.HrmsDB(c).Find(&deps)

	if len(deps) == 0 {
		// 返回空树
		sendSuccess(c, []model.DepartmentTreeNode{}, "获取成功")
		return
	}

	// 构建部门树
	tree := model.BuildDepartmentTree(deps)
	sendSuccess(c, tree, "获取成功")
}

// 获取部门列表（扁平化）
// @Summary 获取部门列表
// @Tags 部门管理
// @Accept  json
// @Produce  json
// @Router /api/depart/list [get]
func DepartList(c *gin.Context) {
	var deps []model.Department
	resource.HrmsDB(c).Find(&deps)

	if len(deps) == 0 {
		sendFail(c, 2001, "不存在")
		return
	}

	sendSuccess(c, deps, "获取成功")
}
