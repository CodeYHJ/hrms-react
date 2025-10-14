package handler

import (
	"hrms/model"
	"hrms/resource"
	"hrms/service"
	"log"

	"github.com/gin-gonic/gin"
)

func init() {
	Register(func(r *gin.RouterGroup) {
		attendGroup := r.Group("/attendance_record")
		attendGroup.POST("/create", CreateAttendRecord)
		attendGroup.DELETE("/delete/:attendance_id", DelAttendRecordByAttendId)
		attendGroup.POST("/edit", UpdateAttendRecordById)
		attendGroup.GET("/query/:staff_id", GetAttendRecordByStaffId)
		attendGroup.GET("/query_history/:staff_id", GetAttendRecordHistoryByStaffId)
		attendGroup.GET("/query_history/all", GetAttendRecordHistoryByStaffId)
		attendGroup.GET("/get_attend_record_is_pay/:staff_id/:date", GetAttendRecordIsPayByStaffIdAndDate)
		attendGroup.GET("/approve/query/:leader_staff_id", GetAttendRecordApproveByLeaderStaffId)
		attendGroup.GET("/approve/query/all", GetAttendRecordApproveByLeaderStaffId)
		attendGroup.GET("/approve_accept/:attendId", ApproveAccept)
		attendGroup.GET("/approve_reject/:attendId", ApproveReject)
	})
}

// CreateAttendRecord godoc
// @Summary 创建考勤记录
// @Tags 考勤记录
// @Accept json
// @Produce json
// @Param data body model.AttendanceRecordCreateDTO true "考勤记录"
// @Success 200 {object} Response
// @Router /api/attendance_record/create [post]
func CreateAttendRecord(c *gin.Context) {
	// 参数绑定
	var dto model.AttendanceRecordCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		// 获取操作用户信息用于失败日志
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "CREATE", "ATTENDANCE",
			"创建考勤记录失败", err.Error())
		log.Printf("[CreateAttendRecord] err = %v", err)
		sendFail(c, 5001, "上报失败")
		return
	}

	// 获取操作用户信息用于成功日志
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 业务处理
	err := service.CreateAttendanceRecord(c, &dto)
	if err != nil {
		log.Printf("[CreateAttendRecord] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "CREATE", "ATTENDANCE",
			"创建考勤记录失败: "+dto.StaffName+"-"+dto.Date, err.Error())
		sendFail(c, 5001, "上报失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "CREATE", "ATTENDANCE",
		"创建考勤记录成功: "+dto.StaffName+"-"+dto.Date)
	sendSuccess(c, nil, "上报考勤信息成功")
}

// UpdateAttendRecordById godoc
// @Summary 更新考勤记录
// @Tags 考勤记录
// @Accept json
// @Produce json
// @Param data body model.AttendanceRecordEditDTO true "更新考勤记录信息"
// @Success 200 {object} model.AttendanceRecordEditDTO
// @Router /api/attendance_record/edit [post]
func UpdateAttendRecordById(c *gin.Context) {
	// 参数绑定
	var dto model.AttendanceRecordEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		// 获取操作用户信息用于失败日志
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "ATTENDANCE",
			"更新考勤记录失败", err.Error())
		log.Printf("[UpdateAttendRecordById] err = %v", err)
		sendFail(c, 5001, "编辑失败")
		return
	}

	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 查询原考勤记录信息用于日志记录
	var originalRecord model.AttendanceRecord
	resource.HrmsDB(c).Where("id = ?", dto.Id).First(&originalRecord)

	// 业务处理
	err := service.UpdateAttendRecordById(c, &dto)
	if err != nil {
		log.Printf("[UpdateSalaryRecordById] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "ATTENDANCE",
			"更新考勤记录失败: "+originalRecord.StaffName+"-"+originalRecord.Date, err.Error())
		sendFail(c, 5002, "编辑失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "ATTENDANCE",
		"更新考勤记录成功: "+originalRecord.StaffName+"-"+originalRecord.Date)
	sendSuccess(c, nil, "编辑考勤信息成功")
}

// GetAttendRecordByStaffId godoc
// @Summary 查询员工考勤记录
// @Tags 考勤记录
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Router /api/attendance_record/query/{staff_id} [get]
func GetAttendRecordByStaffId(c *gin.Context) {
	// 参数绑定
	staffId := c.Param("staff_id")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetAttendRecordByStaffId(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetAttendRecordByStaffId] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")

}

// GetAttendRecordHistoryByStaffId godoc
// @Summary 查询员工历史考勤记录
// @Tags 考勤记录
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Router /api/attendance_record/query_history/{staff_id} [get]
// @Router /api/attendance_record/query_history/all [get]
func GetAttendRecordHistoryByStaffId(c *gin.Context) {
	// 参数绑定
	staffId := c.Param("staff_id")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetAttendRecordHistoryByStaffId(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetAttendRecordHistoryByStaffId] err = %v", err)

		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")

}

