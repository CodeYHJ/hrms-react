package model

import "gorm.io/gorm"

type AttendanceRecord struct {
	gorm.Model
	AttendanceId string `gorm:"column:attendance_id" json:"attendance_id"`
	StaffId      string `gorm:"column:staff_id" json:"staff_id"`
	StaffName    string `gorm:"column:staff_name" json:"staff_name"`
	Date         string `gorm:"column:date" json:"date"`
	WorkDays     int64  `gorm:"column:work_days" json:"work_days"`
	LeaveDays    int64  `gorm:"column:leave_days" json:"leave_days"`
	OvertimeDays int64  `gorm:"column:overtime_days" json:"overtime_days"`
	Approve      int64  `gorm:"column:approve" json:"approve"`
}

type AttendanceRecordCreateDTO struct {
	StaffId      string `gorm:"column:staff_id" json:"staff_id"`
	StaffName    string `gorm:"column:staff_name" json:"staff_name"`
	Date         string `gorm:"column:date" json:"date"`
	WorkDays     int64  `gorm:"column:work_days" json:"work_days"`
	LeaveDays    int64  `gorm:"column:leave_days" json:"leave_days"`
	OvertimeDays int64  `gorm:"column:overtime_days" json:"overtime_days"`
}

type AttendanceRecordEditDTO struct {
	Id           int64
	StaffId      string `gorm:"column:staff_id" json:"staff_id"`
	StaffName    string `gorm:"column:staff_name" json:"staff_name"`
	Date         string `gorm:"column:date" json:"date"`
	WorkDays     int64  `gorm:"column:work_days" json:"work_days"`
	LeaveDays    int64  `gorm:"column:leave_days" json:"leave_days"`
	OvertimeDays int64  `gorm:"column:overtime_days" json:"overtime_days"`
}

type ClockIn struct {
	gorm.Model
	ClockInId    string  `gorm:"column:clock_in_id" json:"clock_in_id"`
	StaffId      string  `gorm:"column:staff_id" json:"staff_id"`
	StaffName    string  `gorm:"column:staff_name" json:"staff_name"`
	Date         string  `gorm:"column:date" json:"date"`
	CheckInTime  *string `gorm:"column:check_in_time" json:"check_in_time"`
	CheckOutTime *string `gorm:"column:check_out_time" json:"check_out_time"`
	Status       int64   `gorm:"column:status" json:"status"`
}

type ClockInCreateDTO struct {
	StaffId      string  `gorm:"column:staff_id" json:"staff_id"`
	StaffName    string  `gorm:"column:staff_name" json:"staff_name"`
	Date         string  `gorm:"column:date" json:"date"`
	CheckInTime  *string `gorm:"column:check_in_time" json:"check_in_time"`
	CheckOutTime *string `gorm:"column:check_out_time" json:"check_out_time"`
	Status       int64   `gorm:"column:status" json:"status"`
}

type ClockInEditDTO struct {
	Id           int64
	StaffId      string  `gorm:"column:staff_id" json:"staff_id"`
	StaffName    string  `gorm:"column:staff_name" json:"staff_name"`
	Date         string  `gorm:"column:date" json:"date"`
	CheckInTime  *string `gorm:"column:check_in_time" json:"check_in_time"`
	CheckOutTime *string `gorm:"column:check_out_time" json:"check_out_time"`
	Status       int64   `gorm:"column:status" json:"status"`
}

type LeaveRequest struct {
	gorm.Model
	LeaveId       string `gorm:"column:leave_id" json:"leave_id"`
	StaffId       string `gorm:"column:staff_id" json:"staff_id"`
	StaffName     string `gorm:"column:staff_name" json:"staff_name"`
	StartDate     string `gorm:"column:start_date" json:"start_date"`
	EndDate       string `gorm:"column:end_date" json:"end_date"`
	LeaveType     string `gorm:"column:leave_type" json:"leave_type"`
	Reason        string `gorm:"column:reason" json:"reason"`
	ApproveStatus int64  `gorm:"column:approve_status" json:"approve_status"`
	ApproverId    string `gorm:"column:approver_id" json:"approver_id"`
}

type LeaveRequestCreateDTO struct {
	StaffId       string `gorm:"column:staff_id" json:"staff_id"`
	StaffName     string `gorm:"column:staff_name" json:"staff_name"`
	StartDate     string `gorm:"column:start_date" json:"start_date"`
	EndDate       string `gorm:"column:end_date" json:"end_date"`
	LeaveType     string `gorm:"column:leave_type" json:"leave_type"`
	Reason        string `gorm:"column:reason" json:"reason"`
	ApproveStatus int64  `gorm:"column:approve_status" json:"approve_status"`
	ApproverId    string `gorm:"column:approver_id" json:"approver_id"`
}

type LeaveRequestEditDTO struct {
	Id            int64
	StaffId       string `gorm:"column:staff_id" json:"staff_id"`
	StaffName     string `gorm:"column:staff_name" json:"staff_name"`
	StartDate     string `gorm:"column:start_date" json:"start_date"`
	EndDate       string `gorm:"column:end_date" json:"end_date"`
	LeaveType     string `gorm:"column:leave_type" json:"leave_type"`
	Reason        string `gorm:"column:reason" json:"reason"`
	ApproveStatus int64  `gorm:"column:approve_status" json:"approve_status"`
	ApproverId    string `gorm:"column:approver_id" json:"approver_id"`
}

type PunchRequest struct {
	gorm.Model
	PunchId       string `gorm:"column:punch_id" json:"punch_id"`
	StaffId       string `gorm:"column:staff_id" json:"staff_id"`
	StaffName     string `gorm:"column:staff_name" json:"staff_name"`
	Date          string `gorm:"column:date" json:"date"`
	RequestedTime string `gorm:"column:requested_time" json:"requested_time"`
	Reason        string `gorm:"column:reason" json:"reason"`
	ApproveStatus int64  `gorm:"column:approve_status" json:"approve_status"`
	ApproverId    string `gorm:"column:approver_id" json:"approver_id"`
}

type PunchRequestCreateDTO struct {
	StaffId       string `gorm:"column:staff_id" json:"staff_id"`
	StaffName     string `gorm:"column:staff_name" json:"staff_name"`
	Date          string `gorm:"column:date" json:"date"`
	RequestedTime string `gorm:"column:requested_time" json:"requested_time"`
	Reason        string `gorm:"column:reason" json:"reason"`
	ApproveStatus int64  `gorm:"column:approve_status" json:"approve_status"`
	ApproverId    string `gorm:"column:approver_id" json:"approver_id"`
}

type PunchRequestEditDTO struct {
	Id            int64
	StaffId       string `gorm:"column:staff_id" json:"staff_id"`
	StaffName     string `gorm:"column:staff_name" json:"staff_name"`
	Date          string `gorm:"column:date" json:"date"`
	RequestedTime string `gorm:"column:requested_time" json:"requested_time"`
	Reason        string `gorm:"column:reason" json:"reason"`
	ApproveStatus int64  `gorm:"column:approve_status" json:"approve_status"`
	ApproverId    string `gorm:"column:approver_id" json:"approver_id"`
}
