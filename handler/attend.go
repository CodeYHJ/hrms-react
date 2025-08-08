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
		log.Printf("[CreateAttendRecord] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5001,
			"result": err.Error(),
		})
		return
	}
	// 业务处理
	err := service.CreateAttendanceRecord(c, &dto)
	if err != nil {
		log.Printf("[CreateAttendRecord] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5002,
			"result": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"status": 2000,
	})
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
		log.Printf("[UpdateAttendRecordById] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5001,
			"result": err.Error(),
		})
		return
	}
	// 业务处理
	err := service.UpdateAttendRecordById(c, &dto)
	if err != nil {
		log.Printf("[UpdateSalaryRecordById] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5002,
			"result": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"status": 2000,
	})
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
	// 业务处理
	err := service.DelAttendRecordByAttendId(c, attendanceId)
	if err != nil {
		log.Printf("[DelAttendRecord] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5002,
			"result": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"status": 2000,
	})
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
	if err := service.Compute(c, attendId); err != nil {
		c.JSON(200, gin.H{
			"status": 5000,
			"err":    err,
		})
		return
	}
	c.JSON(200, gin.H{
		"status": 2000,
	})
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
	if err := resource.HrmsDB(c).Model(&model.AttendanceRecord{}).Where("attendance_id = ?", attendId).Update("approve", 2).Error; err != nil {
		c.JSON(200, gin.H{
			"status": 5000,
			"err":    err,
		})
		return
	}
	c.JSON(200, gin.H{
		"status": 2000,
	})
}
