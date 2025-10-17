package handler

import (
	"hrms/model"
	"hrms/resource"
	"hrms/service"
	"log"
	"strconv"

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

		// 打卡相关
		clockInGroup := r.Group("/clock_in")
		clockInGroup.POST("/create", CreateClockIn)
		clockInGroup.POST("/edit", UpdateClockInById)
		clockInGroup.GET("/query/:staff_id", GetClockInByStaffId)
		clockInGroup.GET("/query/all", GetClockInByStaffId)

		// 请假申请相关
		leaveGroup := r.Group("/leave_request")
		leaveGroup.POST("/create", CreateLeaveRequest)
		leaveGroup.POST("/edit", UpdateLeaveRequestById)
		leaveGroup.GET("/query/:staff_id", GetLeaveRequestByStaffId)
		leaveGroup.GET("/query/all", GetLeaveRequestByStaffId)
		leaveGroup.GET("/approve/query/:leader_staff_id", GetLeaveRequestApproveByLeaderStaffId)
		leaveGroup.GET("/approve/query/all", GetLeaveRequestApproveByLeaderStaffId)
		leaveGroup.GET("/approve_accept/:leaveId", ApproveLeaveAccept)
		leaveGroup.GET("/approve_reject/:leaveId", ApproveLeaveReject)

		// 补打卡申请相关
		punchGroup := r.Group("/punch_request")
		punchGroup.POST("/create", CreatePunchRequest)
		punchGroup.POST("/edit", UpdatePunchRequestById)
		punchGroup.GET("/query/:staff_id", GetPunchRequestByStaffId)
		punchGroup.GET("/query/all", GetPunchRequestByStaffId)
		punchGroup.GET("/approve/query/:leader_staff_id", GetPunchRequestApproveByLeaderStaffId)
		punchGroup.GET("/approve/query/all", GetPunchRequestApproveByLeaderStaffId)
		punchGroup.GET("/approve_accept/:punchId", ApprovePunchAccept)
		punchGroup.GET("/approve_reject/:punchId", ApprovePunchReject)
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
    sendFail(c, 5001, err.Error())
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
	if staffId == "" {
		staffId = "all"  // 处理 /query_history/all 路由
	}
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
	if leaderStaffId == "" {
		leaderStaffId = "all"  // 处理 /approve/query/all 路由
	}
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

// CreateClockIn godoc
// @Summary 创建打卡记录
// @Tags 打卡记录
// @Accept json
// @Produce json
// @Param data body model.ClockInCreateDTO true "打卡记录"
// @Success 200 {object} Response
// @Router /api/clock_in/create [post]
func CreateClockIn(c *gin.Context) {
	var dto model.ClockInCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "CREATE", "CLOCK_IN",
			"创建打卡记录失败", err.Error())
		log.Printf("[CreateClockIn] err = %v", err)
		sendFail(c, 5001, "打卡失败")
		return
	}

	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	err := service.CreateClockIn(c, &dto)
	if err != nil {
		log.Printf("[CreateClockIn] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "CREATE", "CLOCK_IN",
			"创建打卡记录失败: "+dto.StaffName+"-"+dto.Date, err.Error())
		sendFail(c, 5002, err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "CREATE", "CLOCK_IN",
		"创建打卡记录成功: "+dto.StaffName+"-"+dto.Date)
	sendSuccess(c, nil, "打卡成功")
}

// UpdateClockInById godoc
// @Summary 更新打卡记录
// @Tags 打卡记录
// @Accept json
// @Produce json
// @Param data body model.ClockInEditDTO true "更新打卡记录信息"
// @Success 200 {object} model.ClockInEditDTO
// @Router /api/clock_in/edit [post]
func UpdateClockInById(c *gin.Context) {
	var dto model.ClockInEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "CLOCK_IN",
			"更新打卡记录失败", err.Error())
		log.Printf("[UpdateClockInById] err = %v", err)
		sendFail(c, 5001, "更新失败")
		return
	}

	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	var originalClockIn model.ClockIn
	resource.HrmsDB(c).Where("id = ?", dto.Id).First(&originalClockIn)

	err := service.UpdateClockInById(c, &dto)
	if err != nil {
		log.Printf("[UpdateClockInById] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "CLOCK_IN",
			"更新打卡记录失败: "+originalClockIn.StaffName+"-"+originalClockIn.Date, err.Error())
		sendFail(c, 5002, "更新失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "CLOCK_IN",
		"更新打卡记录成功: "+originalClockIn.StaffName+"-"+originalClockIn.Date)
	sendSuccess(c, nil, "更新打卡记录成功")
}

