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
		insuranceGroup := v2Group.Group("/insurance")
		insuranceGroup.POST("/rate/create", CreateInsuranceRateV2)
		insuranceGroup.GET("/rate/query", GetInsuranceRatesV2)
		insuranceGroup.POST("/rate/edit", UpdateInsuranceRateV2)
		insuranceGroup.DELETE("/rate/delete/:id", DeleteInsuranceRateV2)
		insuranceGroup.POST("/calculate", CalculateInsuranceV2)
	})
}

// CreateInsuranceRateV2 创建保险费率
// @Summary 创建保险费率
// @Tags V2 Insurance
// @Accept json
// @Produce json
// @Param insurance_rate body model.SalaryV2InsuranceRateCreateDTO true "保险费率信息"
// @Success 200 {object} Response
// @Router /api/v2/insurance/rate/create [post]
func CreateInsuranceRateV2(c *gin.Context) {
	var dto model.SalaryV2InsuranceRateCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	// 前端传入的是元，转换为分
	if dto.MinBase > 0 {
		dto.MinBase = dto.MinBase * 100
	}
	if dto.MaxBase > 0 {
		dto.MaxBase = dto.MaxBase * 100
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.CreateInsuranceRateV2(c, &dto, staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "创建社保费率成功")
}

// GetInsuranceRatesV2 获取保险费率列表
// @Summary 获取保险费率列表
// @Tags V2 Insurance
// @Accept json
// @Produce json
// @Param insurance_type query string false "保险类型 (pension, medical, unemployment, housing, injury, maternity)"
// @Param start query int false "起始位置"
// @Param limit query int false "限制数量"
// @Success 200 {object} Response
// @Router /api/v2/insurance/rate/query [get]
func GetInsuranceRatesV2(c *gin.Context) {
	insuranceType := c.Query("insurance_type")
	start, _ := strconv.Atoi(c.DefaultQuery("start", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	insuranceRates, total, err := service.GetInsuranceRatesV2(c, insuranceType, start, limit)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  insuranceRates,
		"total": total,
	}, "查询社保费率成功")
}

// UpdateInsuranceRateV2 更新保险费率
// @Summary 更新保险费率
// @Tags V2 Insurance
// @Accept json
// @Produce json
// @Param insurance_rate body model.SalaryV2InsuranceRateEditDTO true "保险费率信息"
// @Success 200 {object} Response
// @Router /api/v2/insurance/rate/edit [post]
func UpdateInsuranceRateV2(c *gin.Context) {
	var dto model.SalaryV2InsuranceRateEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	// 前端传入的是元，转换为分
	if dto.MinBase > 0 {
		dto.MinBase = dto.MinBase * 100
	}
	if dto.MaxBase > 0 {
		dto.MaxBase = dto.MaxBase * 100
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.UpdateInsuranceRateV2(c, &dto, staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "更新社保费率成功")
}

// DeleteInsuranceRateV2 删除保险费率
// @Summary 删除保险费率
// @Tags V2 Insurance
// @Accept json
// @Produce json
// @Param id path int true "保险费率ID"
// @Success 200 {object} Response
// @Router /api/v2/insurance/rate/delete/{id} [delete]
func DeleteInsuranceRateV2(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.DeleteInsuranceRateV2(c, uint(id), staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "删除社保费率成功")
}

// CalculateInsuranceV2 计算保险费用
// @Summary 计算保险费用
// @Tags V2 Insurance
// @Accept json
// @Produce json
// @Param calculation body map[string]interface{} true "计算参数"
// @Success 200 {object} Response
// @Router /api/v2/insurance/calculate [post]
func CalculateInsuranceV2(c *gin.Context) {
	var params map[string]interface{}
	if err := c.ShouldBindJSON(&params); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	salary, ok := params["salary"].(float64)
	if !ok {
		sendFail(c, 400, "salary is required and must be a number")
		return
	}

	insuranceTypesInterface, ok := params["insurance_types"].([]interface{})
	if !ok {
		sendFail(c, 400, "insurance_types is required and must be an array")
		return
	}

	var insuranceTypes []string
	for _, t := range insuranceTypesInterface {
		if typeStr, ok := t.(string); ok {
			insuranceTypes = append(insuranceTypes, typeStr)
		}
	}

	result, err := service.CalculateInsuranceV2(c, salary, insuranceTypes)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"insurance_amounts": result,
	}, "计算社保费用成功")
}