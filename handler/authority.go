package handler

import (
	"hrms/model"
	"hrms/service"
	"log"

	"github.com/gin-gonic/gin"
)

func init() {
	Register(func(r *gin.RouterGroup) {
		authorityGroup := r.Group("/authority")
		authorityGroup.POST("/create", AddAuthorityDetail)
		authorityGroup.POST("/edit", UpdateAuthorityDetailById)
		authorityGroup.GET("/query_by_user_type/:user_type", GetAuthorityDetailListByUserType)
		authorityGroup.POST("/query_by_user_type_and_model", GetAuthorityDetailByUserTypeAndModel)
		authorityGroup.POST("/set_admin/:staff_id", SetAdminByStaffId)
		authorityGroup.POST("/set_normal/:staff_id", SetNormalByStaffId)
	})
}

// AddAuthorityDetail 创建授权
// @Summary 创建授权
// @Tags 权限管理
// @Accept json
// @Produce json
// @Param data body model.AddAuthorityDetailDTO true "创建授权"
// @Router /api/authority/create [post]
func AddAuthorityDetail(c *gin.Context) {
	var authorityDetailDTO model.AddAuthorityDetailDTO
	if err := c.ShouldBindJSON(&authorityDetailDTO); err != nil {
		log.Printf("[AddAuthorityDetail] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5001,
			"result": err.Error(),
		})
		return
	}
	err := service.AddAuthorityDetail(c, &authorityDetailDTO)
	if err != nil {
		log.Printf("[AddAuthorityDetail] err = %v", err)
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

// GetAuthorityDetailByUserTypeAndModel 根据用户类型和模块查询授权
// @Summary 根据用户类型和模块查询授权
// @Tags 权限管理
// @Accept json
// @Produce json
// @Param data body model.GetAuthorityDetailDTO true "根据用户类型和模块查询授权"
// @Success 200 {object} model.GetAuthorityDetailDTO
// @Router /api/authority/query_by_user_type_and_model [post]
func GetAuthorityDetailByUserTypeAndModel(c *gin.Context) {
	var dto model.GetAuthorityDetailDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[GetAuthorityDetailByUserTypeAndModel] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5001,
			"result": err.Error(),
		})
		return
	}
	content, err := service.GetAuthorityDetailByUserTypeAndModel(c, &dto)
	if err != nil {
		log.Printf("[GetAuthorityDetailByUserTypeAndModel] err = %v", err)
		sendFail(c, 5002, err.Error())
		return
	}
	sendSuccess(c, nil, content)

}

// GetAuthorityDetailListByUserType 根据用户类型查询授权
// @Summary 根据用户类型查询授权
// @Tags 权限管理
// @Accept json
// @Produce json
// @Param user_type path string true "用户类型"
// @Success 200 {object} model.GetAuthorityDetailDTO
// @Router /api/authority/query_by_user_type/{user_type} [get]
func GetAuthorityDetailListByUserType(c *gin.Context) {
	// 分页
	start, limit := service.AcceptPage(c)
	userType := c.Param("user_type")
	detailList, total, err := service.GetAuthorityDetailListByUserType(c, userType, start, limit)
	if err != nil {
		log.Printf("[GetAuthorityDetailByUserTypeAndModel] err = %v", err)
		sendFail(c, 5002, err.Error())
		return
	}
	sendTotalSuccess(c, detailList, total, "")
}

// UpdateAuthorityDetailById 编辑授权
// @Summary 编辑授权
// @Tags 权限管理
// @Accept json
// @Produce json
// @Param data body model.UpdateAuthorityDetailDTO true "编辑授权"
// @Router /api/authority/edit [post]
func UpdateAuthorityDetailById(c *gin.Context) {
	// 参数绑定
	var dto model.UpdateAuthorityDetailDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[UpdateAuthorityDetailById] err = %v", err)
		c.JSON(200, gin.H{
			"status": 5001,
			"result": err.Error(),
		})
		return
	}
	// 业务处理
	err := service.UpdateAuthorityDetailById(c, &dto)
	if err != nil {
		log.Printf("[UpdateAuthorityDetailById] err = %v", err)
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

// SetAdminByStaffId 设置管理员
// @Summary 设置管理员
// @Tags 权限管理
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Router /api/authority/set_admin/{staff_id} [post]
func SetAdminByStaffId(c *gin.Context) {
	staffId := c.Param("staff_id")
	if staffId == "" {
		log.Printf("[SetAdminByStaffId] staff_id is empty")
		c.JSON(200, gin.H{
			"status": 5001,
			"result": "staff_id is empty",
		})
		return
	}
	if err := service.SetAdminByStaffId(c, staffId); err != nil {
		log.Printf("[SetAdminByStaffId] err = %v", err)
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

// SetNormalByStaffId 设置普通用户
// @Summary 设置普通用户
// @Tags 权限管理
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Router /api/authority/set_normal/{staff_id} [post]
func SetNormalByStaffId(c *gin.Context) {
	staffId := c.Param("staff_id")
	if staffId == "" {
		log.Printf("[SetNormalByStaffId] staff_id is empty")
		c.JSON(200, gin.H{
			"status": 5001,
			"result": "staff_id is empty",
		})
		return
	}
	if err := service.SetNormalByStaffId(c, staffId); err != nil {
		log.Printf("[SetNormalByStaffId] err = %v", err)
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
