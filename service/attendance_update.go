package service

import (
	"github.com/gin-gonic/gin"
	"hrms/model"
	"hrms/resource"
	"log"
	"time"
)

func UpdateAttendanceRecordFromClockIn(c *gin.Context, staffId string, date string) error {
	month := date[:7]
	
	var clockIns []*model.ClockIn
	startOfMonth := month + "-01"
	endOfMonth := month + "-31"
	
	resource.HrmsDB(c).Where("staff_id = ? and date >= ? and date <= ?", staffId, startOfMonth, endOfMonth).Find(&clockIns)
	
	var workDays int64 = 0
	var leaveDays int64 = 0
	var overtimeDays int64 = 0
	
	for _, clockIn := range clockIns {
		if clockIn.Status == 0 {
			workDays++
		} else if clockIn.Status == 3 {
			leaveDays++
		}
		if clockIn.CheckOutTime != nil {
			checkInTime, _ := time.Parse("2006-01-02 15:04:05", *clockIn.CheckInTime)
			checkOutTime, _ := time.Parse("2006-01-02 15:04:05", *clockIn.CheckOutTime)
			hours := checkOutTime.Sub(checkInTime).Hours()
			if hours > 9 {
				overtimeDays++
			}
		}
	}
	
	var attendance model.AttendanceRecord
	resource.HrmsDB(c).Where("staff_id = ? and date = ?", staffId, month).First(&attendance)
	
	if attendance.ID != 0 {
		attendance.WorkDays = workDays
		attendance.LeaveDays = leaveDays
		attendance.OvertimeDays = overtimeDays
		attendance.Approve = 0
		resource.HrmsDB(c).Save(&attendance)
	} else {
		newAttendance := model.AttendanceRecord{
			AttendanceId: RandomID("attendance_record"),
			StaffId:      staffId,
			Date:         month,
			WorkDays:     workDays,
			LeaveDays:    leaveDays,
			OvertimeDays: overtimeDays,
			Approve:      0,
		}
		if err := resource.HrmsDB(c).Create(&newAttendance).Error; err != nil {
			log.Printf("UpdateAttendanceRecordFromClockIn err = %v", err)
			return err
		}
	}
	
	return nil
}