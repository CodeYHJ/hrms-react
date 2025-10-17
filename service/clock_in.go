package service

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"hrms/model"
	"hrms/resource"
	"log"
	"time"
)

func CreateClockIn(c *gin.Context, dto *model.ClockInCreateDTO) error {
	var total int64
	resource.HrmsDB(c).Model(&model.ClockIn{}).Where("staff_id = ? and date = ?", dto.StaffId, dto.Date).Count(&total)
	if total != 0 {
		return errors.New(fmt.Sprintf("该员工今日打卡记录已存在"))
	}
	var clockIn model.ClockIn
	Transfer(&dto, &clockIn)
	clockIn.ClockInId = RandomID("clock_in")
	if err := resource.HrmsDB(c).Create(&clockIn).Error; err != nil {
		log.Printf("CreateClockIn err = %v", err)
		return err
	}
	return nil
}

func UpdateClockInById(c *gin.Context, dto *model.ClockInEditDTO) error {
	var clockIn model.ClockIn
	Transfer(&dto, &clockIn)
	if err := resource.HrmsDB(c).Model(&model.ClockIn{}).Where("id = ?", dto.Id).
		Update("staff_id", clockIn.StaffId).
		Update("staff_name", clockIn.StaffName).
		Update("date", clockIn.Date).
		Update("check_in_time", clockIn.CheckInTime).
		Update("check_out_time", clockIn.CheckOutTime).
		Update("status", clockIn.Status).
		Error; err != nil {
		log.Printf("UpdateClockInById err = %v", err)
		return err
	}
	return nil
}

func GetClockInByStaffId(c *gin.Context, staffId string, start int, limit int) ([]*model.ClockIn, int64, error) {
	var clockIns []*model.ClockIn
	var err error
	if start == -1 && limit == -1 {
		if staffId != "all" {
			err = resource.HrmsDB(c).Where("staff_id = ?", staffId).Order("date desc").Find(&clockIns).Error
		} else {
			err = resource.HrmsDB(c).Order("date desc").Find(&clockIns).Error
		}
	} else {
		if staffId != "all" {
			err = resource.HrmsDB(c).Where("staff_id = ?", staffId).Offset(start).Limit(limit).Order("date desc").Find(&clockIns).Error
		} else {
			err = resource.HrmsDB(c).Offset(start).Limit(limit).Order("date desc").Find(&clockIns).Error
		}
	}
	if err != nil {
		return nil, 0, err
	}
	var total int64
	resource.HrmsDB(c).Model(&model.ClockIn{}).Count(&total)
	if staffId != "all" {
		total = int64(len(clockIns))
	}
	return clockIns, total, nil
}

func CreateLeaveRequest(c *gin.Context, dto *model.LeaveRequestCreateDTO) error {
	var leaveRequest model.LeaveRequest
	Transfer(&dto, &leaveRequest)
	leaveRequest.LeaveId = RandomID("leave")
	if err := resource.HrmsDB(c).Create(&leaveRequest).Error; err != nil {
		log.Printf("CreateLeaveRequest err = %v", err)
		return err
	}
	return nil
}

func UpdateLeaveRequestById(c *gin.Context, dto *model.LeaveRequestEditDTO) error {
	var leaveRequest model.LeaveRequest
	Transfer(&dto, &leaveRequest)
	if err := resource.HrmsDB(c).Model(&model.LeaveRequest{}).Where("id = ?", dto.Id).
		Update("staff_id", leaveRequest.StaffId).
		Update("staff_name", leaveRequest.StaffName).
		Update("start_date", leaveRequest.StartDate).
		Update("end_date", leaveRequest.EndDate).
		Update("leave_type", leaveRequest.LeaveType).
		Update("reason", leaveRequest.Reason).
		Update("approve_status", leaveRequest.ApproveStatus).
		Update("approver_id", leaveRequest.ApproverId).
		Error; err != nil {
		log.Printf("UpdateLeaveRequestById err = %v", err)
		return err
	}
	return nil
}

