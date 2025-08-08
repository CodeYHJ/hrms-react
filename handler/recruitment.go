package handler

import (
	"hrms/model"
	"hrms/service"
	"log"

	"github.com/gin-gonic/gin"
)

func init() {
	Register(func(r *gin.RouterGroup) {
		// 招聘信息相关
		recruitmentGroup := r.Group("/recruitment")
		recruitmentGroup.POST("/create", CreateRecruitment)
		recruitmentGroup.DELETE("/delete/:recruitment_id", DelRecruitmentByRecruitmentId)
		recruitmentGroup.POST("/edit", UpdateRecruitmentById)
		recruitmentGroup.GET("/query/:job_name", GetRecruitmentByJobName)
	})
}

// 创建招聘信息
// @Summary 创建招聘信息
// @Tags 招聘管理
// @Accept json
// @Produce json
// @Param data body model.RecruitmentCreateDTO true "招聘信息"
// @Router /api/recruitment/create [post]
func CreateRecruitment(c *gin.Context) {
	// 参数绑定
	var dto model.RecruitmentCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[CreateRecruitment] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5001,
			"result": err.Error(),
		})
		return
	}
	// 业务处理
	err := service.CreateRecruitment(c, &dto)
	if err != nil {
		log.Printf("[CreateRecruitment] err = %v", err)
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

// 删除招聘信息
// @Summary 删除招聘信息
// @Tags 招聘管理
// @Accept json
// @Produce json
// @Param recruitment_id path string true "招聘信息ID"
// @Router /api/recruitment/delete/{recruitment_id} [delete]
func DelRecruitmentByRecruitmentId(c *gin.Context) {
	// 参数绑定
	recruitmentId := c.Param("recruitment_id")
	// 业务处理
	err := service.DelRecruitmentByRecruitmentId(c, recruitmentId)
	if err != nil {
		log.Printf("[DelRecruitmentByRecruitmentId] err = %v", err)
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

// 更新招聘信息
// @Summary 更新招聘信息
// @Tags 招聘管理
// @Accept json
// @Produce json
// @Param data body model.RecruitmentEditDTO true "更新招聘信息"
// @Router /api/recruitment/edit [post]
func UpdateRecruitmentById(c *gin.Context) {
	// 参数绑定
	var dto model.RecruitmentEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[UpdateRecruitmentById] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5001,
			"result": err.Error(),
		})
		return
	}
	// 业务处理
	err := service.UpdateRecruitmentById(c, &dto)
	if err != nil {
		log.Printf("[UpdateRecruitmentById] err = %v", err)
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

// 查询招聘信息
// @Summary 根据职位名称查询招聘信息
// @Tags 招聘管理
// @Accept json
// @Produce json
// @Param job_name path string true "职位名称"
// @Router /api/recruitment/query/{job_name} [get]
func GetRecruitmentByJobName(c *gin.Context) {
	// 参数绑定
	staffId := c.Param("job_name")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetRecruitmentByJobName(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetRecruitmentByJobName] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")

}