// DelAttendRecordByAttendId godoc
// @Summary 删除考勤记录
// @Tags 考勤记录
// @Accept json
// @Produce json
// @Param attendance_id path string true "考勤记录ID"
// @Router /api/attendance_record/delete/{attendance_id} [delete]
func DelAttendRecordByAttendId(c *gin.Context) {
	// 参数绑定
	attendanceId := c.Param("attendance_id")

	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 查询要删除的考勤记录信息用于日志记录
	var attendRecord model.AttendanceRecord
	resource.HrmsDB(c).Where("attendance_id = ?", attendanceId).First(&attendRecord)

	// 业务处理
	err := service.DelAttendRecordByAttendId(c, attendanceId)
	if err != nil {
		log.Printf("[DelAttendRecord] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "DELETE", "ATTENDANCE",
			"删除考勤记录失败: "+attendRecord.StaffName+"-"+attendRecord.Date, err.Error())
		sendFail(c, 5002, "删除失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "DELETE", "ATTENDANCE",
		"删除考勤记录成功: "+attendRecord.StaffName+"-"+attendRecord.Date)
	sendSuccess(c, nil, "删除考勤记录成功")
}

// GetAttendRecordIsPayByStaffIdAndDate godoc
// @Summary 查询员工指定月份考勤记录是否已结算
// @Tags 考勤记录
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Param date path string true "日期(格式：YYYY-MM)"
// @Router /api/attendance_record/get_attend_record_is_pay/{staff_id}/{date} [get]
func GetAttendRecordIsPayByStaffIdAndDate(c *gin.Context) {
	staffId := c.Param("staff_id")
	date := c.Param("date")
	isPay := service.GetAttendRecordIsPayByStaffIdAndDate(c, staffId, date)

	sendSuccess(c, isPay, "")
}

// GetAttendRecordApproveByLeaderStaffId godoc
// @Summary 查询主管待审批的考勤记录
// @Tags 考勤记录
// @Accept json
// @Produce json
// @Param leader_staff_id path string true "主管员工ID"
// @Router /api/attendance_record/approve/query/{leader_staff_id} [get]
// @Router /api/attendance_record/approve/query/all [get]
func GetAttendRecordApproveByLeaderStaffId(c *gin.Context) {
	leaderStaffId := c.Param("leader_staff_id")
	attends, total, err := service.GetAttendRecordApproveByLeaderStaffId(c, leaderStaffId)
	if err != nil {
		log.Printf("[GetAttendRecordApproveByLeaderStaffId] err = %v", err)
		sendFail(c, 5002, err.Error())
		return
	}
	sendTotalSuccess(c, attends, total, "")
}

// ApproveAccept godoc
// @Summary 审批通过考勤记录
// @Tags 考勤记录
// @Accept json
// @Produce json
// @Param attendId path string true "考勤记录ID"
// @Router /api/attendance_record/approve_accept/{attendId} [get]
func ApproveAccept(c *gin.Context) {
	attendId := c.Param("attendId")

	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 查询考勤记录信息用于日志记录
	var attendRecord model.AttendanceRecord
	resource.HrmsDB(c).Where("attendance_id = ?", attendId).First(&attendRecord)

	if err := service.Compute(c, attendId); err != nil {
		LogOperationFailure(c, staffId, staffName, "UPDATE", "ATTENDANCE",
			"审批考勤失败: "+attendRecord.StaffName+"-"+attendRecord.Date, err.Error())
		c.JSON(200, gin.H{
			"status": 5000,
			"err":    err,
		})
		sendFail(c, 5000, "审批操作失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "ATTENDANCE",
		"审批考勤通过: "+attendRecord.StaffName+"-"+attendRecord.Date)
	sendSuccess(c, nil, "审批通过成功")
}

// ApproveReject godoc
// @Summary 审批拒绝考勤记录
// @Tags 考勤记录
// @Accept json
// @Produce json
// @Param attendId path string true "考勤记录ID"
// @Router /api/attendance_record/approve_reject/{attendId} [get]
func ApproveReject(c *gin.Context) {
	attendId := c.Param("attendId")

	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 查询考勤记录信息用于日志记录
	var attendRecord model.AttendanceRecord
	resource.HrmsDB(c).Where("attendance_id = ?", attendId).First(&attendRecord)

	if err := resource.HrmsDB(c).Model(&model.AttendanceRecord{}).Where("attendance_id = ?", attendId).Update("approve", 2).Error; err != nil {
		LogOperationFailure(c, staffId, staffName, "UPDATE", "ATTENDANCE",
			"审批考勤拒绝失败: "+attendRecord.StaffName+"-"+attendRecord.Date, err.Error())
		sendFail(c, 5000, "审批操作失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "ATTENDANCE",
		"审批考勤拒绝: "+attendRecord.StaffName+"-"+attendRecord.Date)
	sendSuccess(c, nil, "审批拒绝成功")
}