// GetClockInByStaffId godoc
// @Summary 查询员工打卡记录
// @Tags 打卡记录
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Router /api/clock_in/query/{staff_id} [get]
// @Router /api/clock_in/query/all [get]
func GetClockInByStaffId(c *gin.Context) {
	staffId := c.Param("staff_id")
	if staffId == "" {
		staffId = "all"
	}
	start, limit := service.AcceptPage(c)
	list, total, err := service.GetClockInByStaffId(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetClockInByStaffId] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")
}

// CreateLeaveRequest godoc
// @Summary 创建请假申请
// @Tags 请假申请
// @Accept json
// @Produce json
// @Param data body model.LeaveRequestCreateDTO true "请假申请"
// @Success 200 {object} Response
// @Router /api/leave_request/create [post]
func CreateLeaveRequest(c *gin.Context) {
	var dto model.LeaveRequestCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "CREATE", "LEAVE_REQUEST",
			"创建请假申请失败", err.Error())
		log.Printf("[CreateLeaveRequest] err = %v", err)
		sendFail(c, 5001, "申请失败")
		return
	}

	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	err := service.CreateLeaveRequest(c, &dto)
	if err != nil {
		log.Printf("[CreateLeaveRequest] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "CREATE", "LEAVE_REQUEST",
			"创建请假申请失败: "+dto.StaffName+"-"+dto.StartDate+"至"+dto.EndDate, err.Error())
		sendFail(c, 5002, err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "CREATE", "LEAVE_REQUEST",
		"创建请假申请成功: "+dto.StaffName+"-"+dto.StartDate+"至"+dto.EndDate)
	sendSuccess(c, nil, "申请成功")
}

// UpdateLeaveRequestById godoc
// @Summary 更新请假申请
// @Tags 请假申请
// @Accept json
// @Produce json
// @Param data body model.LeaveRequestEditDTO true "更新请假申请信息"
// @Success 200 {object} model.LeaveRequestEditDTO
// @Router /api/leave_request/edit [post]
func UpdateLeaveRequestById(c *gin.Context) {
	var dto model.LeaveRequestEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "LEAVE_REQUEST",
			"更新请假申请失败", err.Error())
		log.Printf("[UpdateLeaveRequestById] err = %v", err)
		sendFail(c, 5001, "更新失败")
		return
	}

	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	var originalLeave model.LeaveRequest
	resource.HrmsDB(c).Where("id = ?", dto.Id).First(&originalLeave)

	err := service.UpdateLeaveRequestById(c, &dto)
	if err != nil {
		log.Printf("[UpdateLeaveRequestById] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "LEAVE_REQUEST",
			"更新请假申请失败: "+originalLeave.StaffName+"-"+originalLeave.StartDate+"至"+originalLeave.EndDate, err.Error())
		sendFail(c, 5002, "更新失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "LEAVE_REQUEST",
		"更新请假申请成功: "+originalLeave.StaffName+"-"+originalLeave.StartDate+"至"+originalLeave.EndDate)
	sendSuccess(c, nil, "更新请假申请成功")
}

// GetLeaveRequestByStaffId godoc
// @Summary 查询员工请假申请
// @Tags 请假申请
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Router /api/leave_request/query/{staff_id} [get]
// @Router /api/leave_request/query/all [get]
func GetLeaveRequestByStaffId(c *gin.Context) {
	staffId := c.Param("staff_id")
	if staffId == "" {
		staffId = "all"
	}
	start, limit := service.AcceptPage(c)
	list, total, err := service.GetLeaveRequestByStaffId(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetLeaveRequestByStaffId] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")
}

