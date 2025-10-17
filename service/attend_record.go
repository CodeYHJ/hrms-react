package service

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"hrms/model"
	"hrms/resource"
	"log"
	"math"
	"strconv"
)

func CreateAttendanceRecord(c *gin.Context, dto *model.AttendanceRecordCreateDTO) error {
	var total int64
	resource.HrmsDB(c).Model(&model.AttendanceRecord{}).Where("staff_id = ? and date = ?", dto.StaffId, dto.Date).Count(&total)
	if total != 0 {
		return errors.New(fmt.Sprintf("该月考勤数据已经存在"))
	}
	var attendanceRecord model.AttendanceRecord
	Transfer(&dto, &attendanceRecord)
	attendanceRecord.AttendanceId = RandomID("attendance_record")
	if err := resource.HrmsDB(c).Create(&attendanceRecord).Error; err != nil {
		log.Printf("CreateAttendanceRecord err = %v", err)
		return err
	}
	return nil
}

func DelAttendRecordByAttendId(c *gin.Context, attendanceId string) error {
	if err := resource.HrmsDB(c).Where("attendance_id = ?", attendanceId).Delete(&model.AttendanceRecord{}).
		Error; err != nil {
		log.Printf("DelAttendRecordByAttendId err = %v", err)
		return err
	}
	return nil
}

func UpdateAttendRecordById(c *gin.Context, dto *model.AttendanceRecordEditDTO) error {
	var attentRecord model.AttendanceRecord
	Transfer(&dto, &attentRecord)
	if err := resource.HrmsDB(c).Model(&model.AttendanceRecord{}).Where("id = ?", attentRecord.ID).
		Update("staff_id", attentRecord.StaffId).
		Update("staff_name", attentRecord.StaffName).
		Update("overtime_days", attentRecord.OvertimeDays).
		Update("leave_days", attentRecord.LeaveDays).
		Update("work_days", attentRecord.WorkDays).
		Update("date", attentRecord.Date).
		Update("approve", 0).
		Error; err != nil {
		log.Printf("UpdateAttendRecordById err = %v", err)
		return err
	}
	
	// 同步更新打卡记录
	return UpdateAttendanceRecordFromClockIn(c, attentRecord.StaffId, attentRecord.Date)
}

func GetAttendRecordByStaffId(c *gin.Context, staffId string, start int, limit int) ([]*model.AttendanceRecord, int64, error) {
	var records []*model.AttendanceRecord
	var err error
	if start == -1 && limit == -1 {
		// 不加分页
		if staffId != "all" {
			err = resource.HrmsDB(c).Where("staff_id = ?", staffId).Order("date desc").Find(&records).Error
		} else {
			err = resource.HrmsDB(c).Order("date desc").Find(&records).Error
		}

	} else {
		// 加分页
		if staffId != "all" {
			err = resource.HrmsDB(c).Where("staff_id = ?", staffId).Offset(start).Limit(limit).Order("date desc").Find(&records).Error
		} else {
			err = resource.HrmsDB(c).Offset(start).Limit(limit).Order("date desc").Find(&records).Error
		}
	}
	if err != nil {
		return nil, 0, err
	}
	var total int64
	resource.HrmsDB(c).Model(&model.AttendanceRecord{}).Count(&total)
	if staffId != "all" {
		total = int64(len(records))
	}
	return records, total, nil
}

func GetAttendRecordHistoryByStaffId(c *gin.Context, staffId string, start int, limit int) ([]*model.AttendanceRecord, int64, error) {
	var records []*model.AttendanceRecord
	var err error
	sqlReq1 := `select * from attendance_record as attend left join salary_record as salary on attend.staff_id = salary.staff_id
and attend.date = salary.salary_date where salary.is_pay = 2 and attend.staff_id = ? order by attend.date desc`
	sqlReq2 := `select * from attendance_record as attend left join salary_record as salary on attend.staff_id = salary.staff_id
and attend.date = salary.salary_date where salary.is_pay = 2 order by attend.date desc`
	if start == -1 && limit == -1 {
		// 不加分页
		if staffId != "all" {
			err = resource.HrmsDB(c).Raw(sqlReq1, staffId).Find(&records).Error
		} else {
			err = resource.HrmsDB(c).Raw(sqlReq2).Find(&records).Error
		}

	} else {
		// 加分页
		if staffId != "all" {
			err = resource.HrmsDB(c).Raw(sqlReq1, staffId).Offset(start).Limit(limit).Find(&records).Error
		} else {
			err = resource.HrmsDB(c).Raw(sqlReq2).Offset(start).Limit(limit).Find(&records).Error
		}
	}
	if err != nil {
		return nil, 0, err
	}
	var total int64
	resource.HrmsDB(c).Model(&model.AttendanceRecord{}).Count(&total)
	if staffId != "all" {
		total = int64(len(records))
	}
	return records, total, nil
}

