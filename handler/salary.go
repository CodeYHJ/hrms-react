package handler

import (
	"hrms/model"
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
	// 业务处理
	err := service.DelSalaryBySalaryId(c, salaryId)
	if err != nil {
		// 记录错误日志
		log.Printf("[DelSalary] err = %v", err)
		// 返回错误信息
		c.JSON(200, gin.H{
			"status": 5002,
			"result": err.Error(),
		})
		return
	}
	// 返回成功信息
	c.JSON(200, gin.H{
		"status": 2000,
	})
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
		log.Printf("[CreateSalary] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5001,
			"result": err.Error(),
		})
		return
	}
	// 业务处理
	err := service.CreateSalary(c, &dto)
	if err != nil {
		log.Printf("[CreateSalary] err = %v", err)
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
		log.Printf("[UpdateSalaryById] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5001,
			"result": err.Error(),
		})
		return
	}
	// 业务处理
	err := service.UpdateSalaryById(c, &dto)
	if err != nil {
		log.Printf("[UpdateSalaryById] err = %v", err)
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
	id, err := strconv.Atoi(idStr)
	if err != nil {
		sendFail(c, 5001, "")
		return
	}
	err = service.PaySalaryRecordById(c, int64(id))
	if err != nil {
		sendFail(c, 5002, "")

		return
	}
	sendSuccess(c, nil, "")

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