func GetLeaveRequestByStaffId(c *gin.Context, staffId string, start int, limit int) ([]*model.LeaveRequest, int64, error) {
	var leaveRequests []*model.LeaveRequest
	var err error
	if start == -1 && limit == -1 {
		if staffId != "all" {
			err = resource.HrmsDB(c).Where("staff_id = ?", staffId).Order("created_at desc").Find(&leaveRequests).Error
		} else {
			err = resource.HrmsDB(c).Order("created_at desc").Find(&leaveRequests).Error
		}
	} else {
		if staffId != "all" {
			err = resource.HrmsDB(c).Where("staff_id = ?", staffId).Offset(start).Limit(limit).Order("created_at desc").Find(&leaveRequests).Error
		} else {
			err = resource.HrmsDB(c).Offset(start).Limit(limit).Order("created_at desc").Find(&leaveRequests).Error
		}
	}
	if err != nil {
		return nil, 0, err
	}
	var total int64
	resource.HrmsDB(c).Model(&model.LeaveRequest{}).Count(&total)
	if staffId != "all" {
		total = int64(len(leaveRequests))
	}
	return leaveRequests, total, nil
}

func GetLeaveRequestApproveByLeaderStaffId(c *gin.Context, leaderStaffId string) ([]*model.LeaveRequest, int64, error) {
	var err error
	var leaves []*model.LeaveRequest
	
	if leaderStaffId == "all" {
		err = resource.HrmsDB(c).Where("approve_status = 0").Order("created_at desc").Find(&leaves).Error
		if err != nil {
			return nil, 0, err
		}
	} else {
		var staffs []*model.Staff
		resource.HrmsDB(c).Where("leader_staff_id = ?", leaderStaffId).Find(&staffs)
		if len(staffs) == 0 {
			return nil, 0, nil
		}
		for _, staff := range staffs {
			var leave []*model.LeaveRequest
			staffId := staff.StaffId
			resource.HrmsDB(c).Where("staff_id = ? and approve_status = 0", staffId).Find(&leave)
			if leave != nil {
				leaves = append(leaves, leave...)
			}
		}
		if err != nil {
			return nil, 0, err
		}
	}
	
	total := int64(len(leaves))
	return leaves, total, nil
}

func ApproveLeaveAccept(c *gin.Context, leaveId string, approverId string) error {
	return resource.HrmsDB(c).Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&model.LeaveRequest{}).Where("leave_id = ?", leaveId).
			Update("approve_status", 1).
			Update("approver_id", approverId).Error; err != nil {
			return err
		}
		
		var leave model.LeaveRequest
		tx.Where("leave_id = ?", leaveId).First(&leave)
		
		return UpdateAttendanceRecordForLeave(c, leave.StaffId, leave.StartDate, leave.EndDate, true)
	})
}

func ApproveLeaveReject(c *gin.Context, leaveId string, approverId string) error {
	return resource.HrmsDB(c).Model(&model.LeaveRequest{}).Where("leave_id = ?", leaveId).
		Update("approve_status", 2).
		Update("approver_id", approverId).Error
}

func CreatePunchRequest(c *gin.Context, dto *model.PunchRequestCreateDTO) error {
	var punchRequest model.PunchRequest
	Transfer(&dto, &punchRequest)
	punchRequest.PunchId = RandomID("punch")
	if err := resource.HrmsDB(c).Create(&punchRequest).Error; err != nil {
		log.Printf("CreatePunchRequest err = %v", err)
		return err
	}
	return nil
}

func UpdatePunchRequestById(c *gin.Context, dto *model.PunchRequestEditDTO) error {
	var punchRequest model.PunchRequest
	Transfer(&dto, &punchRequest)
	if err := resource.HrmsDB(c).Model(&model.PunchRequest{}).Where("id = ?", dto.Id).
		Update("staff_id", punchRequest.StaffId).
		Update("staff_name", punchRequest.StaffName).
		Update("date", punchRequest.Date).
		Update("requested_time", punchRequest.RequestedTime).
		Update("reason", punchRequest.Reason).
		Update("approve_status", punchRequest.ApproveStatus).
		Update("approver_id", punchRequest.ApproverId).
		Error; err != nil {
		log.Printf("UpdatePunchRequestById err = %v", err)
		return err
	}
	return nil
}

