package model

import (
	"gorm.io/gorm"
)

type SalaryV2TaxBracket struct {
	gorm.Model
	ID                 uint   `gorm:"primaryKey" json:"id"`
	TaxBracketId       string `gorm:"column:tax_bracket_id;uniqueIndex;not null" json:"tax_bracket_id"`
	MinIncome          int64  `gorm:"column:min_income;not null" json:"min_income"`
	MaxIncome          int64  `gorm:"column:max_income" json:"max_income"`
	TaxRate            float64 `gorm:"column:tax_rate;not null" json:"tax_rate"`
	QuickDeduction     int64  `gorm:"column:quick_deduction;not null" json:"quick_deduction"`
	Description        string `gorm:"column:description" json:"description"`
	IsActive           bool   `gorm:"column:is_active;default:true" json:"is_active"`
	EffectiveDate      string `gorm:"column:effective_date;not null" json:"effective_date"`
	CreatedBy          string `gorm:"column:created_by" json:"created_by"`
	UpdatedBy          string `gorm:"column:updated_by" json:"updated_by"`
}

type SalaryV2TaxBracketCreateDTO struct {
	MinIncome          int64   `json:"min_income"`
	MaxIncome          int64   `json:"max_income"`
	TaxRate            float64 `json:"tax_rate"`
	QuickDeduction     int64   `json:"quick_deduction"`
	Description        string  `json:"description"`
	EffectiveDate      string  `json:"effective_date"`
}

type SalaryV2TaxBracketEditDTO struct {
	ID                 uint    `json:"id"`
	MinIncome          int64   `json:"min_income"`
	MaxIncome          int64   `json:"max_income"`
	TaxRate            float64 `json:"tax_rate"`
	QuickDeduction     int64   `json:"quick_deduction"`
	Description        string  `json:"description"`
	IsActive           bool    `json:"is_active"`
	EffectiveDate      string  `json:"effective_date"`
}

func (SalaryV2TaxBracket) TableName() string {
	return "salary_v2_tax_brackets"
}