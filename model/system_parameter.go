package model

import (
	"gorm.io/gorm"
)

type SalaryV2SystemParameter struct {
	gorm.Model
	ID                   uint   `gorm:"primaryKey" json:"id"`
	ParameterId          string `gorm:"column:parameter_id;uniqueIndex;not null" json:"parameter_id"`
	ParameterKey         string `gorm:"column:parameter_key;uniqueIndex;not null" json:"parameter_key"`
	ParameterValue       string `gorm:"column:parameter_value;not null" json:"parameter_value"`
	ParameterType        string `gorm:"column:parameter_type;not null" json:"parameter_type"` // string, number, boolean, json
	ParameterCategory    string `gorm:"column:parameter_category;not null" json:"parameter_category"` // general, salary, tax, insurance, attendance
	ParameterDescription string `gorm:"column:parameter_description" json:"parameter_description"`
	IsEditable           bool   `gorm:"column:is_editable;default:true" json:"is_editable"`
	IsActive             bool   `gorm:"column:is_active;default:true" json:"is_active"`
	CreatedBy            string `gorm:"column:created_by" json:"created_by"`
	UpdatedBy            string `gorm:"column:updated_by" json:"updated_by"`
}

type SalaryV2SystemParameterCreateDTO struct {
	ParameterKey         string `json:"parameter_key"`
	ParameterValue       string `json:"parameter_value"`
	ParameterType        string `json:"parameter_type"`
	ParameterCategory    string `json:"parameter_category"`
	ParameterDescription string `json:"parameter_description"`
	IsEditable           bool   `json:"is_editable"`
}

type SalaryV2SystemParameterEditDTO struct {
	ID                   uint    `json:"id"`
	ParameterKey         string  `json:"parameter_key"`
	ParameterValue       string  `json:"parameter_value"`
	ParameterType        string  `json:"parameter_type"`
	ParameterCategory    string  `json:"parameter_category"`
	ParameterDescription string  `json:"parameter_description"`
	IsEditable           bool    `json:"is_editable"`
	IsActive             bool    `json:"is_active"`
}

func (SalaryV2SystemParameter) TableName() string {
	return "salary_v2_parameters"
}