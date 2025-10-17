package service

import (
	"fmt"
	"hrms/model"
	"hrms/resource"
	"log"
	"time"

	"gorm.io/gorm"
)

// AutoUpdateAttendanceReports 自动更新考勤报表
func AutoUpdateAttendanceReports() {
	// 遍历所有分公司数据库
	for dbName, db := range resource.DbMapper {
		log.Printf("开始处理分公司 %s 的考勤报表", dbName)
		
		// 获取当前时间
		now := time.Now()
		year := now.Year()
		month := now.Month()
		
		// 获取当月第一天和最后一天
		firstDay := time.Date(year, month, 1, 0, 0, 0, 0, time.Local)
		lastDay := firstDay.AddDate(0, 1, -1)
		
		// 格式化日期
		monthStr := fmt.Sprintf("%d-%02d", year, month)
		
		// 获取所有员工
		var staffs []model.Staff
		if err := db.Where("status != 2").Find(&staffs).Error; err != nil {
			log.Printf("获取员工列表失败: %v", err)
			continue
		}
		
		// 为每个员工计算考勤数据
		for _, staff := range staffs {
			attendanceData, err := calculateAttendanceData(db, staff.StaffId, firstDay, lastDay)
			if err != nil {
				log.Printf("计算员工 %s 考勤数据失败: %v", staff.StaffName, err)
				continue
			}
			
			// 检查是否已存在该月的考勤记录
			var existingRecord model.AttendanceRecord
			err = db.Where("staff_id = ? AND date = ?", staff.StaffId, monthStr).First(&existingRecord).Error
			
			if err == nil {
				// 更新现有记录
				existingRecord.WorkDays = attendanceData.WorkDays
				existingRecord.LeaveDays = attendanceData.LeaveDays
				existingRecord.OvertimeDays = attendanceData.OvertimeDays
				existingRecord.Approve = 1 // 自动批准
				
				if err := db.Save(&existingRecord).Error; err != nil {
					log.Printf("更新员工 %s 考勤记录失败: %v", staff.StaffName, err)
				} else {
					log.Printf("更新员工 %s 考勤记录成功", staff.StaffName)
				}
			} else if err == gorm.ErrRecordNotFound {
				// 创建新记录
				newRecord := model.AttendanceRecord{
					AttendanceId: RandomID("attendance_record"),
					StaffId:      staff.StaffId,
					StaffName:    staff.StaffName,
					Date:         monthStr,
					WorkDays:     attendanceData.WorkDays,
					LeaveDays:    attendanceData.LeaveDays,
					OvertimeDays: attendanceData.OvertimeDays,
					Approve:      1, // 自动批准
				}
				
				if err := db.Create(&newRecord).Error; err != nil {
					log.Printf("创建员工 %s 考勤记录失败: %v", staff.StaffName, err)
				} else {
					log.Printf("创建员工 %s 考勤记录成功", staff.StaffName)
				}
			} else {
				log.Printf("查询员工 %s 考勤记录失败: %v", staff.StaffName, err)
			}
		}
		
		log.Printf("分公司 %s 的考勤报表处理完成", dbName)
	}
}

// calculateAttendanceData 计算员工考勤数据
func calculateAttendanceData(db *gorm.DB, staffId string, firstDay, lastDay time.Time) (*model.AttendanceRecordCreateDTO, error) {
	// 初始化考勤数据
	attendanceData := &model.AttendanceRecordCreateDTO{
		StaffId:      staffId,
		WorkDays:     0,
		LeaveDays:    0,
		OvertimeDays: 0,
	}
	
	// 计算工作天数（基于打卡记录）
	var clockIns []model.ClockIn
	if err := db.Where("staff_id = ? AND date >= ? AND date <= ?", 
		staffId, firstDay.Format("2006-01-02"), lastDay.Format("2006-01-02")).
		Find(&clockIns).Error; err != nil {
		return nil, err
	}
	
	// 统计有效工作日
	for _, clockIn := range clockIns {
		if clockIn.CheckInTime != nil && clockIn.CheckOutTime != nil {
			attendanceData.WorkDays++
			
			// 简单的加班判断：如果下班时间超过18:30，算加班
			checkOutTime := *clockIn.CheckOutTime
			if len(checkOutTime) >= 5 {
				hour := int(checkOutTime[0]-'0')*10 + int(checkOutTime[1]-'0')
				minute := int(checkOutTime[3]-'0')*10 + int(checkOutTime[4]-'0')
				if hour > 18 || (hour == 18 && minute > 30) {
					attendanceData.OvertimeDays++
				}
			}
		}
	}
	
	// 计算请假天数（基于已批准的请假申请）
	var leaveRequests []model.LeaveRequest
	if err := db.Where("staff_id = ? AND approve_status = 1 AND ((start_date >= ? AND start_date <= ?) OR (end_date >= ? AND end_date <= ?))", 
		staffId, firstDay.Format("2006-01-02"), lastDay.Format("2006-01-02"), 
		firstDay.Format("2006-01-02"), lastDay.Format("2006-01-02")).
		Find(&leaveRequests).Error; err != nil {
		return nil, err
	}
	
	// 统计请假天数
	for _, leave := range leaveRequests {
		startDate, _ := time.Parse("2006-01-02", leave.StartDate)
		endDate, _ := time.Parse("2006-01-02", leave.EndDate)
		
		// 计算请假天数与当月的交集
		leaveStart := startDate
		if leaveStart.Before(firstDay) {
			leaveStart = firstDay
		}
		
		leaveEnd := endDate
		if leaveEnd.After(lastDay) {
			leaveEnd = lastDay
		}
		
		if !leaveEnd.Before(leaveStart) {
			days := int(leaveEnd.Sub(leaveStart).Hours()/24) + 1
			attendanceData.LeaveDays += int64(days)
		}
	}
	
	return attendanceData, nil
}