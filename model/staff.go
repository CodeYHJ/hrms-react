package model

import (
	"gorm.io/gorm"
	"time"
)

type Staff struct {
	gorm.Model
	StaffId           string `gorm:"column:staff_id" json:"staff_id"`
	StaffName         string `gorm:"column:staff_name" json:"staff_name"`
	LeaderStaffId     string `gorm:"column:leader_staff_id" json:"leader_staff_id"`
	LeaderName        string `gorm:"column:leader_name" json:"leader_name"`
	Birthday          string `gorm:"column:birthday" json:"birthday"`
	IdentityNum       string `gorm:"column:identity_num" json:"identity_num"`
	Sex               int64  `gorm:"column:sex" json:"sex"`
	Nation            string `gorm:"column:nation" json:"nation"`
	School            string `gorm:"column:school" json:"school"`
	Major             string `gorm:"column:major" json:"major"`
	EduLevel          string `gorm:"column:edu_level" json:"edu_level"`
	BaseSalary        int64  `gorm:"column:base_salary" json:"base_salary"`
	CardNum           string `gorm:"column:card_num" json:"card_num"`
	RankId            string `gorm:"column:rank_id" json:"rank_id"`
	DepId             string `gorm:"column:dep_id" json:"dep_id"`
	Email             string `gorm:"column:email" json:"email"`
	Phone             int64  `gorm:"column:phone" json:"phone"`
	EntryDate         string `gorm:"column:entry_date" json:"entry_date"`
	Status            int64  `gorm:"column:status" json:"status"`            // 0=试用, 1=正式, 2=离职
	ProbationEndDate  *string `gorm:"column:probation_end_date" json:"probation_end_date"` // 试用期结束日期
	ResignationDate   *string `gorm:"column:resignation_date" json:"resignation_date"`    // 离职日期
	ResignationReason string `gorm:"column:resignation_reason" json:"resignation_reason"` // 离职原因
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         gorm.DeletedAt `gorm:"index"`
}

type StaffLifecycleLog struct {
	ID                uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	StaffId           string    `gorm:"column:staff_id" json:"staff_id"`
	ActionType        string    `gorm:"column:action_type" json:"action_type"` // onboard, promote, transfer, resign
	OldValue          string    `gorm:"column:old_value" json:"old_value"`
	NewValue          string    `gorm:"column:new_value" json:"new_value"`
	ActionDate        time.Time `gorm:"column:action_date" json:"action_date"`
	Operator          string    `gorm:"column:operator" json:"operator"`
	Remark            string    `gorm:"column:remark" json:"remark"`
	CreatedAt         time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt         time.Time `gorm:"column:updated_at" json:"updated_at"`
}

type StaffCreateDTO struct {
	StaffId           string `gorm:"column:staff_id" json:"staff_id" binding:"required"`
	StaffName         string `gorm:"column:staff_name" json:"staff_name" binding:"required"`
	LeaderStaffId     string `gorm:"column:leader_staff_id" json:"leader_staff_id"`
	LeaderName        string `gorm:"column:leader_name" json:"leader_name"`
	Birthday          string `gorm:"column:birthday" json:"birthday" binding:"required"`
	BirthdayStr       string `json:"birthday_str"`
	IdentityNum       string `gorm:"column:identity_num" json:"identity_num" binding:"required"`
	Sex               int64  `gorm:"column:sex" json:"sex" binding:"required"`
	SexStr            string `json:"sex_str"`
	Nation            string `gorm:"column:nation" json:"nation" binding:"required"`
	School            string `gorm:"column:school" json:"school" binding:"required"`
	Major             string `gorm:"column:major" json:"major" binding:"required"`
	EduLevel          string `gorm:"column:edu_level" json:"edu_level" binding:"required"`
	BaseSalary        int64  `gorm:"column:base_salary" json:"base_salary" binding:"required"`
	CardNum           string `gorm:"column:card_num" json:"card_num" binding:"required"`
	RankId            string `gorm:"column:rank_id" json:"rank_id" binding:"required"`
	DepId             string `gorm:"column:dep_id" json:"dep_id" binding:"required"`
	Email             string `gorm:"column:email" json:"email" binding:"required"`
	Phone             int64  `gorm:"column:phone" json:"phone" binding:"required"`
	EntryDate         string `gorm:"column:entry_date" json:"entry_date" binding:"required"`
	EntryDateStr      string `json:"entry_date_str"`
	Status            int64  `gorm:"column:status" json:"status"`            // 0=试用, 1=正式, 2=离职
	ProbationEndDate  *string `gorm:"column:probation_end_date" json:"probation_end_date"` // 试用期结束日期
	ResignationDate   *string `gorm:"column:resignation_date" json:"resignation_date"`    // 离职日期
	ResignationReason string `gorm:"column:resignation_reason" json:"resignation_reason"` // 离职原因
}

