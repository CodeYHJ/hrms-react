package handler

import (
	"hrms/model"
	"hrms/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

func init() {
	Register(func(r *gin.RouterGroup) {
		v2Group := r.Group("/v2")
		systemGroup := v2Group.Group("/system")
		systemGroup.POST("/parameter/create", CreateSystemParameterV2)
		systemGroup.GET("/parameter/query", GetSystemParametersV2)
		systemGroup.POST("/parameter/edit", UpdateSystemParameterV2)
		systemGroup.DELETE("/parameter/delete/:id", DeleteSystemParameterV2)
		systemGroup.GET("/parameter/value/:parameter_key", GetSystemParameterValueV2)
		
		historyGroup := v2Group.Group("/history")
		historyGroup.GET("/parameter/query", GetParameterHistoryV2)
		
		// 薪资模板路由
		templateGroup := v2Group.Group("/template")
		templateGroup.POST("/create", CreateSalaryTemplate)
		templateGroup.POST("/update", UpdateSalaryTemplate)
		templateGroup.DELETE("/delete/:template_id", DeleteSalaryTemplate)
		templateGroup.GET("/detail/:template_id", GetSalaryTemplate)
		templateGroup.GET("/query", QuerySalaryTemplates)
		templateGroup.POST("/apply", ApplySalaryTemplate)
		templateGroup.GET("/applicable/:staff_id", GetApplicableTemplates)
		templateGroup.PUT("/toggle/:template_id", ToggleTemplateStatus)
	})
}

// CreateSystemParameterV2 创建系统参数
// @Summary 创建系统参数
// @Tags V2 System
// @Accept json
// @Produce json
// @Param system_parameter body model.SalaryV2SystemParameterCreateDTO true "系统参数信息"
// @Success 200 {object} Response
// @Router /api/v2/system/parameter/create [post]
func CreateSystemParameterV2(c *gin.Context) {
	var dto model.SalaryV2SystemParameterCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.CreateSystemParameterV2(c, &dto, staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "创建系统参数成功")
}

// GetSystemParametersV2 获取系统参数列表
// @Summary 获取系统参数列表
// @Tags V2 System
// @Accept json
// @Produce json
// @Param category query string false "参数类别 (general, salary, tax, insurance, attendance)"
// @Param start query int false "起始位置"
// @Param limit query int false "限制数量"
// @Success 200 {object} Response
// @Router /api/v2/system/parameter/query [get]
func GetSystemParametersV2(c *gin.Context) {
	category := c.Query("category")
	start, _ := strconv.Atoi(c.DefaultQuery("start", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	systemParameters, total, err := service.GetSystemParametersV2(c, category, start, limit)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  systemParameters,
		"total": total,
	}, "查询系统参数成功")
}

// UpdateSystemParameterV2 更新系统参数
// @Summary 更新系统参数
// @Tags V2 System
// @Accept json
// @Produce json
// @Param system_parameter body model.SalaryV2SystemParameterEditDTO true "系统参数信息"
// @Success 200 {object} Response
// @Router /api/v2/system/parameter/edit [post]
func UpdateSystemParameterV2(c *gin.Context) {
	var dto model.SalaryV2SystemParameterEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.UpdateSystemParameterV2(c, &dto, staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "更新系统参数成功")
}

// DeleteSystemParameterV2 删除系统参数
// @Summary 删除系统参数
// @Tags V2 System
// @Accept json
// @Produce json
// @Param id path int true "系统参数ID"
// @Success 200 {object} Response
// @Router /api/v2/system/parameter/delete/{id} [delete]
func DeleteSystemParameterV2(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.DeleteSystemParameterV2(c, uint(id), staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "删除系统参数成功")
}

// GetSystemParameterValueV2 获取系统参数值
// @Summary 获取系统参数值
// @Tags V2 System
// @Accept json
// @Produce json
// @Param parameter_key path string true "参数键"
// @Success 200 {object} Response
// @Router /api/v2/system/parameter/value/{parameter_key} [get]
func GetSystemParameterValueV2(c *gin.Context) {
	parameterKey := c.Param("parameter_key")
	if parameterKey == "" {
		sendFail(c, 400, "parameter_key is required")
		return
	}

	value, err := service.GetSystemParameterValueV2(c, parameterKey)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"parameter_key": parameterKey,
		"value":        value,
	}, "获取系统参数值成功")
}

// GetParameterHistoryV2 获取参数变更历史
// @Summary 获取参数变更历史
// @Tags V2 History
// @Accept json
// @Produce json
// @Param parameter_type query string false "参数类型 (tax_bracket, insurance_rate, calculation_rule, system_parameter)"
// @Param parameter_id query string false "参数ID"
// @Param start query int false "起始位置"
// @Param limit query int false "限制数量"
// @Success 200 {object} Response
// @Router /api/v2/history/parameter/query [get]
func GetParameterHistoryV2(c *gin.Context) {
	parameterType := c.Query("parameter_type")
	parameterId := c.Query("parameter_id")
	start, _ := strconv.Atoi(c.DefaultQuery("start", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	history, total, err := service.GetParameterHistoryV2(c, parameterType, parameterId, start, limit)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  history,
		"total": total,
	}, "查询参数历史成功")
}