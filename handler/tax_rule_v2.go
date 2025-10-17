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
		taxGroup := v2Group.Group("/tax")
		taxGroup.POST("/bracket/create", CreateTaxBracketV2)
		taxGroup.GET("/bracket/query", GetTaxBracketsV2)
		taxGroup.POST("/bracket/edit", UpdateTaxBracketV2)
		taxGroup.DELETE("/bracket/delete/:id", DeleteTaxBracketV2)
		taxGroup.POST("/calculate", CalculateTaxV2)
	})
}

// CreateTaxBracketV2 创建税率区间
// @Summary 创建税率区间
// @Tags V2 Tax
// @Accept json
// @Produce json
// @Param tax_bracket body model.SalaryV2TaxBracketCreateDTO true "税率区间信息"
// @Success 200 {object} Response
// @Router /api/v2/tax/bracket/create [post]
func CreateTaxBracketV2(c *gin.Context) {
	var dto model.SalaryV2TaxBracketCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	// 前端传入的是元，转换为分
	dto.MinIncome = dto.MinIncome * 100
	dto.QuickDeduction = dto.QuickDeduction * 100
	if dto.MaxIncome > 0 {
		dto.MaxIncome = dto.MaxIncome * 100
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.CreateTaxBracketV2(c, &dto, staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "创建税率区间成功")
}

// GetTaxBracketsV2 获取税率区间列表
// @Summary 获取税率区间列表
// @Tags V2 Tax
// @Accept json
// @Produce json
// @Param start query int false "起始位置"
// @Param limit query int false "限制数量"
// @Success 200 {object} Response
// @Router /api/v2/tax/bracket/query [get]
func GetTaxBracketsV2(c *gin.Context) {
	start, _ := strconv.Atoi(c.DefaultQuery("start", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	taxBrackets, total, err := service.GetTaxBracketsV2(c, start, limit)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  taxBrackets,
		"total": total,
	}, "查询税率区间成功")
}

// UpdateTaxBracketV2 更新税率区间
// @Summary 更新税率区间
// @Tags V2 Tax
// @Accept json
// @Produce json
// @Param tax_bracket body model.SalaryV2TaxBracketEditDTO true "税率区间信息"
// @Success 200 {object} Response
// @Router /api/v2/tax/bracket/edit [post]
func UpdateTaxBracketV2(c *gin.Context) {
	var dto model.SalaryV2TaxBracketEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	// 前端传入的是元，转换为分
	dto.MinIncome = dto.MinIncome * 100
	dto.QuickDeduction = dto.QuickDeduction * 100
	if dto.MaxIncome > 0 {
		dto.MaxIncome = dto.MaxIncome * 100
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.UpdateTaxBracketV2(c, &dto, staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "更新税率区间成功")
}

// DeleteTaxBracketV2 删除税率区间
// @Summary 删除税率区间
// @Tags V2 Tax
// @Accept json
// @Produce json
// @Param id path int true "税率区间ID"
// @Success 200 {object} Response
// @Router /api/v2/tax/bracket/delete/{id} [delete]
func DeleteTaxBracketV2(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	staffId := getCurrentStaffId(c)
	staffIdStr := strconv.FormatUint(staffId, 10)
	if err := service.DeleteTaxBracketV2(c, uint(id), staffIdStr); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, nil, "删除税率区间成功")
}

// CalculateTaxV2 计算个人所得税
// @Summary 计算个人所得税
// @Tags V2 Tax
// @Accept json
// @Produce json
// @Param calculation body map[string]interface{} true "计算参数"
// @Success 200 {object} Response
// @Router /api/v2/tax/calculate [post]
func CalculateTaxV2(c *gin.Context) {
	var params map[string]interface{}
	if err := c.ShouldBindJSON(&params); err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	taxableIncome, ok := params["taxable_income"].(float64)
	if !ok {
		sendFail(c, 400, "taxable_income is required and must be a number")
		return
	}

	tax, err := service.CalculateTaxV2(c, int64(taxableIncome))
	if err != nil {
		sendFail(c, 500, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"tax": tax,
	}, "计算个税成功")
}