type StaffEditDTO struct {
	StaffId           string `json:"staff_id" binding:"required"`
	LeaderStaffId     string `gorm:"column:leader_staff_id" json:"leader_staff_id"`
	LeaderName        string `gorm:"column:leader_name" json:"leader_name"`
	StaffName         string `json:"staff_name"`
	BirthdayStr       string `json:"birthday_str"`
	IdentityNum       string `json:"identity_num"`
	SexStr            string `json:"sex_str"`
	Sex               int64  `gorm:"column:sex" json:"sex"`
	Nation            string `json:"nation"`
	School            string `json:"school"`
	Major             string `json:"major"`
	EduLevel          string `json:"edu_level"`
	BaseSalary        int64  `json:"base_salary"`
	CardNum           string `json:"card_num"`
	RankId            string `json:"rank_id"`
	DepId             string `json:"dep_id"`
	Email             string `json:"email"`
	Phone             int64  `gorm:"column:phone" json:"phone"`
	EntryDateStr      string `json:"entry_date_str"`
	Status            int64  `json:"status"`            // 0=试用, 1=正式, 2=离职
	ProbationEndDate  *string `json:"probation_end_date"` // 试用期结束日期
	ResignationDate   *string `json:"resignation_date"`    // 离职日期
	ResignationReason string `json:"resignation_reason"` // 离职原因
}

type StaffOnboardDTO struct {
	CandidateId       string `json:"candidate_id" binding:"required"`
	StaffId           string `json:"staff_id" binding:"required"`
	StaffName         string `json:"staff_name" binding:"required"`
	LeaderStaffId     string `json:"leader_staff_id"`
	LeaderName        string `json:"leader_name"`
	Birthday          string `json:"birthday" binding:"required"`
	IdentityNum       string `json:"identity_num" binding:"required"`
	Sex               int64  `json:"sex" binding:"required"`
	Nation            string `json:"nation" binding:"required"`
	School            string `json:"school" binding:"required"`
	Major             string `json:"major" binding:"required"`
	EduLevel          string `json:"edu_level" binding:"required"`
	BaseSalary        int64  `json:"base_salary" binding:"required"`
	CardNum           string `json:"card_num" binding:"required"`
	RankId            string `json:"rank_id" binding:"required"`
	DepId             string `json:"dep_id" binding:"required"`
	Email             string `json:"email" binding:"required"`
	Phone             int64  `json:"phone" binding:"required"`
	EntryDate         string `json:"entry_date" binding:"required"`
	ProbationEndDate  *string `json:"probation_end_date"` // 试用期结束日期
	ResignationDate   *string `json:"resignation_date"`    // 离职日期
	ResignationReason string `json:"resignation_reason"` // 离职原因
}

type StaffPromotionDTO struct {
	StaffId          string `json:"staff_id" binding:"required"`
	ProbationEndDate *string `json:"probation_end_date"` // 试用期结束日期
}

type StaffTransferDTO struct {
	StaffId string `json:"staff_id" binding:"required"`
	DepId   string `json:"dep_id" binding:"required"`
	RankId  string `json:"rank_id" binding:"required"`
}

type StaffResignationDTO struct {
	StaffId           string `json:"staff_id" binding:"required"`
	ResignationDate   *string `json:"resignation_date"`    // 离职日期
	ResignationReason string `json:"resignation_reason"` // 离职原因
}

type StaffVO struct {
	Staff
	DepName      string `json:"dep_name"`
	RankName     string `json:"rank_name"`
	UserTypeName string `json:"user_type_name"`
}

func (s Staff) TableName() string {
	return "staff"
}
