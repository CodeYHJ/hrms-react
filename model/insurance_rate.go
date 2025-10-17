package model

import (
	"gorm.io/gorm"
)

type SalaryV2InsuranceRate struct {
	gorm.Model
	ID                   uint   `gorm:"primaryKey" json:"id"`
	InsuranceRateId      string `gorm:"column:insurance_rate_id;uniqueIndex;not null" json:"insurance_rate_id"`
	InsuranceType        string `gorm:"column:insurance_type;not null" json:"insurance_type"` // pension, medical, unemployment, housing, injury, maternity
	EmployeeRate         float64 `gorm:"column:employee_rate;not null" json:"employee_rate"`
	EmployerRate         float64 `gorm:"column:employer_rate;not null" json:"employer_rate"`
	MinBase              int64  `gorm:"column:min_base" json:"min_base"`
	MaxBase              int64  `gorm:"column:max_base" json:"max_base"`
	Description          string `gorm:"column:description" json:"description"`
	IsActive             bool   `gorm:"column:is_active;default:true" json:"is_active"`
	EffectiveDate        string `gorm:"column:effective_date;not null" json:"effective_date"`
	CreatedBy            string `gorm:"column:created_by" json:"created_by"`
	UpdatedBy            string `gorm:"column:updated_by" json:"updated_by"`
}

type SalaryV2InsuranceRateCreateDTO struct {
	InsuranceType        string  `json:"insurance_type"`
	EmployeeRate         float64 `json:"employee_rate"`
	EmployerRate         float64 `json:"employer_rate"`
	MinBase              int64   `json:"min_base"`
	MaxBase              int64   `json:"max_base"`
	Description          string  `json:"description"`
	EffectiveDate        string  `json:"effective_date"`
}

type SalaryV2InsuranceRateEditDTO struct {
	ID                   uint    `json:"id"`
	InsuranceType        string  `json:"insurance_type"`
	EmployeeRate         float64 `json:"employee_rate"`
	EmployerRate         float64 `json:"employer_rate"`
	MinBase              int64   `json:"min_base"`
	MaxBase              int64   `json:"max_base"`
	Description          string  `json:"description"`
	IsActive             bool    `json:"is_active"`
	EffectiveDate        string  `json:"effective_date"`
}

func (SalaryV2InsuranceRate) TableName() string {
	return "salary_v2_insurance_rates"
}