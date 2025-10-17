package model

import (
	"gorm.io/gorm"
)

type SalaryV2ParameterHistory struct {
	gorm.Model
	ID                   uint   `gorm:"primaryKey" json:"id"`
	HistoryId            string `gorm:"column:history_id;uniqueIndex;not null" json:"history_id"`
	ParameterId          string `gorm:"column:parameter_id;not null" json:"parameter_id"`
	ParameterType        string `gorm:"column:parameter_type;not null" json:"parameter_type"` // tax_bracket, insurance_rate, calculation_rule, system_parameter
	OldValue             string `gorm:"column:old_value;type:text" json:"old_value"`
	NewValue             string `gorm:"column:new_value;type:text" json:"new_value"`
	ChangeReason         string `gorm:"column:change_reason" json:"change_reason"`
	ChangedBy            string `gorm:"column:changed_by;not null" json:"changed_by"`
	ChangeDate           string `gorm:"column:change_date;not null" json:"change_date"`
}

type SalaryV2ParameterHistoryCreateDTO struct {
	ParameterId          string `json:"parameter_id"`
	ParameterType        string `json:"parameter_type"`
	OldValue             string `json:"old_value"`
	NewValue             string `json:"new_value"`
	ChangeReason         string `json:"change_reason"`
	ChangedBy            string `json:"changed_by"`
	ChangeDate           string `json:"change_date"`
}

func (SalaryV2ParameterHistory) TableName() string {
	return "salary_v2_parameter_history"
}