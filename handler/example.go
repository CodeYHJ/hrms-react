package handler

import (
	"hrms/model"
	"hrms/service"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func init() {
	Register(func(r *gin.RouterGroup) {
		// 考试管理相关
		exampleGroup := r.Group("/example")
		exampleGroup.POST("/create", CreateExample)
		exampleGroup.POST("/parse_example_content", ParseExampleContent)
		exampleGroup.DELETE("/delete/:example_id", DelExample)
		exampleGroup.POST("/edit", UpdateExampleById)
		exampleGroup.GET("/query/:name", GetExampleByName)
		exampleGroup.GET("/render_example/:id", RenderExample)

		// 考试成绩相关
		exampleScoreGroup := r.Group("/example_score")
		exampleScoreGroup.POST("/create", CreateExampleScore)
		exampleScoreGroup.GET("/query_by_name/:name", GetExampleHistoryByName)
		exampleScoreGroup.GET("/query_by_staff_id/:staff_id", GetExampleHistoryByStafId)
	})
}

// ParseExampleContent godoc
// @Summary 解析考试内容
// @Tags 考试管理
// @Accept json
// @Produce json
// @Router /api/example/parse_example_content [post]
func ParseExampleContent(c *gin.Context) {
	// 业务处理
	content, err := service.ParseExampleContent(c)
	if err != nil {
		log.Printf("[ParseExampleContent] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendSuccess(c, nil, content)

}

// CreateExample godoc
// @Summary 创建示例/考试
// @Tags 考试管理
// @Accept json
// @Produce json
// @Param data body model.ExampleCreateDTO true "考试信息"
// @Router /api/example/create [post]
func CreateExample(c *gin.Context) {
	// 参数绑定
	var dto model.ExampleCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[CreateExample] err = %v", err)
		sendFail(c, 5001, err.Error())
		return
	}
	// 业务处理
	err := service.CreateExample(c, &dto)
	if err != nil {
		log.Printf("[CreateExample] err = %v", err)
		sendFail(c, 5002, err.Error())
		return
	}
	sendSuccess(c, nil, "")
}

// UpdateExampleById godoc
// @Summary 更新考试信息
// @Tags 考试管理
// @Accept json
// @Produce json
// @Param data body model.ExampleEditDTO true "更新考试信息"
// @Router /api/example/edit [post]
func UpdateExampleById(c *gin.Context) {
	// 参数绑定
	var dto model.ExampleEditDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[UpdateExampleById] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5001,
			"result": err.Error(),
		})
		return
	}
	// 业务处理
	err := service.UpdateExampleById(c, &dto)
	if err != nil {
		log.Printf("[UpdateExampleById] err = %v", err)
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

// DelExample godoc
// @Summary 删除考试
// @Tags 考试管理
// @Accept json
// @Produce json
// @Param example_id path string true "考试ID"
// @Router /api/example/delete/{example_id} [delete]
func DelExample(c *gin.Context) {
	// 参数绑定
	exampleId := c.Param("example_id")
	// 业务处理
	err := service.DelExampleByExampleId(c, exampleId)
	if err != nil {
		log.Printf("[DelExample] err = %v", err)
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

// GetExampleByName godoc
// @Summary 根据名称查询考试
// @Tags 考试管理
// @Accept json
// @Produce json
// @Param name path string true "考试名称"
// @Router /api/example/query/{name} [get]
func GetExampleByName(c *gin.Context) {
	// 参数绑定
	name := c.Param("name")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetExampleByName(c, name, start, limit)
	if err != nil {
		log.Printf("[GetExampleByName] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")

}

// RenderExample godoc
// @Summary 渲染考试内容
// @Tags 考试管理
// @Accept json
// @Produce json
// @Param id path string true "考试ID"
// @Router /api/example/render_example/{id} [get]
func RenderExample(c *gin.Context) {
	// 参数绑定
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	result, err := service.RenderExample(c, int64(id))
	if err != nil {
		log.Printf("[RenderExample] err = %v", err)
		c.Redirect(http.StatusInternalServerError, "login.html")
	}
	c.HTML(http.StatusOK, "example_doing.html", result)
}

// CreateExampleScore godoc
// @Summary 创建考试成绩记录
// @Tags 考试成绩
// @Accept json
// @Produce json
// @Param data body model.ExampleScoreCreateDTO true "考试成绩信息"
// @Router /api/example_score/create [post]
func CreateExampleScore(c *gin.Context) {
	// 参数绑定
	var dto model.ExampleScoreCreateDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[CreateExampleScore] err = %v", err)
		sendFail(c, 5001, err.Error())
		return
	}
	// 业务处理
	total, err := service.CreateExampleScore(c, &dto)
	if err != nil {
		log.Printf("[CreateExampleScore] err = %v", err)

		sendFail(c, 5002, err.Error())
		return
	}
	sendTotalSuccess(c, nil, total, "")

}

// GetExampleHistoryByName godoc
// @Summary 根据考试名称查询成绩历史
// @Tags 考试成绩
// @Accept json
// @Produce json
// @Param name path string true "考试名称"
// @Router /api/example_score/query_by_name/{name} [get]
func GetExampleHistoryByName(c *gin.Context) {
	// 参数绑定
	name := c.Param("name")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetExampleHistoryByName(c, name, start, limit)
	if err != nil {
		log.Printf("[GetExampleHistoryByName] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")
}

// GetExampleHistoryByStafId godoc
// @Summary 根据员工ID查询成绩历史
// @Tags 考试成绩
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Router /api/example_score/query_by_staff_id/{staff_id} [get]
func GetExampleHistoryByStafId(c *gin.Context) {
	// 参数绑定
	staffId := c.Param("staff_id")
	start, limit := service.AcceptPage(c)
	// 业务处理
	list, total, err := service.GetExampleHistoryByStaffId(c, staffId, start, limit)
	if err != nil {
		log.Printf("[GetExampleHistoryByStafId] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendTotalSuccess(c, list, total, "")

}
