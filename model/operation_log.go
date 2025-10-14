package model

import (
	"time"
)

type OperationLog struct {
	LogId           uint64    `gorm:"column:log_id;primaryKey;autoIncrement" json:"log_id"`
	StaffId         uint64    `gorm:"column:staff_id" json:"staff_id"`
	StaffName       string    `gorm:"column:staff_name" json:"staff_name"`
	OperationType   string    `gorm:"column:operation_type" json:"operation_type"`
	OperationModule string    `gorm:"column:operation_module" json:"operation_module"`
	OperationDesc   string    `gorm:"column:operation_desc" json:"operation_desc"`
	RequestMethod   string    `gorm:"column:request_method" json:"request_method"`
	RequestUrl      string    `gorm:"column:request_url" json:"request_url"`
	RequestParam    string    `gorm:"column:request_params;type:text" json:"request_params"`
	ResponseResult  string    `gorm:"column:response_result;type:text" json:"response_result"`
	IpAddress       string    `gorm:"column:ip_address" json:"ip_address"`
	UserAgent       string    `gorm:"column:user_agent" json:"user_agent"`
	OperationStatus int64     `gorm:"column:operation_status;default:1" json:"operation_status"`
	ErrorMessage    string    `gorm:"column:error_message;type:text" json:"error_message"`
	OperationTime   time.Time `gorm:"column:operation_time;default:CURRENT_TIMESTAMP" json:"operation_time"`
	CreatedAt       time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`
}

type OperationLogQuery struct {
	StaffId         uint64 `form:"staff_id"`
	StaffName       string `form:"staff_name"`
	OperationType   string `form:"operation_type"`
	OperationModule string `form:"operation_module"`
	OperationStatus int64  `form:"operation_status"`
	StartTime       string `form:"start_time"`
	EndTime         string `form:"end_time"`
	Page            int    `form:"page"`
	PageSize        int    `form:"page_size"`
}

type OperationLogCreateDTO struct {
	StaffId         uint64 `json:"staff_id" binding:"required"`
	StaffName       string `json:"staff_name" binding:"required"`
	OperationType   string `json:"operation_type" binding:"required"`
	OperationModule string `json:"operation_module" binding:"required"`
	OperationDesc   string `json:"operation_desc" binding:"required"`
	RequestMethod   string `json:"request_method"`
	RequestUrl      string `json:"request_url"`
	RequestParam    string `json:"request_params"`
	ResponseResult  string `json:"response_result"`
	IpAddress       string `json:"ip_address"`
	UserAgent       string `json:"user_agent"`
	OperationStatus int64  `json:"operation_status"`
	ErrorMessage    string `json:"error_message"`
}

func (o OperationLog) TableName() string {
	return "operation_log"
}
