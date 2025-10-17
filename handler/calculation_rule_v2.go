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
		calculationGroup := v2Group.Group("/calculation")
		calculationGroup.POST("/rule/create", CreateCalculationRuleV2)
		calculationGroup.GET("/rule/query", GetCalculationRulesV2)
		calculationGroup.POST("/rule/edit", UpdateCalculationRuleV2)
		calculationGroup.DELETE("/rule/delete/:id", DeleteCalculationRuleV2)
		calculationGroup.GET("/rule/value/:rule_type", GetCalculationRuleValueV2)
	})
}

// CreateCalculationRuleV2 创建计算规则
// @Summary 创建计算规则
// @Tags V2 Calculation
// @Accept json
// @Produce json
// @Param calculation_rule body model.SalaryV2CalculationRuleCreateDTO true "计算规则信息"
// @Success 200 {object} Response
// @Router /api/v2/calculation/rule/create [post]
func CreateCalculationRuleV2(c *gin.Context) {
	var dto model.SalaryV2CalculationRuleCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.CreateCalculationRuleV2(c, &dto, staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "创建计算规则成功")
}

// GetCalculationRulesV2 获取计算规则列表
// @Summary 获取计算规则列表
// @Tags V2 Calculation
// @Accept json
// @Produce json
// @Param rule_type query string false "规则类型 (overtime, bonus_deduction, attendance_base, tax_threshold)"
// @Param start query int false "起始位置"
// @Param limit query int false "限制数量"
// @Success 200 {object} Response
// @Router /api/v2/calculation/rule/query [get]
func GetCalculationRulesV2(c *gin.Context) {
	ruleType := c.Query("rule_type")
	start, _ := strconv.Atoi(c.DefaultQuery("start", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	calculationRules, total, err := service.GetCalculationRulesV2(c, ruleType, start, limit)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  calculationRules,
		"total": total,
	}, "查询计算规则成功")
}

// UpdateCalculationRuleV2 更新计算规则
// @Summary 更新计算规则
// @Tags V2 Calculation
// @Accept json
// @Produce json
// @Param calculation_rule body model.SalaryV2CalculationRuleEditDTO true "计算规则信息"
// @Success 200 {object} Response
// @Router /api/v2/calculation/rule/edit [post]
func UpdateCalculationRuleV2(c *gin.Context) {
	var dto model.SalaryV2CalculationRuleEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.UpdateCalculationRuleV2(c, &dto, staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "更新计算规则成功")
}

// DeleteCalculationRuleV2 删除计算规则
// @Summary 删除计算规则
// @Tags V2 Calculation
// @Accept json
// @Produce json
// @Param id path int true "计算规则ID"
// @Success 200 {object} Response
// @Router /api/v2/calculation/rule/delete/{id} [delete]
func DeleteCalculationRuleV2(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.DeleteCalculationRuleV2(c, uint(id), staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "删除计算规则成功")
}

// GetCalculationRuleValueV2 获取计算规则值
// @Summary 获取计算规则值
// @Tags V2 Calculation
// @Accept json
// @Produce json
// @Param rule_type path string true "规则类型"
// @Success 200 {object} Response
// @Router /api/v2/calculation/rule/value/{rule_type} [get]
func GetCalculationRuleValueV2(c *gin.Context) {
	ruleType := c.Param("rule_type")
	if ruleType == "" {
		sendFail(c, 400, "rule_type is required")
		return
	}

	value, err := service.GetCalculationRuleValueV2(c, ruleType)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"rule_type": ruleType,
		"value":     value,
	}, "获取计算规则值成功")
}