// 如果支付过则返回true
func GetAttendRecordIsPayByStaffIdAndDate(c *gin.Context, staffId string, date string) bool {
	var total int64
	resource.HrmsDB(c).Model(&model.SalaryRecord{}).Where("staff_id = ? and salary_date = ? and is_pay = 2", staffId, date).Count(&total)
	return total != 0
}

// 通过leader_staff_id查询下属提交的考勤上报数据进行审批
func GetAttendRecordApproveByLeaderStaffId(c *gin.Context, leaderStaffId string) ([]*model.AttendanceRecord, int64, error) {
	var err error
	var attends []*model.AttendanceRecord
	
	if leaderStaffId == "all" {
		// 查询所有未审批的考勤记录
		err = resource.HrmsDB(c).Where("approve = 0").Order("date desc").Find(&attends).Error
		if err != nil {
			return nil, 0, err
		}
	} else {
		// 查询下属staff_id
		var staffs []*model.Staff
		resource.HrmsDB(c).Where("leader_staff_id = ?", leaderStaffId).Find(&staffs)
		if len(staffs) == 0 {
			return nil, 0, nil
		}
		// 查询下属是否有未审批的考勤申请
		for _, staff := range staffs {
			var attend []*model.AttendanceRecord
			staffId := staff.StaffId
			resource.HrmsDB(c).Where("staff_id = ? and approve = 0", staffId).Find(&attend)
			if attend != nil {
				attends = append(attends, attend...)
			}
		}
		if err != nil {
			return nil, 0, err
		}
	}
	
	total := int64(len(attends))
	return attends, total, nil
}

// 通过考勤审批信息，修改考勤信息为通过，并且按该员工工资套账进行相应的薪资详情计算，得到五险一金税后薪资
func Compute(c *gin.Context, attendId string) error {
	err := resource.HrmsDB(c).Transaction(func(tx *gorm.DB) error {
		// 更新考勤信息为审批通过状态
		if err := tx.Model(&model.AttendanceRecord{}).Where("attendance_id = ?", attendId).Update("approve", 1).Error; err != nil {
			return err
		}
		// 根据考勤信息及该员工薪资套账进行当月薪资计算

		// 获取当月出勤信息
		attendInfo, err := getAttendInfoByAttendId(tx, attendId)
		if err != nil {
			return err
		}
		// 获取员工工号及当月出勤天数、缺勤天数、加班天数及月份
		staffId := attendInfo.StaffId
		workDays := attendInfo.WorkDays
		leaveDays := attendInfo.LeaveDays
		overtimeDays := attendInfo.OvertimeDays
		month := attendInfo.Date
		// 获取该员工薪资套账
		salaryInfo, err := getSalaryInfoByStaffId(tx, staffId)
		if err != nil {
			return err
		}
		// 获员工姓名、基本薪资、住房补贴、绩效奖金、提成薪资、其他薪资、是否缴纳五险一金
		staffName := salaryInfo.StaffName
		base := salaryInfo.Base
		subsidy := salaryInfo.Subsidy
		bonus := salaryInfo.Bonus
		commission := salaryInfo.Commission
		other := salaryInfo.Other
		fund := salaryInfo.Fund
		
		// 使用V2参数系统计算薪资
		salaryRecord, err := CalculateSalaryV2(c, tx, staffId, staffName, base, subsidy, bonus, commission, other, fund, workDays, leaveDays, overtimeDays, month)
		if err != nil {
			return err
		}
		
		// 创建或更新薪资记录
		affected := tx.Where("staff_id = ? and salary_date = ?", staffId, month).Updates(&salaryRecord).RowsAffected
		if affected != 0 {
			// 已更新记录
			return nil
		}
		if err = tx.Create(&salaryRecord).Error; err != nil {
			return err
		}
		return nil
	})
	return err
}


