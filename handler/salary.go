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
		salaryGroup := r.Group("/salary")
		salaryGroup.POST("/create", CreateSalary)
		salaryGroup.DELETE("/delete/:salary_id", DelSalary)
		salaryGroup.POST("/edit", UpdateSalaryById)
		salaryGroup.GET("/query/:staff_id", GetSalaryByStaffId)
		salaryGroup.GET("/query/all", GetSalaryByStaffId)

		// 薪资发放相关
		salaryRecordGroup := r.Group("/salary_record")
		salaryRecordGroup.GET("/query/:staff_id", GetSalaryRecordByStaffId)
		salaryRecordGroup.GET("/get_salary_record_is_pay_by_id/:id", GetSalaryRecordIsPayById)
		salaryRecordGroup.GET("/pay_salary_record_by_id/:id", PaySalaryRecordById)
		salaryRecordGroup.GET("/query_history/:staff_id", GetHadPaySalaryRecordByStaffId)
		salaryRecordGroup.GET("/query_history/all", GetHadPaySalaryRecordByStaffId)
	})
}

// 删除薪资信息
// @Summary 删除薪资信息
// @Tags Salary
// @Accept  json
// @Produce  json
// @Param salary_id path string true "薪资ID"
// @Success 200 {object} Response
// @Router /api/salary/delete/{salary_id} [delete]
func DelSalary(c *gin.Context) {
	// 参数绑定
	salaryId := c.Param("salary_id")
	
	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)
	
	// 查询要删除的薪资信息用于日志记录
	var salary model.Salary
	resource.HrmsDB(c).Where("salary_id = ?", salaryId).First(&salary)
	
	// 业务处理
	err := service.DelSalaryBySalaryId(c, salaryId)
	if err != nil {
		// 记录错误日志
		log.Printf("[DelSalary] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "DELETE", "SALARY", 
			"删除薪资失败: "+salary.StaffName, err.Error())
		sendFail(c, 5002, "删除失败"+err.Error())
		return
	}
	
	LogOperationSuccess(c, staffId, staffName, "DELETE", "SALARY", 
		"删除薪资成功: "+salary.StaffName)
	sendSuccess(c, nil, "删除成功")
}

// 创建薪资信息
// @Summary 创建薪资信息
// @Tags Salary
// @Accept  json
// @Produce  json
// @Param salary body model.SalaryCreateDTO true "薪资信息"
// @Success 200 {object} Response
// @Router /api/salary/create [post]
func CreateSalary(c *gin.Context) {
	// 参数绑定
	var dto model.SalaryCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		// 获取操作用户信息用于失败日志
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "CREATE", "SALARY", 
			"创建薪资失败", err.Error())
		log.Printf("[CreateSalary] err = %v", err)
		sendFail(c, 5001, "添加失败"+err.Error())
		return
	}
	
	// 获取操作用户信息用于成功日志
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)
	
	// 业务处理
	err := service.CreateSalary(c, &dto)
	if err != nil {
		log.Printf("[CreateSalary] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "CREATE", "SALARY", 
			"创建薪资失败: "+dto.StaffName, err.Error())
		sendFail(c, 5002, "添加失败"+err.Error())
		return
	}
	
	LogOperationSuccess(c, staffId, staffName, "CREATE", "SALARY", 
		"创建薪资成功: "+dto.StaffName)
	sendSuccess(c, nil, "添加成功")
}

// 修改薪资信息
// @Summary 修改薪资信息
// @Tags Salary
// @Accept  json
// @Produce  json
// @Param salary body model.SalaryEditDTO true "薪资信息"
// @Success 200 {object} Response
// @Router /api/salary/edit [post]
func UpdateSalaryById(c *gin.Context) {
	// 参数绑定
	var dto model.SalaryEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		// 获取操作用户信息用于失败日志
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "SALARY", 
			"编辑薪资失败", err.Error())
		log.Printf("[UpdateSalaryById] err = %v", err)
		sendFail(c, 5001, "编辑失败"+err.Error())
		return
	}
	
	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)
	
	// 查询原薪资信息用于日志记录
	var originalSalary model.Salary
	resource.HrmsDB(c).Where("id = ?", dto.Id).First(&originalSalary)
	
	// 业务处理
	err := service.UpdateSalaryById(c, &dto)
	if err != nil {
		log.Printf("[UpdateSalaryById] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "SALARY", 
			"编辑薪资失败: "+originalSalary.StaffName, err.Error())
		sendFail(c, 5002, "编辑失败"+err.Error())
		return
	}
	
	LogOperationSuccess(c, staffId, staffName, "UPDATE", "SALARY", 
		"编辑薪资成功: "+originalSalary.StaffName)
	sendSuccess(c, nil, "编辑成功")
}

// 根据员工ID查询薪资信息
// @Summary 根据员工ID查询薪资信息
// @Tags Salary
// @Accept  json
// @Produce  json
// @Param staff_id path string true "员工ID"
// @Success 200 {object} Response
// @Router /api/salary/query/{staff_id} [get]
// 薪资列表
// @Summary 薪资列表
// @Tags Salary
// @Accept  json
// @Produce  json
// @Param page query string false "页码"
// @Param limit query string false "每页数量"
// @Success 200 {object} Response
// @Router /api/salary/query/all [get]
func GetSalaryByStaffId(c *gin.Context) {
	// 参数绑定
	staffId := c.Param("staff_id")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetSalaryByStaffId(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetSalaryByStaffId] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")
}