// GetLeaveRequestApproveByLeaderStaffId godoc
// @Summary 查询主管待审批的请假申请
// @Tags 请假申请
// @Accept json
// @Produce json
// @Param leader_staff_id path string true "主管员工ID"
// @Router /api/leave_request/approve/query/{leader_staff_id} [get]
// @Router /api/leave_request/approve/query/all [get]
func GetLeaveRequestApproveByLeaderStaffId(c *gin.Context) {
	leaderStaffId := c.Param("leader_staff_id")
	if leaderStaffId == "" {
		leaderStaffId = "all"
	}
	leaves, total, err := service.GetLeaveRequestApproveByLeaderStaffId(c, leaderStaffId)
	if err != nil {
		log.Printf("[GetLeaveRequestApproveByLeaderStaffId] err = %v", err)
		sendFail(c, 5002, err.Error())
		return
	}
	sendTotalSuccess(c, leaves, total, "")
}

// ApproveLeaveAccept godoc
// @Summary 审批通过请假申请
// @Tags 请假申请
// @Accept json
// @Produce json
// @Param leaveId path string true "请假申请ID"
// @Router /api/leave_request/approve_accept/{leaveId} [get]
func ApproveLeaveAccept(c *gin.Context) {
	leaveId := c.Param("leaveId")

	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	var leave model.LeaveRequest
	resource.HrmsDB(c).Where("leave_id = ?", leaveId).First(&leave)

	if err := service.ApproveLeaveAccept(c, leaveId, strconv.FormatUint(staffId, 10)); err != nil {
		LogOperationFailure(c, staffId, staffName, "UPDATE", "LEAVE_REQUEST",
			"审批请假失败: "+leave.StaffName+"-"+leave.StartDate+"至"+leave.EndDate, err.Error())
		sendFail(c, 5000, "审批操作失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "LEAVE_REQUEST",
		"审批请假通过: "+leave.StaffName+"-"+leave.StartDate+"至"+leave.EndDate)
	sendSuccess(c, nil, "审批通过成功")
}

// ApproveLeaveReject godoc
// @Summary 审批拒绝请假申请
// @Tags 请假申请
// @Accept json
// @Produce json
// @Param leaveId path string true "请假申请ID"
// @Router /api/leave_request/approve_reject/{leaveId} [get]
func ApproveLeaveReject(c *gin.Context) {
	leaveId := c.Param("leaveId")

	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	var leave model.LeaveRequest
	resource.HrmsDB(c).Where("leave_id = ?", leaveId).First(&leave)

	if err := service.ApproveLeaveReject(c, leaveId, strconv.FormatUint(staffId, 10)); err != nil {
		LogOperationFailure(c, staffId, staffName, "UPDATE", "LEAVE_REQUEST",
			"审批请假拒绝失败: "+leave.StaffName+"-"+leave.StartDate+"至"+leave.EndDate, err.Error())
		sendFail(c, 5000, "审批操作失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "LEAVE_REQUEST",
		"审批请假拒绝: "+leave.StaffName+"-"+leave.StartDate+"至"+leave.EndDate)
	sendSuccess(c, nil, "审批拒绝成功")
}

// CreatePunchRequest godoc
// @Summary 创建补打卡申请
// @Tags 补打卡申请
// @Accept json
// @Produce json
// @Param data body model.PunchRequestCreateDTO true "补打卡申请"
// @Success 200 {object} Response
// @Router /api/punch_request/create [post]
func CreatePunchRequest(c *gin.Context) {
	var dto model.PunchRequestCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "CREATE", "PUNCH_REQUEST",
			"创建补打卡申请失败", err.Error())
		log.Printf("[CreatePunchRequest] err = %v", err)
		sendFail(c, 5001, "申请失败")
		return
	}

	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	err := service.CreatePunchRequest(c, &dto)
	if err != nil {
		log.Printf("[CreatePunchRequest] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "CREATE", "PUNCH_REQUEST",
			"创建补打卡申请失败: "+dto.StaffName+"-"+dto.Date, err.Error())
		sendFail(c, 5002, err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "CREATE", "PUNCH_REQUEST",
		"创建补打卡申请成功: "+dto.StaffName+"-"+dto.Date)
	sendSuccess(c, nil, "申请成功")
}

// UpdatePunchRequestById godoc
// @Summary 更新补打卡申请
// @Tags 补打卡申请
// @Accept json
// @Produce json
// @Param data body model.PunchRequestEditDTO true "更新补打卡申请信息"
// @Success 200 {object} model.PunchRequestEditDTO
// @Router /api/punch_request/edit [post]
func UpdatePunchRequestById(c *gin.Context) {
	var dto model.PunchRequestEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "PUNCH_REQUEST",
			"更新补打卡申请失败", err.Error())
		log.Printf("[UpdatePunchRequestById] err = %v", err)
		sendFail(c, 5001, "更新失败")
		return
	}

	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	var originalPunch model.PunchRequest
	resource.HrmsDB(c).Where("id = ?", dto.Id).First(&originalPunch)

	err := service.UpdatePunchRequestById(c, &dto)
	if err != nil {
		log.Printf("[UpdatePunchRequestById] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "PUNCH_REQUEST",
			"更新补打卡申请失败: "+originalPunch.StaffName+"-"+originalPunch.Date, err.Error())
		sendFail(c, 5002, "更新失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "PUNCH_REQUEST",
		"更新补打卡申请成功: "+originalPunch.StaffName+"-"+originalPunch.Date)
	sendSuccess(c, nil, "更新补打卡申请成功")
}