func getSalaryInfoByStaffId(tx *gorm.DB, staffId string) (*model.Salary, error) {
	var salarys []*model.Salary
	tx.Where("staff_id = ?", staffId).Find(&salarys)
	if len(salarys) == 0 {
		return nil, errors.New("不存在该薪资套账")
	}
	return salarys[0], nil
}

func getAttendInfoByAttendId(tx *gorm.DB, attendId string) (*model.AttendanceRecord, error) {
	var records []*model.AttendanceRecord
	tx.Where("attendance_id = ?", attendId).Find(&records)
	if len(records) == 0 {
		return nil, errors.New("不存在该考勤信息")
	}
	return records[0], nil
}

// CalculateSalaryV2 使用V2参数系统计算薪资
func CalculateSalaryV2(c *gin.Context, tx *gorm.DB, staffId, staffName string, base, subsidy, bonus, commission, other, fund, workDays, leaveDays, overtimeDays int64, month string) (model.SalaryRecord, error) {
	var salaryRecord model.SalaryRecord
	
	// 获取系统参数
	monthlyWorkDays, err := GetSystemParameter(c, "monthly_work_days")
	if err != nil {
		return salaryRecord, err
	}
	
	// 按出勤天数更新基本工资
	workDaysFloat := float64(workDays)
	monthlyWorkDaysFloat, _ := strconv.ParseFloat(monthlyWorkDays.ParameterValue, 64)
	base = int64((float64(base) / monthlyWorkDaysFloat) * workDaysFloat)
	
	// 使用计算规则更新绩效奖金
	bonus, err = CalculateBonusByRule(c, bonus, leaveDays)
	if err != nil {
		return salaryRecord, err
	}
	
	// 使用计算规则计算加班工资
	overtimeSalary, err := CalculateOvertimeByRule(c, base, overtimeDays)
	if err != nil {
		return salaryRecord, err
	}
	
	// 计算应发工资总额
	amount := float64(overtimeSalary + base + subsidy + bonus + commission + other)
	
	// 如果缴纳五险一金，计算个人缴纳部分
	if fund == 1 {
		err = CalculateInsuranceDeductions(c, &salaryRecord, amount)
		if err != nil {
			return salaryRecord, err
		}
	}
	
	// 计算扣除五险一金后的应纳税所得额
	taxableAmount := amount - salaryRecord.PensionInsurance - salaryRecord.MedicalInsurance -
		salaryRecord.UnemploymentInsurance - salaryRecord.HousingFund
	
	// 计算个人所得税
	tax, err := CalculateIncomeTax(c, taxableAmount)
	if err != nil {
		return salaryRecord, err
	}
	
	// 计算税后工资
	total := taxableAmount - tax
	
	// 设置薪资记录
	salaryRecord.SalaryRecordId = RandomID("salary_record")
	salaryRecord.StaffId = staffId
	salaryRecord.StaffName = staffName
	salaryRecord.Base = base
	salaryRecord.Subsidy = subsidy
	salaryRecord.Bonus = bonus
	salaryRecord.Commission = commission
	salaryRecord.Overtime = overtimeSalary
	salaryRecord.Other = other
	salaryRecord.Tax = tax
	salaryRecord.Total = total
	salaryRecord.IsPay = 1
	salaryRecord.SalaryDate = month
	
	return salaryRecord, nil
}

