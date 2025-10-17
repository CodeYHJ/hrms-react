package model

import (
	"time"
)

// SalaryTemplate 薪资结构模板
type SalaryTemplate struct {
	ID                  int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	TemplateID          string    `json:"template_id" gorm:"column:template_id;type:varchar(32);uniqueIndex;not null;comment:模板ID"`
	TemplateName        string    `json:"template_name" gorm:"column:template_name;type:varchar(100);not null;comment:模板名称"`
	TemplateDescription string    `json:"template_description" gorm:"column:template_description;type:text;comment:模板描述"`
	TemplateType        string    `json:"template_type" gorm:"column:template_type;type:varchar(20);not null;comment:模板类型：standard标准、custom自定义"`
	ApplicableRankIDs   string    `json:"applicable_rank_ids" gorm:"column:applicable_rank_ids;type:json;comment:适用职级ID列表"`
	ApplicableDepIDs    string    `json:"applicable_dep_ids" gorm:"column:applicable_dep_ids;type:json;comment:适用部门ID列表"`
	IsActive            bool      `json:"is_active" gorm:"column:is_active;type:tinyint(1);default:1;comment:是否启用，1启用，0禁用"`
	CreatedBy           string    `json:"created_by" gorm:"column:created_by;type:varchar(32);comment:创建人"`
	UpdatedBy           string    `json:"updated_by" gorm:"column:updated_by;type:varchar(32);comment:更新人"`
	CreatedAt           time.Time `json:"created_at" gorm:"column:created_at;type:datetime;default:CURRENT_TIMESTAMP;comment:创建时间"`
	UpdatedAt           time.Time `json:"updated_at" gorm:"column:updated_at;type:datetime;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;comment:更新时间"`
	DeletedAt           *time.Time `json:"deleted_at" gorm:"column:deleted_at;type:datetime;comment:软删除时间"`
}

func (SalaryTemplate) TableName() string {
	return "salary_v2_templates"
}

// SalaryTemplateItem 薪资模板项目
type SalaryTemplateItem struct {
	ID              int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	ItemID          string    `json:"item_id" gorm:"column:item_id;type:varchar(32);uniqueIndex;not null;comment:项目ID"`
	TemplateID      string    `json:"template_id" gorm:"column:template_id;type:varchar(32);index;not null;comment:模板ID"`
	ItemName        string    `json:"item_name" gorm:"column:item_name;type:varchar(100);not null;comment:项目名称"`
	ItemType        string    `json:"item_type" gorm:"column:item_type;type:varchar(20);not null;comment:项目类型：base基本工资、subsidy补贴、bonus奖金、commission提成、other其他"`
	CalculationType string    `json:"calculation_type" gorm:"column:calculation_type;type:varchar(20);not null;comment:计算类型：fixed固定金额、percentage百分比"`
	Amount          *int64    `json:"amount" gorm:"column:amount;type:bigint;comment:固定金额(分)"`
	Percentage      *float64  `json:"percentage" gorm:"column:percentage;type:decimal(5,2);comment:百分比"`
	BaseField       string    `json:"base_field" gorm:"column:base_field;type:varchar(50);comment:百分比计算基准字段"`
	SortOrder       int       `json:"sort_order" gorm:"column:sort_order;type:int;default:0;comment:排序顺序"`
	IsRequired      bool      `json:"is_required" gorm:"column:is_required;type:tinyint(1);default:0;comment:是否必填，1是，0否"`
	CreatedAt       time.Time `json:"created_at" gorm:"column:created_at;type:datetime;default:CURRENT_TIMESTAMP;comment:创建时间"`
	UpdatedAt       time.Time `json:"updated_at" gorm:"column:updated_at;type:datetime;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;comment:更新时间"`
	DeletedAt       *time.Time `json:"deleted_at" gorm:"column:deleted_at;type:datetime;comment:软删除时间"`
}

func (SalaryTemplateItem) TableName() string {
	return "salary_v2_template_items"
}

// SalaryTemplateWithItems 包含项目的薪资模板
type SalaryTemplateWithItems struct {
	SalaryTemplate
	Items []SalaryTemplateItem `json:"items"`
}

// TemplateApplyRequest 模板应用请求
type TemplateApplyRequest struct {
	TemplateID string `json:"template_id" binding:"required"`
	StaffID    string `json:"staff_id" binding:"required"`
	BaseSalary int64  `json:"base_salary" binding:"required"`
}

// TemplateApplyResponse 模板应用响应
type TemplateApplyResponse struct {
	Base      int64 `json:"base"`
	Subsidy   int64 `json:"subsidy"`
	Bonus     int64 `json:"bonus"`
	Commission int64 `json:"commission"`
	Other     int64 `json:"other"`
}

// TemplateQueryRequest 模板查询请求
type TemplateQueryRequest struct {
	TemplateID string `json:"template_id"`
	TemplateName string `json:"template_name"`
	TemplateType string `json:"template_type"`
	RankID      string `json:"rank_id"`
	DepID       string `json:"dep_id"`
	IsActive    *bool  `json:"is_active"`
	Page        int    `json:"page"`
	PageSize    int    `json:"page_size"`
}

// TemplateQueryResponse 模板查询响应
type TemplateQueryResponse struct {
	Total int64                  `json:"total"`
	Data  []SalaryTemplateWithItems `json:"data"`
}