// GetPunchRequestByStaffId godoc
// @Summary 查询员工补打卡申请
// @Tags 补打卡申请
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Router /api/punch_request/query/{staff_id} [get]
// @Router /api/punch_request/query/all [get]
func GetPunchRequestByStaffId(c *gin.Context) {
	staffId := c.Param("staff_id")
	if staffId == "" {
		staffId = "all"
	}
	start, limit := service.AcceptPage(c)
	list, total, err := service.GetPunchRequestByStaffId(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetPunchRequestByStaffId] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")
}

// GetPunchRequestApproveByLeaderStaffId godoc
// @Summary 查询主管待审批的补打卡申请
// @Tags 补打卡申请
// @Accept json
// @Produce json
// @Param leader_staff_id path string true "主管员工ID"
// @Router /api/punch_request/approve/query/{leader_staff_id} [get]
// @Router /api/punch_request/approve/query/all [get]
func GetPunchRequestApproveByLeaderStaffId(c *gin.Context) {
	leaderStaffId := c.Param("leader_staff_id")
	if leaderStaffId == "" {
		leaderStaffId = "all"
	}
	punches, total, err := service.GetPunchRequestApproveByLeaderStaffId(c, leaderStaffId)
	if err != nil {
		log.Printf("[GetPunchRequestApproveByLeaderStaffId] err = %v", err)
		sendFail(c, 5002, err.Error())
		return
	}
	sendTotalSuccess(c, punches, total, "")
}

// ApprovePunchAccept godoc
// @Summary 审批通过补打卡申请
// @Tags 补打卡申请
// @Accept json
// @Produce json
// @Param punchId path string true "补打卡申请ID"
// @Router /api/punch_request/approve_accept/{punchId} [get]
func ApprovePunchAccept(c *gin.Context) {
	punchId := c.Param("punchId")

	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	var punch model.PunchRequest
	resource.HrmsDB(c).Where("punch_id = ?", punchId).First(&punch)

	if err := service.ApprovePunchAccept(c, punchId, strconv.FormatUint(staffId, 10)); err != nil {
		LogOperationFailure(c, staffId, staffName, "UPDATE", "PUNCH_REQUEST",
			"审批补打卡失败: "+punch.StaffName+"-"+punch.Date, err.Error())
		sendFail(c, 5000, "审批操作失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "PUNCH_REQUEST",
		"审批补打卡通过: "+punch.StaffName+"-"+punch.Date)
	sendSuccess(c, nil, "审批通过成功")
}

// ApprovePunchReject godoc
// @Summary 审批拒绝补打卡申请
// @Tags 补打卡申请
// @Accept json
// @Produce json
// @Param punchId path string true "补打卡申请ID"
// @Router /api/punch_request/approve_reject/{punchId} [get]
func ApprovePunchReject(c *gin.Context) {
	punchId := c.Param("punchId")

	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	var punch model.PunchRequest
	resource.HrmsDB(c).Where("punch_id = ?", punchId).First(&punch)

	if err := service.ApprovePunchReject(c, punchId, strconv.FormatUint(staffId, 10)); err != nil {
		LogOperationFailure(c, staffId, staffName, "UPDATE", "PUNCH_REQUEST",
			"审批补打卡拒绝失败: "+punch.StaffName+"-"+punch.Date, err.Error())
		sendFail(c, 5000, "审批操作失败")
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "PUNCH_REQUEST",
		"审批补打卡拒绝: "+punch.StaffName+"-"+punch.Date)
	sendSuccess(c, nil, "审批拒绝成功")
}