//func DelSalaryRecord(c *gin.Context) {
//	// 参数绑定
//	salaryId := c.Param("salary_record_id")
//	// 业务处理
//	err := service.DelSalaryRecordBySalaryRecordId(c, salaryId)
//	if err != nil {
//		log.Printf("[DelSalaryRecord] err = %v", err)
//		c.JSON(200, gin.H{
//			"status": 5002,
//			"result": err.Error(),
//		})
//		return
//	}
//	c.JSON(200, gin.H{
//		"status": 2000,
//	})
//}
//
//func CreateSalaryRecord(c *gin.Context) {
//	// 参数绑定
//	var dto model.SalaryRecordCreateDTO
//	if err := c.ShouldBindJSON(&dto); err != nil {
//		log.Printf("[CreateSalaryRecord] err = %v", err)
//		c.JSON(200, gin.H{
//			"status": 5001,
//			"result": err.Error(),
//		})
//		return
//	}
//	// 业务处理
//	err := service.CreateSalaryRecord(c, &dto)
//	if err != nil {
//		log.Printf("[CreateSalaryRecord] err = %v", err)
//		c.JSON(200, gin.H{
//			"status": 5002,
//			"result": err.Error(),
//		})
//		return
//	}
//	c.JSON(200, gin.H{
//		"status": 2000,
//	})
//}
//
//func UpdateSalaryRecordById(c *gin.Context) {
//	// 参数绑定
//	var dto model.SalaryRecordEditDTO
//	if err := c.ShouldBindJSON(&dto); err != nil {
//		log.Printf("[UpdateSalaryRecordById] err = %v", err)
//		c.JSON(200, gin.H{
//			"status": 5001,
//			"result": err.Error(),
//		})
//		return
//	}
//	// 业务处理
//	err := service.UpdateSalaryRecordById(c, &dto)
//	if err != nil {
//		log.Printf("[UpdateSalaryRecordById] err = %v", err)
//		c.JSON(200, gin.H{
//			"status": 5002,
//			"result": err.Error(),
//		})
//		return
//	}
//	c.JSON(200, gin.H{
//		"status": 2000,
//	})
//}

// 根据员工ID查询薪资发放记录
// @Summary 根据员工ID查询薪资发放记录
// @Tags SalaryRecord
// @Accept  json
// @Produce  json
// @Param staff_id path string true "员工ID"
// @Success 200 {object} Response
// @Router /api/salary_record/query/{staff_id} [get]
func GetSalaryRecordByStaffId(c *gin.Context) {
	// 参数绑定
	staffId := c.Param("staff_id")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetSalaryRecordByStaffId(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetSalaryRecordByStaffId] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")
}

// 根据ID查询薪资发放记录是否已发放
// @Summary 根据ID查询薪资发放记录是否已发放
// @Tags SalaryRecord
// @Accept  json
// @Produce  json
// @Param id path string true "薪资发放记录ID"
// @Success 200 {object} Response
// @Router /api/salary_record/get_salary_record_is_pay_by_id/{id} [get]
func GetSalaryRecordIsPayById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		sendFail(c, 5000, err.Error())
		return
	}
	isPay := service.GetSalaryRecordIsPayById(c, int64(id))
	sendSuccess(c, isPay, "")
}

// 根据ID发放薪资
// @Summary 根据ID发放薪资
// @Tags SalaryRecord
// @Accept  json
// @Produce  json
// @Param id path string true "薪资发放记录ID"
// @Success 200 {object} Response
// @Router /api/salary_record/pay_salary_record_by_id/{id} [get]
func PaySalaryRecordById(c *gin.Context) {
	idStr := c.Param("id")
	
	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)
	
	id, err := strconv.Atoi(idStr)
	if err != nil {
		LogOperationFailure(c, staffId, staffName, "UPDATE", "SALARY", 
			"发放薪资失败", err.Error())
		sendFail(c, 5001, "发放失败"+err.Error())
		return
	}
	
	// 查询薪资记录信息用于日志记录
	var salaryRecord model.SalaryRecord
	resource.HrmsDB(c).Where("id = ?", id).First(&salaryRecord)
	
	err = service.PaySalaryRecordById(c, int64(id))
	if err != nil {
		LogOperationFailure(c, staffId, staffName, "UPDATE", "SALARY", 
			"发放薪资失败: "+salaryRecord.StaffName, err.Error())
		sendFail(c, 5002, "发放失败"+err.Error())
		return
	}
	
	LogOperationSuccess(c, staffId, staffName, "UPDATE", "SALARY", 
		"发放薪资成功: "+salaryRecord.StaffName)
	sendSuccess(c, nil, "发放成功")
}

// 根据员工ID查询已发放薪资记录
// @Summary 根据员工ID查询已发放薪资记录
// @Tags SalaryRecord
// @Accept  json
// @Produce  json
// @Param staff_id path string true "员工ID"
// @Success 200 {object} Response
// @Router /api/salary_record/query_history/{staff_id} [get]
// 薪资历史记录
// @Summary 薪资历史记录
// @Tags SalaryRecord
// @Accept  json
// @Produce  json
// @Param staff_id path string true "员工ID"
// @Success 200 {object} Response
// @Router /api/salary_record/query_history/all [get]
func GetHadPaySalaryRecordByStaffId(c *gin.Context) {
	// 参数绑定
	staffId := c.Param("staff_id")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetHadPaySalaryRecordByStaffId(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetHadPaySalaryRecordByStaffId] err = %v", err)

		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")
}
