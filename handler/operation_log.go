package handler

import (
	"hrms/model"
	"hrms/service"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

var operationLogService = service.NewOperationLogService()

func init() {
	Register(func(r *gin.RouterGroup) {
		logGroup := r.Group("/operation-log")
		logGroup.GET("/query", GetOperationLogs)
		logGroup.GET("/query/:log_id", GetOperationLogById)
		logGroup.DELETE("/del/:log_id", DeleteOperationLog)
		logGroup.DELETE("/del_batch", DeleteOperationLogsByTime)
		logGroup.GET("/stats", GetOperationLogStats)
		logGroup.GET("/options", GetOperationLogOptions)
	})
}

func GetOperationLogs(c *gin.Context) {
	var query model.OperationLogQuery

	if staffIdStr := c.Query("staff_id"); staffIdStr != "" {
		if staffId, err := strconv.ParseUint(staffIdStr, 10, 64); err == nil {
			query.StaffId = staffId
		}
	}

	query.StaffName = c.Query("staff_name")
	query.OperationType = c.Query("operation_type")
	query.OperationModule = c.Query("operation_module")

	if statusStr := c.Query("operation_status"); statusStr != "" {
		if status, err := strconv.ParseInt(statusStr, 10, 64); err == nil {
			query.OperationStatus = status
		}
	}

	query.StartTime = c.Query("start_time")
	query.EndTime = c.Query("end_time")

	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil {
			query.Page = page
		}
	}

	if pageSizeStr := c.Query("page_size"); pageSizeStr != "" {
		if pageSize, err := strconv.Atoi(pageSizeStr); err == nil {
			query.PageSize = pageSize
		}
	}

	logs, total, err := operationLogService.GetOperationLogs(c, query)
	if err != nil {
		sendFail(c, 5001, "查询操作日志失败: "+err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"logs":  logs,
		"total": total,
		"page":  query.Page,
		"size":  query.PageSize,
	}, "")
}

func GetOperationLogById(c *gin.Context) {
	logIdStr := c.Param("log_id")
	logId, err := strconv.ParseUint(logIdStr, 10, 64)
	if err != nil {
		sendFail(c, 4001, "无效的日志ID")
		return
	}

	log, err := operationLogService.GetOperationLogById(c, logId)
	if err != nil {
		sendFail(c, 5001, "查询操作日志失败: "+err.Error())
		return
	}

	sendSuccess(c, log, "")
}

func DeleteOperationLog(c *gin.Context) {
	logIdStr := c.Param("log_id")
	logId, err := strconv.ParseUint(logIdStr, 10, 64)
	if err != nil {
		sendFail(c, 4001, "无效的日志ID")
		return
	}

	err = operationLogService.DeleteOperationLog(c, logId)
	if err != nil {
		sendFail(c, 5001, "删除操作日志失败: "+err.Error())
		return
	}

	sendSuccess(c, nil, "删除成功")
}

func DeleteOperationLogsByTime(c *gin.Context) {
	endTime := c.Query("end_time")
	if endTime == "" {
		sendFail(c, 4001, "请指定删除截止时间")
		return
	}

	err := operationLogService.DeleteOperationLogsByTime(c, endTime)
	if err != nil {
		sendFail(c, 5001, "批量删除操作日志失败: "+err.Error())
		return
	}

	sendSuccess(c, nil, "批量删除成功")
}

func GetOperationLogStats(c *gin.Context) {
	startTime := c.Query("start_time")
	endTime := c.Query("end_time")

	stats, err := operationLogService.GetOperationLogStats(c, startTime, endTime)
	if err != nil {
		sendFail(c, 5001, "查询操作日志统计失败: "+err.Error())
		return
	}

	sendSuccess(c, stats, "")
}

func GetOperationLogOptions(c *gin.Context) {
	options := operationLogService.GetOperationLogOptions()
	sendSuccess(c, options, "")
}

func LogOperation(c *gin.Context, staffId uint64, staffName, operationType, operationModule, operationDesc string, operationStatus int64, errorMessage string) {
	err := operationLogService.LogOperation(c, staffId, staffName, operationType, operationModule, operationDesc, operationStatus, errorMessage)
	if err != nil {
		// 记录日志失败不影响主要业务流程
	}
}

func LogOperationSuccess(c *gin.Context, staffId uint64, staffName, operationType, operationModule, operationDesc string) {
	LogOperation(c, staffId, staffName, operationType, operationModule, operationDesc, 1, "")
}

func LogOperationFailure(c *gin.Context, staffId uint64, staffName, operationType, operationModule, operationDesc, errorMessage string) {
	LogOperation(c, staffId, staffName, operationType, operationModule, operationDesc, 0, errorMessage)
}

func getCurrentStaffId(c *gin.Context) uint64 {
	cookie, err := c.Cookie("user_cookie")
	if err != nil || cookie == "" {
		return 0
	}
	user := strings.Split(cookie, "_")
	if len(user) < 4 {
		return 0
	}
	staffIdStr := user[1]
	if staffId, err := strconv.ParseUint(staffIdStr, 10, 64); err == nil {
		return staffId
	}
	return 0
}

func getCurrentStaffName(c *gin.Context) string {
	cookie, err := c.Cookie("user_cookie")
	if err != nil || cookie == "" {
		return ""
	}
	user := strings.Split(cookie, "_")
	if len(user) < 4 {
		return ""
	}
	userName := base64Decode(user[3])
	return userName
}
