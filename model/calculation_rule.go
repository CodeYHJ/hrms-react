package model

import (
	"gorm.io/gorm"
)

type SalaryV2CalculationRule struct {
	gorm.Model
	ID                   uint   `gorm:"primaryKey" json:"id"`
	CalculationRuleId    string `gorm:"column:calculation_rule_id;uniqueIndex;not null" json:"calculation_rule_id"`
	RuleType             string `gorm:"column:rule_type;not null" json:"rule_type"` // overtime, bonus_deduction, attendance_base, tax_threshold
	RuleName             string `gorm:"column:rule_name;not null" json:"rule_name"`
	RuleValue            float64 `gorm:"column:rule_value;not null" json:"rule_value"`
	RuleDescription      string `gorm:"column:rule_description" json:"rule_description"`
	IsActive             bool   `gorm:"column:is_active;default:true" json:"is_active"`
	EffectiveDate        string `gorm:"column:effective_date;not null" json:"effective_date"`
	CreatedBy            string `gorm:"column:created_by" json:"created_by"`
	UpdatedBy            string `gorm:"column:updated_by" json:"updated_by"`
}

type SalaryV2CalculationRuleCreateDTO struct {
	RuleType             string  `json:"rule_type"`
	RuleName             string  `json:"rule_name"`
	RuleValue            float64 `json:"rule_value"`
	RuleDescription      string  `json:"rule_description"`
	EffectiveDate        string  `json:"effective_date"`
}

type SalaryV2CalculationRuleEditDTO struct {
	ID                   uint    `json:"id"`
	RuleType             string  `json:"rule_type"`
	RuleName             string  `json:"rule_name"`
	RuleValue            float64 `json:"rule_value"`
	RuleDescription      string  `json:"rule_description"`
	IsActive             bool    `json:"is_active"`
	EffectiveDate        string  `json:"effective_date"`
}

func (SalaryV2CalculationRule) TableName() string {
	return "salary_v2_calculation_rules"
}