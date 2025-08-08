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
		// 候选人管理相关
		candidateGroup := r.Group("/candidate")
		candidateGroup.POST("/create", CreateCandidate)
		candidateGroup.DELETE("/delete/:candidate_id", DelCandidateByCandidateId)
		candidateGroup.POST("/edit", UpdateCandidateById)
		candidateGroup.GET("/query_by_name/:name", GetCandidateByName)
		candidateGroup.GET("/query_by_staff_id/:staff_id", GetCandidateByStaffId)
		candidateGroup.GET("/reject/:id", SetCandidateRejectById)
		candidateGroup.GET("/accept/:id", SetCandidateAcceptById)
	})
}

// 创建候选人信息
// @Summary 创建候选人信息
// @Tags 候选人管理
// @Accept json
// @Produce json
// @Param data body model.CandidateCreateDTO true "候选人信息"
// @Router /api/candidate/create [post]
func CreateCandidate(c *gin.Context) {
	// 参数绑定
	var dto model.CandidateCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[CreateCandidate] err = %v", err)
		// c.JSON(200, gin.H{
		// 	"status": 5001,
		// 	"result": err.Error(),
		// })
		sendFail(c, 5001, "添加失败")
		return
	}
	// 业务处理
	err := service.CreateCandidate(c, &dto)
	if err != nil {
		log.Printf("[CreateCandidate] err = %v", err)
		// c.JSON(200, gin.H{
		// 	"status": 5002,
		// 	"result": err.Error(),
		// })
		sendFail(c, 5002, "添加失败")
		return
	}
	sendSuccess(c, nil, "添加候选人成功")
	// c.JSON(200, gin.H{
	// 	"status": 2000,
	// })
}

// 删除候选人信息
// @Summary 删除候选人信息
// @Tags 候选人管理
// @Accept json
// @Produce json
// @Param candidate_id path string true "候选人ID"
// @Router /api/candidate/delete/{candidate_id} [delete]
func DelCandidateByCandidateId(c *gin.Context) {
	// 参数绑定
	candidateId := c.Param("candidate_id")
	// 业务处理
	err := service.DelCandidateByCandidateId(c, candidateId)
	if err != nil {
		log.Printf("[DelCandidateByCandidateId] err = %v", err)
		// c.JSON(200, gin.H{
		// 	"status": 5002,
		// 	"result": err.Error(),
		// })
		sendFail(c, 5002, "删除失败")
		return
	}
	sendSuccess(c, nil, "删除候选人成功")
	// c.JSON(200, gin.H{
	// 	"status": 2000,
	// })
}

// 更新候选人信息
// @Summary 更新候选人信息
// @Tags 候选人管理
// @Accept json
// @Produce json
// @Param data body model.CandidateEditDTO true "更新候选人信息"
// @Router /api/candidate/edit [post]
func UpdateCandidateById(c *gin.Context) {
	// 参数绑定
	var dto model.CandidateEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[UpdateCandidateById] err = %v", err)
		// c.JSON(200, gin.H{
		// 	"status": 5001,
		// 	"result": err.Error(),
		// })
		sendFail(c, 5001, "编辑失败")
		return
	}
	// 业务处理
	err := service.UpdateCandidateById(c, &dto)
	if err != nil {
		log.Printf("[UpdateCandidateById] err = %v", err)
		// c.JSON(200, gin.H{
		// 	"status": 5002,
		// 	"result": err.Error(),
		// })
		sendFail(c, 5002, "编辑失败")
		return
	}
	sendSuccess(c, nil, "编辑候选人成功")
	// c.JSON(200, gin.H{
	// 	"status": 2000,
	// })
}

// 根据姓名查询候选人
// @Summary 根据姓名查询候选人
// @Tags 候选人管理
// @Accept json
// @Produce json
// @Param name path string true "候选人姓名"
// @Param page query int false "页码"
// @Param limit query int false "每页数量"
// @Router /api/candidate/query_by_name/{name} [get]
func GetCandidateByName(c *gin.Context) {
	// 参数绑定
	name := c.Param("name")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetCandidateByName(c, name, start, limit)
	if err != nil {
		log.Printf("[GetCandidateByName] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")

}

// 根据员工ID查询候选人
// @Summary 根据员工ID查询候选人
// @Tags 候选人管理
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Param page query int false "页码"
// @Param limit query int false "每页数量"
// @Router /api/candidate/query_by_staff_id/{staff_id} [get]
func GetCandidateByStaffId(c *gin.Context) {
	// 参数绑定
	staffId := c.Param("staff_id")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetCandidateByStaffId(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetCandidateByStaffId] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")
}

// 拒绝候选人
// @Summary 拒绝候选人
// @Tags 候选人管理
// @Accept json
// @Produce json
// @Param id path string true "候选人ID"
// @Router /api/candidate/reject/{id} [get]
func SetCandidateRejectById(c *gin.Context) {
	// 参数绑定
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	// 业务处理
	err = service.SetCandidateRejectById(c, int64(id))
	if err != nil {
		log.Printf("[SetCandidateRejectById] err = %v", err)
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

// 接受候选人
// @Summary 接受候选人
// @Tags 候选人管理
// @Accept json
// @Produce json
// @Param id path string true "候选人ID"
// @Router /api/candidate/accept/{id} [get]
func SetCandidateAcceptById(c *gin.Context) {
	// 参数绑定
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	// 业务处理
	err = service.SetCandidateAcceptById(c, int64(id))
	if err != nil {
		log.Printf("[SetCandidateAcceptById] err = %v", err)
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