// CalculateBonusByRule 根据计算规则计算绩效奖金
func CalculateBonusByRule(c *gin.Context, originalBonus, leaveDays int64) (int64, error) {
	// 获取绩效奖金计算规则
	rules, err := GetCalculationRulesByType(c, "leave")
	if err != nil {
		return originalBonus, err
	}
	
	// 查找事假扣款规则
	for _, rule := range rules {
		if rule.RuleName == "事假扣款计算" {
			// 简化处理：每缺勤一天扣1/5，超过5天全扣
			if leaveDays > 5 {
				return 0, nil
			}
			x := float64(5-leaveDays) / 5.0
			return int64(float64(originalBonus) * x), nil
		}
	}
	
	// 如果没有找到规则，使用默认逻辑
	if leaveDays > 5 {
		return 0, nil
	}
	x := float64(5-leaveDays) / 5.0
	return int64(float64(originalBonus) * x), nil
}

// CalculateOvertimeByRule 根据计算规则计算加班工资
func CalculateOvertimeByRule(c *gin.Context, base, overtimeDays int64) (int64, error) {
	if overtimeDays == 0 {
		return 0, nil
	}
	
	// 获取月工作日数
	monthlyWorkDays, err := GetSystemParameter(c, "monthly_work_days")
	if err != nil {
		return 0, err
	}
	
	monthlyWorkDaysFloat, _ := strconv.ParseFloat(monthlyWorkDays.ParameterValue, 64)
	dailyRate := float64(base) / monthlyWorkDaysFloat
	
	// 获取加班计算规则
	rules, err := GetCalculationRulesByType(c, "overtime")
	if err != nil {
		return 0, err
	}
	
	// 默认使用工作日加班规则（1.5倍）
	multiplier := 1.5
	
	// 查找加班规则，这里简化处理，实际应该根据加班类型选择
	for _, rule := range rules {
		if rule.RuleName == "工作日加班计算" {
			multiplier = 1.5
			break
		} else if rule.RuleName == "周末加班计算" {
			multiplier = 2.0
			break
		} else if rule.RuleName == "法定节假日加班计算" {
			multiplier = 3.0
			break
		}
	}
	
	overtimeSalary := int64(dailyRate * multiplier * float64(overtimeDays))
	return overtimeSalary, nil
}

// CalculateInsuranceDeductions 计算五险一金扣除
func CalculateInsuranceDeductions(c *gin.Context, salaryRecord *model.SalaryRecord, amount float64) error {
	// 获取社保费率配置
	rates, err := GetInsuranceRates(c)
	if err != nil {
		return err
	}
	
	// 计算各项保险和公积金
	for _, rate := range rates {
		personalRate := rate.EmployeeRate / 100.0
		switch rate.InsuranceType {
		case "pension":
			salaryRecord.PensionInsurance = amount * personalRate
		case "medical":
			salaryRecord.MedicalInsurance = amount * personalRate
		case "unemployment":
			salaryRecord.UnemploymentInsurance = amount * personalRate
		case "housing":
			salaryRecord.HousingFund = amount * personalRate
		}
	}
	
	return nil
}

// CalculateIncomeTax 计算个人所得税
func CalculateIncomeTax(c *gin.Context, amount float64) (float64, error) {
	// 获取个税起征点
	taxThreshold, err := GetSystemParameter(c, "tax_threshold")
	if err != nil {
		return 0, err
	}
	
	threshold, _ := strconv.ParseFloat(taxThreshold.ParameterValue, 64)
	
	// 如果应纳税所得额小于等于起征点，不征税
	if amount <= threshold {
		return 0, nil
	}
	
	// 获取税率配置
	taxBrackets, err := GetTaxBrackets(c)
	if err != nil {
		return 0, err
	}
	
	// 计算应纳税所得额
	taxableAmount := amount - threshold
	
	// 根据税率配置计算税额
	for _, bracket := range taxBrackets {
		if taxableAmount >= float64(bracket.MinIncome) && (bracket.MaxIncome == 0 || taxableAmount <= float64(bracket.MaxIncome)) {
			taxRate := bracket.TaxRate / 100.0
			tax := taxableAmount*taxRate - float64(bracket.QuickDeduction)
			return math.Max(0, tax), nil
		}
	}
	
	// 如果超过所有税率区间，使用最高税率
	for _, bracket := range taxBrackets {
		if bracket.MaxIncome == 0 {
			taxRate := bracket.TaxRate / 100.0
			tax := taxableAmount*taxRate - float64(bracket.QuickDeduction)
			return math.Max(0, tax), nil
		}
	}
	
	return 0, nil
}
