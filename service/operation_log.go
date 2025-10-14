package service

import (
	"fmt"
	"hrms/model"
	"hrms/resource"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OperationLogService struct{}

func NewOperationLogService() *OperationLogService {
	return &OperationLogService{}
}

func (s *OperationLogService) CreateOperationLog(c *gin.Context, logDTO model.OperationLogCreateDTO) error {
	log := model.OperationLog{
		StaffId:         logDTO.StaffId,
		StaffName:       logDTO.StaffName,
		OperationType:   logDTO.OperationType,
		OperationModule: logDTO.OperationModule,
		OperationDesc:   logDTO.OperationDesc,
		RequestMethod:   logDTO.RequestMethod,
		RequestUrl:      logDTO.RequestUrl,
		RequestParam:    logDTO.RequestParam,
		ResponseResult:  logDTO.ResponseResult,
		IpAddress:       logDTO.IpAddress,
		UserAgent:       logDTO.UserAgent,
		OperationStatus: logDTO.OperationStatus,
		ErrorMessage:    logDTO.ErrorMessage,
		OperationTime:   time.Now(),
	}

	result := resource.HrmsDB(c).Create(&log)
	if result.Error != nil {
		return fmt.Errorf("创建操作日志失败: %v", result.Error)
	}
	return nil
}

func (s *OperationLogService) GetOperationLogs(c *gin.Context, query model.OperationLogQuery) ([]model.OperationLog, int64, error) {
	var logs []model.OperationLog
	var total int64

	db := resource.HrmsDB(c).Model(&model.OperationLog{})

	if query.StaffId != 0 {
		db = db.Where("staff_id = ?", query.StaffId)
	}
	if query.StaffName != "" {
		db = db.Where("staff_name LIKE ?", "%"+query.StaffName+"%")
	}
	if query.OperationType != "" {
		db = db.Where("operation_type = ?", query.OperationType)
	}
	if query.OperationModule != "" {
		db = db.Where("operation_module = ?", query.OperationModule)
	}
	if query.OperationStatus != 0 {
		db = db.Where("operation_status = ?", query.OperationStatus)
	}
	if query.StartTime != "" {
		db = db.Where("operation_time >= ?", query.StartTime)
	}
	if query.EndTime != "" {
		db = db.Where("operation_time <= ?", query.EndTime)
	}

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("查询操作日志总数失败: %v", err)
	}

	if query.Page > 0 && query.PageSize > 0 {
		offset := (query.Page - 1) * query.PageSize
		db = db.Offset(offset).Limit(query.PageSize)
	}

	db = db.Order("operation_time DESC")

	if err := db.Find(&logs).Error; err != nil {
		return nil, 0, fmt.Errorf("查询操作日志失败: %v", err)
	}

	return logs, total, nil
}

func (s *OperationLogService) GetOperationLogById(c *gin.Context, logId uint64) (*model.OperationLog, error) {
	var log model.OperationLog
	result := resource.HrmsDB(c).Where("log_id = ?", logId).First(&log)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("操作日志不存在")
		}
		return nil, fmt.Errorf("查询操作日志失败: %v", result.Error)
	}
	return &log, nil
}

func (s *OperationLogService) DeleteOperationLog(c *gin.Context, logId uint64) error {
	result := resource.HrmsDB(c).Where("log_id = ?", logId).Delete(&model.OperationLog{})
	if result.Error != nil {
		return fmt.Errorf("删除操作日志失败: %v", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("操作日志不存在")
	}
	return nil
}

func (s *OperationLogService) DeleteOperationLogsByTime(c *gin.Context, endTime string) error {
	result := resource.HrmsDB(c).Where("operation_time <= ?", endTime).Delete(&model.OperationLog{})
	if result.Error != nil {
		return fmt.Errorf("批量删除操作日志失败: %v", result.Error)
	}
	return nil
}

func (s *OperationLogService) GetOperationLogStats(c *gin.Context, startTime, endTime string) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	db := resource.HrmsDB(c).Model(&model.OperationLog{})
	if startTime != "" {
		db = db.Where("operation_time >= ?", startTime)
	}
	if endTime != "" {
		db = db.Where("operation_time <= ?", endTime)
	}

	var totalLogs int64
	if err := db.Count(&totalLogs).Error; err != nil {
		return nil, fmt.Errorf("查询日志总数失败: %v", err)
	}
	stats["total_logs"] = totalLogs

	var successLogs int64
	if err := db.Where("operation_status = ?", 1).Count(&successLogs).Error; err != nil {
		return nil, fmt.Errorf("查询成功日志数失败: %v", err)
	}
	stats["success_logs"] = successLogs

	var failedLogs int64
	if err := db.Where("operation_status = ?", 0).Count(&failedLogs).Error; err != nil {
		return nil, fmt.Errorf("查询失败日志数失败: %v", err)
	}
	stats["failed_logs"] = failedLogs

	type ModuleCount struct {
		Module string `json:"module"`
		Count  int64  `json:"count"`
	}
	var moduleCounts []ModuleCount
	if err := db.Select("operation_module as module, COUNT(*) as count").
		Group("operation_module").Scan(&moduleCounts).Error; err != nil {
		return nil, fmt.Errorf("查询模块统计失败: %v", err)
	}
	stats["module_counts"] = moduleCounts

	type TypeCount struct {
		Type  string `json:"type"`
		Count int64  `json:"count"`
	}
	var typeCounts []TypeCount
	if err := db.Select("operation_type as type, COUNT(*) as count").
		Group("operation_type").Scan(&typeCounts).Error; err != nil {
		return nil, fmt.Errorf("查询类型统计失败: %v", err)
	}
	stats["type_counts"] = typeCounts

	return stats, nil
}

func (s *OperationLogService) LogOperation(c *gin.Context, staffId uint64, staffName, operationType, operationModule, operationDesc string, operationStatus int64, errorMessage string) error {
	clientIP := c.ClientIP()
	userAgent := c.Request.UserAgent()
	requestMethod := c.Request.Method
	requestURL := c.Request.URL.String()

	logDTO := model.OperationLogCreateDTO{
		StaffId:         staffId,
		StaffName:       staffName,
		OperationType:   operationType,
		OperationModule: operationModule,
		OperationDesc:   operationDesc,
		RequestMethod:   requestMethod,
		RequestUrl:      requestURL,
		IpAddress:       clientIP,
		UserAgent:       userAgent,
		OperationStatus: operationStatus,
		ErrorMessage:    errorMessage,
	}

	return s.CreateOperationLog(c, logDTO)
}

func (s *OperationLogService) GetOperationLogOptions() map[string]interface{} {
	return map[string]interface{}{
		"operation_types": []string{
			"CREATE", "UPDATE", "DELETE", "QUERY", "LOGIN", "LOGOUT", "EXPORT", "IMPORT",
		},
		"operation_modules": []string{
			"STAFF", "DEPARTMENT", "ATTENDANCE", "SALARY", "RECRUITMENT",
			"CANDIDATE", "EXAM", "RANK", "AUTHORITY", "NOTIFICATION",
		},
		"operation_statuses": []map[string]interface{}{
			{"value": 1, "label": "成功"},
			{"value": 0, "label": "失败"},
		},
	}
}