func GetPunchRequestByStaffId(c *gin.Context, staffId string, start int, limit int) ([]*model.PunchRequest, int64, error) {
	var punchRequests []*model.PunchRequest
	var err error
	if start == -1 && limit == -1 {
		if staffId != "all" {
			err = resource.HrmsDB(c).Where("staff_id = ?", staffId).Order("created_at desc").Find(&punchRequests).Error
		} else {
			err = resource.HrmsDB(c).Order("created_at desc").Find(&punchRequests).Error
		}
	} else {
		if staffId != "all" {
			err = resource.HrmsDB(c).Where("staff_id = ?", staffId).Offset(start).Limit(limit).Order("created_at desc").Find(&punchRequests).Error
		} else {
			err = resource.HrmsDB(c).Offset(start).Limit(limit).Order("created_at desc").Find(&punchRequests).Error
		}
	}
	if err != nil {
		return nil, 0, err
	}
	var total int64
	resource.HrmsDB(c).Model(&model.PunchRequest{}).Count(&total)
	if staffId != "all" {
		total = int64(len(punchRequests))
	}
	return punchRequests, total, nil
}

func GetPunchRequestApproveByLeaderStaffId(c *gin.Context, leaderStaffId string) ([]*model.PunchRequest, int64, error) {
	var err error
	var punches []*model.PunchRequest
	
	if leaderStaffId == "all" {
		err = resource.HrmsDB(c).Where("approve_status = 0").Order("created_at desc").Find(&punches).Error
		if err != nil {
			return nil, 0, err
		}
	} else {
		var staffs []*model.Staff
		resource.HrmsDB(c).Where("leader_staff_id = ?", leaderStaffId).Find(&staffs)
		if len(staffs) == 0 {
			return nil, 0, nil
		}
		for _, staff := range staffs {
			var punch []*model.PunchRequest
			staffId := staff.StaffId
			resource.HrmsDB(c).Where("staff_id = ? and approve_status = 0", staffId).Find(&punch)
			if punch != nil {
				punches = append(punches, punch...)
			}
		}
		if err != nil {
			return nil, 0, err
		}
	}
	
	total := int64(len(punches))
	return punches, total, nil
}

func ApprovePunchAccept(c *gin.Context, punchId string, approverId string) error {
	return resource.HrmsDB(c).Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&model.PunchRequest{}).Where("punch_id = ?", punchId).
			Update("approve_status", 1).
			Update("approver_id", approverId).Error; err != nil {
			return err
		}
		
		var punch model.PunchRequest
		tx.Where("punch_id = ?", punchId).First(&punch)
		
		return UpdateClockInForPunch(c, punch.StaffId, punch.Date, punch.RequestedTime)
	})
}

func ApprovePunchReject(c *gin.Context, punchId string, approverId string) error {
	return resource.HrmsDB(c).Model(&model.PunchRequest{}).Where("punch_id = ?", punchId).
		Update("approve_status", 2).
		Update("approver_id", approverId).Error
}

func UpdateAttendanceRecordForLeave(c *gin.Context, staffId, startDate, endDate string, isAdd bool) error {
	start, _ := time.Parse("2006-01-02", startDate)
	end, _ := time.Parse("2006-01-02", endDate)
	
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format("2006-01")
		var attendance model.AttendanceRecord
		resource.HrmsDB(c).Where("staff_id = ? and date = ?", staffId, dateStr).First(&attendance)
		
		if attendance.ID != 0 {
			if isAdd {
				attendance.LeaveDays++
			} else {
				attendance.LeaveDays--
			}
			resource.HrmsDB(c).Save(&attendance)
		}
	}
	return nil
}

func UpdateClockInForPunch(c *gin.Context, staffId, date, requestedTime string) error {
	var clockIn model.ClockIn
	resource.HrmsDB(c).Where("staff_id = ? and date = ?", staffId, date).First(&clockIn)
	
	if clockIn.ID != 0 {
		clockIn.CheckInTime = &requestedTime
		clockIn.Status = 0
		resource.HrmsDB(c).Save(&clockIn)
	}
	return nil
}