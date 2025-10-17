package service

import (
	"encoding/json"
	"errors"
	"hrms/model"
	"hrms/resource"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Tax Bracket Services
func CreateTaxBracketV2(c *gin.Context, dto *model.SalaryV2TaxBracketCreateDTO, createdBy string) error {
	var taxBracket model.SalaryV2TaxBracket
	Transfer(&dto, &taxBracket)
	// 将元转换为分存储
	taxBracket.MinIncome = int64(dto.MinIncome * 100)
	taxBracket.MaxIncome = int64(dto.MaxIncome * 100)
	taxBracket.QuickDeduction = int64(dto.QuickDeduction * 100)
	taxBracket.TaxBracketId = RandomID("tax_bracket")
	taxBracket.CreatedBy = createdBy
	taxBracket.UpdatedBy = createdBy
	
	if err := resource.HrmsDB(c).Create(&taxBracket).Error; err != nil {
		log.Printf("CreateTaxBracketV2 err = %v", err)
		return err
	}
	return nil
}

func GetTaxBracketsV2(c *gin.Context, start int, limit int) ([]*model.SalaryV2TaxBracket, int64, error) {
	var taxBrackets []*model.SalaryV2TaxBracket
	var err error
	
	if start == -1 && limit == -1 {
		err = resource.HrmsDB(c).Where("is_active = ?", true).Order("min_income asc").Find(&taxBrackets).Error
	} else {
		err = resource.HrmsDB(c).Where("is_active = ?", true).Offset(start).Limit(limit).Order("min_income asc").Find(&taxBrackets).Error
	}
	
	if err != nil {
		return nil, 0, err
	}
	
	// 将分转换为元返回
	for _, bracket := range taxBrackets {
		bracket.MinIncome = bracket.MinIncome / 100
		if bracket.MaxIncome > 0 {
			bracket.MaxIncome = bracket.MaxIncome / 100
		}
		bracket.QuickDeduction = bracket.QuickDeduction / 100
	}
	
	var total int64
	resource.HrmsDB(c).Model(&model.SalaryV2TaxBracket{}).Where("is_active = ?", true).Count(&total)
	return taxBrackets, total, nil
}

func UpdateTaxBracketV2(c *gin.Context, dto *model.SalaryV2TaxBracketEditDTO, updatedBy string) error {
	var oldTaxBracket model.SalaryV2TaxBracket
	if err := resource.HrmsDB(c).First(&oldTaxBracket, dto.ID).Error; err != nil {
		return err
	}
	
	var taxBracket model.SalaryV2TaxBracket
	Transfer(&dto, &taxBracket)
	// 将元转换为分存储
	taxBracket.MinIncome = int64(dto.MinIncome * 100)
	taxBracket.MaxIncome = int64(dto.MaxIncome * 100)
	taxBracket.QuickDeduction = int64(dto.QuickDeduction * 100)
	taxBracket.UpdatedBy = updatedBy
	
	if err := resource.HrmsDB(c).Model(&model.SalaryV2TaxBracket{}).Where("id = ?", dto.ID).
		Updates(map[string]interface{}{
			"min_income":      taxBracket.MinIncome,
			"max_income":      taxBracket.MaxIncome,
			"tax_rate":        taxBracket.TaxRate,
			"quick_deduction": taxBracket.QuickDeduction,
			"description":     taxBracket.Description,
			"is_active":       taxBracket.IsActive,
			"effective_date":  taxBracket.EffectiveDate,
			"updated_by":      updatedBy,
		}).Error; err != nil {
		log.Printf("UpdateTaxBracketV2 err = %v", err)
		return err
	}
	
	// Record history
	oldValue, _ := json.Marshal(oldTaxBracket)
	newValue, _ := json.Marshal(taxBracket)
	recordParameterHistory(c, oldTaxBracket.TaxBracketId, "tax_bracket", string(oldValue), string(newValue), "Tax bracket updated", updatedBy)
	
	return nil
}

func DeleteTaxBracketV2(c *gin.Context, id uint, deletedBy string) error {
	var taxBracket model.SalaryV2TaxBracket
	if err := resource.HrmsDB(c).First(&taxBracket, id).Error; err != nil {
		return err
	}
	
	if err := resource.HrmsDB(c).Model(&model.SalaryV2TaxBracket{}).Where("id = ?", id).
		Update("is_active", false).Error; err != nil {
		log.Printf("DeleteTaxBracketV2 err = %v", err)
		return err
	}
	
	// Record history
	oldValue, _ := json.Marshal(taxBracket)
	recordParameterHistory(c, taxBracket.TaxBracketId, "tax_bracket", string(oldValue), "", "Tax bracket deleted", deletedBy)
	
	return nil
}

// Insurance Rate Services
func CreateInsuranceRateV2(c *gin.Context, dto *model.SalaryV2InsuranceRateCreateDTO, createdBy string) error {
	var insuranceRate model.SalaryV2InsuranceRate
	Transfer(&dto, &insuranceRate)
	// 将元转换为分存储
	if dto.MinBase > 0 {
		insuranceRate.MinBase = int64(dto.MinBase * 100)
	}
	if dto.MaxBase > 0 {
		insuranceRate.MaxBase = int64(dto.MaxBase * 100)
	}
	insuranceRate.InsuranceRateId = RandomID("insurance_rate")
	insuranceRate.CreatedBy = createdBy
	insuranceRate.UpdatedBy = createdBy
	
	if err := resource.HrmsDB(c).Create(&insuranceRate).Error; err != nil {
		log.Printf("CreateInsuranceRateV2 err = %v", err)
		return err
	}
	return nil
}

func GetInsuranceRatesV2(c *gin.Context, insuranceType string, start int, limit int) ([]*model.SalaryV2InsuranceRate, int64, error) {
	var insuranceRates []*model.SalaryV2InsuranceRate
	var err error
	var query *gorm.DB
	
	if insuranceType != "" {
		query = resource.HrmsDB(c).Where("insurance_type = ? and is_active = ?", insuranceType, true)
	} else {
		query = resource.HrmsDB(c).Where("is_active = ?", true)
	}
	
	if start == -1 && limit == -1 {
		err = query.Order("effective_date desc").Find(&insuranceRates).Error
	} else {
		err = query.Offset(start).Limit(limit).Order("effective_date desc").Find(&insuranceRates).Error
	}
	
	if err != nil {
		return nil, 0, err
	}
	
	// 将分转换为元返回
	for _, rate := range insuranceRates {
		if rate.MinBase > 0 {
			rate.MinBase = rate.MinBase / 100
		}
		if rate.MaxBase > 0 {
			rate.MaxBase = rate.MaxBase / 100
		}
	}
	
	var total int64
	query.Model(&model.SalaryV2InsuranceRate{}).Count(&total)
	return insuranceRates, total, nil
}

func UpdateInsuranceRateV2(c *gin.Context, dto *model.SalaryV2InsuranceRateEditDTO, updatedBy string) error {
	var oldInsuranceRate model.SalaryV2InsuranceRate
	if err := resource.HrmsDB(c).First(&oldInsuranceRate, dto.ID).Error; err != nil {
		return err
	}
	
	var insuranceRate model.SalaryV2InsuranceRate
	Transfer(&dto, &insuranceRate)
	// 将元转换为分存储
	if dto.MinBase > 0 {
		insuranceRate.MinBase = int64(dto.MinBase * 100)
	}
	if dto.MaxBase > 0 {
		insuranceRate.MaxBase = int64(dto.MaxBase * 100)
	}
	insuranceRate.UpdatedBy = updatedBy
	
	if err := resource.HrmsDB(c).Model(&model.SalaryV2InsuranceRate{}).Where("id = ?", dto.ID).
		Updates(map[string]interface{}{
			"insurance_type": insuranceRate.InsuranceType,
			"employee_rate":  insuranceRate.EmployeeRate,
			"employer_rate":  insuranceRate.EmployerRate,
			"min_base":       insuranceRate.MinBase,
			"max_base":       insuranceRate.MaxBase,
			"description":    insuranceRate.Description,
			"is_active":      insuranceRate.IsActive,
			"effective_date": insuranceRate.EffectiveDate,
			"updated_by":     updatedBy,
		}).Error; err != nil {
		log.Printf("UpdateInsuranceRateV2 err = %v", err)
		return err
	}
	
	// Record history
	oldValue, _ := json.Marshal(oldInsuranceRate)
	newValue, _ := json.Marshal(insuranceRate)
	recordParameterHistory(c, oldInsuranceRate.InsuranceRateId, "insurance_rate", string(oldValue), string(newValue), "Insurance rate updated", updatedBy)
	
	return nil
}

func DeleteInsuranceRateV2(c *gin.Context, id uint, deletedBy string) error {
	var insuranceRate model.SalaryV2InsuranceRate
	if err := resource.HrmsDB(c).First(&insuranceRate, id).Error; err != nil {
		return err
	}
	
	if err := resource.HrmsDB(c).Model(&model.SalaryV2InsuranceRate{}).Where("id = ?", id).
		Update("is_active", false).Error; err != nil {
		log.Printf("DeleteInsuranceRateV2 err = %v", err)
		return err
	}
	
	// Record history
	oldValue, _ := json.Marshal(insuranceRate)
	recordParameterHistory(c, insuranceRate.InsuranceRateId, "insurance_rate", string(oldValue), "", "Insurance rate deleted", deletedBy)
	
	return nil
}

// Calculation Rule Services
func CreateCalculationRuleV2(c *gin.Context, dto *model.SalaryV2CalculationRuleCreateDTO, createdBy string) error {
	var calculationRule model.SalaryV2CalculationRule
	Transfer(&dto, &calculationRule)
	calculationRule.CalculationRuleId = RandomID("calculation_rule")
	calculationRule.CreatedBy = createdBy
	calculationRule.UpdatedBy = createdBy
	
	if err := resource.HrmsDB(c).Create(&calculationRule).Error; err != nil {
		log.Printf("CreateCalculationRuleV2 err = %v", err)
		return err
	}
	return nil
}

func GetCalculationRulesV2(c *gin.Context, ruleType string, start int, limit int) ([]*model.SalaryV2CalculationRule, int64, error) {
	var calculationRules []*model.SalaryV2CalculationRule
	var err error
	var query *gorm.DB
	
	if ruleType != "" {
		query = resource.HrmsDB(c).Where("rule_type = ? and is_active = ?", ruleType, true)
	} else {
		query = resource.HrmsDB(c).Where("is_active = ?", true)
	}
	
	if start == -1 && limit == -1 {
		err = query.Order("rule_type asc, rule_name asc").Find(&calculationRules).Error
	} else {
		err = query.Offset(start).Limit(limit).Order("rule_type asc, rule_name asc").Find(&calculationRules).Error
	}
	
	if err != nil {
		return nil, 0, err
	}
	
	var total int64
	query.Model(&model.SalaryV2CalculationRule{}).Count(&total)
	return calculationRules, total, nil
}

func UpdateCalculationRuleV2(c *gin.Context, dto *model.SalaryV2CalculationRuleEditDTO, updatedBy string) error {
	var oldCalculationRule model.SalaryV2CalculationRule
	if err := resource.HrmsDB(c).First(&oldCalculationRule, dto.ID).Error; err != nil {
		return err
	}
	
	var calculationRule model.SalaryV2CalculationRule
	Transfer(&dto, &calculationRule)
	calculationRule.UpdatedBy = updatedBy
	
	if err := resource.HrmsDB(c).Model(&model.SalaryV2CalculationRule{}).Where("id = ?", dto.ID).
		Updates(map[string]interface{}{
			"rule_type":        calculationRule.RuleType,
			"rule_name":        calculationRule.RuleName,
			"rule_value":       calculationRule.RuleValue,
			"rule_description": calculationRule.RuleDescription,
			"is_active":        calculationRule.IsActive,
			"effective_date":   calculationRule.EffectiveDate,
			"updated_by":       updatedBy,
		}).Error; err != nil {
		log.Printf("UpdateCalculationRuleV2 err = %v", err)
		return err
	}
	
	// Record history
	oldValue, _ := json.Marshal(oldCalculationRule)
	newValue, _ := json.Marshal(calculationRule)
	recordParameterHistory(c, oldCalculationRule.CalculationRuleId, "calculation_rule", string(oldValue), string(newValue), "Calculation rule updated", updatedBy)
	
	return nil
}

func DeleteCalculationRuleV2(c *gin.Context, id uint, deletedBy string) error {
	var calculationRule model.SalaryV2CalculationRule
	if err := resource.HrmsDB(c).First(&calculationRule, id).Error; err != nil {
		return err
	}
	
	if err := resource.HrmsDB(c).Model(&model.SalaryV2CalculationRule{}).Where("id = ?", id).
		Update("is_active", false).Error; err != nil {
		log.Printf("DeleteCalculationRuleV2 err = %v", err)
		return err
	}
	
	// Record history
	oldValue, _ := json.Marshal(calculationRule)
	recordParameterHistory(c, calculationRule.CalculationRuleId, "calculation_rule", string(oldValue), "", "Calculation rule deleted", deletedBy)
	
	return nil
}

// System Parameter Services
func CreateSystemParameterV2(c *gin.Context, dto *model.SalaryV2SystemParameterCreateDTO, createdBy string) error {
	var systemParameter model.SalaryV2SystemParameter
	Transfer(&dto, &systemParameter)
	systemParameter.ParameterId = RandomID("parameter")
	systemParameter.CreatedBy = createdBy
	systemParameter.UpdatedBy = createdBy
	
	if err := resource.HrmsDB(c).Create(&systemParameter).Error; err != nil {
		log.Printf("CreateSystemParameterV2 err = %v", err)
		return err
	}
	return nil
}

func GetSystemParametersV2(c *gin.Context, category string, start int, limit int) ([]*model.SalaryV2SystemParameter, int64, error) {
	var systemParameters []*model.SalaryV2SystemParameter
	var err error
	var query *gorm.DB
	
	if category != "" {
		query = resource.HrmsDB(c).Where("parameter_category = ? and is_active = ?", category, true)
	} else {
		query = resource.HrmsDB(c).Where("is_active = ?", true)
	}
	
	if start == -1 && limit == -1 {
		err = query.Order("parameter_category asc, parameter_key asc").Find(&systemParameters).Error
	} else {
		err = query.Offset(start).Limit(limit).Order("parameter_category asc, parameter_key asc").Find(&systemParameters).Error
	}
	
	if err != nil {
		return nil, 0, err
	}
	
	var total int64
	query.Model(&model.SalaryV2SystemParameter{}).Count(&total)
	return systemParameters, total, nil
}

func UpdateSystemParameterV2(c *gin.Context, dto *model.SalaryV2SystemParameterEditDTO, updatedBy string) error {
	var oldSystemParameter model.SalaryV2SystemParameter
	if err := resource.HrmsDB(c).First(&oldSystemParameter, dto.ID).Error; err != nil {
		return err
	}
	
	var systemParameter model.SalaryV2SystemParameter
	Transfer(&dto, &systemParameter)
	systemParameter.UpdatedBy = updatedBy
	
	if err := resource.HrmsDB(c).Model(&model.SalaryV2SystemParameter{}).Where("id = ?", dto.ID).
		Updates(map[string]interface{}{
			"parameter_key":         systemParameter.ParameterKey,
			"parameter_value":       systemParameter.ParameterValue,
			"parameter_type":        systemParameter.ParameterType,
			"parameter_category":    systemParameter.ParameterCategory,
			"parameter_description": systemParameter.ParameterDescription,
			"is_editable":           systemParameter.IsEditable,
			"is_active":             systemParameter.IsActive,
			"updated_by":            updatedBy,
		}).Error; err != nil {
		log.Printf("UpdateSystemParameterV2 err = %v", err)
		return err
	}
	
	// Record history
	oldValue, _ := json.Marshal(oldSystemParameter)
	newValue, _ := json.Marshal(systemParameter)
	recordParameterHistory(c, oldSystemParameter.ParameterId, "system_parameter", string(oldValue), string(newValue), "System parameter updated", updatedBy)
	
	return nil
}

func DeleteSystemParameterV2(c *gin.Context, id uint, deletedBy string) error {
	var systemParameter model.SalaryV2SystemParameter
	if err := resource.HrmsDB(c).First(&systemParameter, id).Error; err != nil {
		return err
	}
	
	if err := resource.HrmsDB(c).Model(&model.SalaryV2SystemParameter{}).Where("id = ?", id).
		Update("is_active", false).Error; err != nil {
		log.Printf("DeleteSystemParameterV2 err = %v", err)
		return err
	}
	
	// Record history
	oldValue, _ := json.Marshal(systemParameter)
	recordParameterHistory(c, systemParameter.ParameterId, "system_parameter", string(oldValue), "", "System parameter deleted", deletedBy)
	
	return nil
}

// Parameter History Services
func GetParameterHistoryV2(c *gin.Context, parameterType string, parameterId string, start int, limit int) ([]*model.SalaryV2ParameterHistory, int64, error) {
	var history []*model.SalaryV2ParameterHistory
	var err error
	var query *gorm.DB
	
	if parameterType != "" && parameterId != "" {
		query = resource.HrmsDB(c).Where("parameter_type = ? and parameter_id = ?", parameterType, parameterId)
	} else if parameterType != "" {
		query = resource.HrmsDB(c).Where("parameter_type = ?", parameterType)
	} else {
		query = resource.HrmsDB(c)
	}
	
	if start == -1 && limit == -1 {
		err = query.Order("change_date desc").Find(&history).Error
	} else {
		err = query.Offset(start).Limit(limit).Order("change_date desc").Find(&history).Error
	}
	
	if err != nil {
		return nil, 0, err
	}
	
	var total int64
	query.Model(&model.SalaryV2ParameterHistory{}).Count(&total)
	return history, total, nil
}

// Helper function to record parameter history
func recordParameterHistory(c *gin.Context, parameterId string, parameterType string, oldValue string, newValue string, changeReason string, changedBy string) {
	history := model.SalaryV2ParameterHistory{
		HistoryId:     RandomID("history"),
		ParameterId:   parameterId,
		ParameterType: parameterType,
		OldValue:      oldValue,
		NewValue:      newValue,
		ChangeReason:  changeReason,
		ChangedBy:     changedBy,
		ChangeDate:    time.Now().Format("2006-01-02 15:04:05"),
	}
	
	if err := resource.HrmsDB(c).Create(&history).Error; err != nil {
		log.Printf("recordParameterHistory err = %v", err)
	}
}

// Salary Calculation Services using V2 parameters
func CalculateTaxV2(c *gin.Context, taxableIncome int64) (float64, error) {
	taxBrackets, _, err := GetTaxBracketsV2(c, -1, -1)
	if err != nil {
		return 0, err
	}
	
	if len(taxBrackets) == 0 {
		return 0, errors.New("no active tax brackets found")
	}
	
	var tax float64 = 0
	// 前端传入的是元，转换为分进行计算
	remainingIncome := taxableIncome * 100
	
	for _, bracket := range taxBrackets {
		if remainingIncome <= 0 {
			break
		}
		
		var taxableAmount int64
		if bracket.MaxIncome > 0 && remainingIncome > bracket.MaxIncome {
			taxableAmount = bracket.MaxIncome - bracket.MinIncome + 1
		} else {
			taxableAmount = remainingIncome - bracket.MinIncome + 1
		}
		
		if taxableAmount > 0 {
			tax += float64(taxableAmount) * bracket.TaxRate
			remainingIncome -= taxableAmount
		}
	}
	
	// Apply quick deduction for the applicable bracket
	for _, bracket := range taxBrackets {
		if taxableIncome*100 >= bracket.MinIncome && (bracket.MaxIncome == 0 || taxableIncome*100 <= bracket.MaxIncome) {
			tax -= float64(bracket.QuickDeduction)
			break
		}
	}
	
	// 返回元单位的税额
	return tax / 100, nil
}

func CalculateInsuranceV2(c *gin.Context, salary float64, insuranceTypes []string) (map[string]float64, error) {
	result := make(map[string]float64)
	
	for _, insuranceType := range insuranceTypes {
		rates, _, err := GetInsuranceRatesV2(c, insuranceType, -1, -1)
		if err != nil {
			return nil, err
		}
		
		if len(rates) == 0 {
			continue
		}
		
		// Use the most recent active rate
		rate := rates[0]
		// 前端传入的是元，转换为分进行计算
		var baseSalary float64 = salary * 100
		
		// Apply min/max base constraints
		if rate.MinBase > 0 && salary*100 < float64(rate.MinBase) {
			baseSalary = float64(rate.MinBase)
		}
		if rate.MaxBase > 0 && salary*100 > float64(rate.MaxBase) {
			baseSalary = float64(rate.MaxBase)
		}
		
		// 返回元单位的保险费用
		result[insuranceType] = (baseSalary * rate.EmployeeRate) / 100
	}
	
	return result, nil
}

func GetCalculationRuleValueV2(c *gin.Context, ruleType string) (float64, error) {
	rules, _, err := GetCalculationRulesV2(c, ruleType, -1, -1)
	if err != nil {
		return 0, err
	}
	
	if len(rules) == 0 {
		return 0, errors.New("no active calculation rules found for type: " + ruleType)
	}
	
	return rules[0].RuleValue, nil
}

// GetSystemParameter 获取系统参数值
func GetSystemParameter(c *gin.Context, parameterKey string) (*model.SalaryV2SystemParameter, error) {
	var parameter model.SalaryV2SystemParameter
	if err := resource.HrmsDB(c).Where("parameter_key = ? and is_active = ?", parameterKey, true).First(&parameter).Error; err != nil {
		return nil, err
	}
	
	return &parameter, nil
}

// GetCalculationRulesByType 根据类型获取计算规则
func GetCalculationRulesByType(c *gin.Context, ruleType string) ([]*model.SalaryV2CalculationRule, error) {
	rules, _, err := GetCalculationRulesV2(c, ruleType, -1, -1)
	if err != nil {
		return nil, err
	}
	return rules, nil
}

// GetInsuranceRates 获取社保费率
func GetInsuranceRates(c *gin.Context) ([]*model.SalaryV2InsuranceRate, error) {
	rates, _, err := GetInsuranceRatesV2(c, "", -1, -1)
	if err != nil {
		return nil, err
	}
	return rates, nil
}

// GetTaxBrackets 获取税率配置
func GetTaxBrackets(c *gin.Context) ([]*model.SalaryV2TaxBracket, error) {
	brackets, _, err := GetTaxBracketsV2(c, -1, -1)
	if err != nil {
		return nil, err
	}
	return brackets, nil
}

func GetSystemParameterValueV2(c *gin.Context, parameterKey string) (string, error) {
	var parameter model.SalaryV2SystemParameter
	if err := resource.HrmsDB(c).Where("parameter_key = ? and is_active = ?", parameterKey, true).First(&parameter).Error; err != nil {
		return "", err
	}
	
	return parameter.ParameterValue, nil
}