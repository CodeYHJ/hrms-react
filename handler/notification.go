package handler

import (
	"hrms/model"
	"hrms/resource"
	"hrms/service"
	"log"

	"github.com/gin-gonic/gin"
)

func init() {
	Register(func(r *gin.RouterGroup) {
		// 通知相关
		notificationGroup := r.Group("/notification")
		notificationGroup.POST("/create", CreateNotification)
		notificationGroup.DELETE("/delete/:notice_id", DeleteNotificationById)
		notificationGroup.POST("/edit", UpdateNotificationById)
		notificationGroup.GET("/query/:notice_title", GetNotificationByTitle)
		notificationGroup.GET("/query/published", GetPublishedNotifications)
	})
}

// 创建通知
// @Summary 创建通知
// @Tags 通知
// @Accept  json
// @Produce  json
// @Param notification body model.NotificationDTO true "通知"
// @Success 200 {object} Response
// @Router /api/notification/create [post]
func CreateNotification(c *gin.Context) {
	var notificationDTO model.NotificationDTO
	if err := c.BindJSON(&notificationDTO); err != nil {
		// 获取操作用户信息用于失败日志
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "CREATE", "NOTIFICATION",
			"创建通知失败", err.Error())
		log.Printf("[CreateNotification] err = %v", err)
		sendFail(c, 5001, "添加失败"+err.Error())
		return
	}

	// 获取操作用户信息用于成功日志
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 业务处理
	err := service.CreateNotification(c, &notificationDTO)
	if err != nil {
		log.Printf("[CreateNotification] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "CREATE", "NOTIFICATION",
			"创建通知失败: "+notificationDTO.NoticeTitle, err.Error())
		sendFail(c, 5002, "添加失败"+err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "CREATE", "NOTIFICATION",
		"创建通知成功: "+notificationDTO.NoticeTitle)
	sendSuccess(c, nil, "添加成功")
}

// 删除通知
// @Summary 删除通知
// @Tags 通知
// @Accept  json
// @Produce  json
// @Param notice_id path string true "通知ID"
// @Success 200 {object} Response
// @Router /api/notification/delete/{notice_id} [delete]
func DeleteNotificationById(c *gin.Context) {
	noticeId := c.Param("notice_id")

	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 查询要删除的通知信息用于日志记录
	var notification model.Notification
	resource.HrmsDB(c).Where("notice_id = ?", noticeId).First(&notification)

	// 业务处理
	err := service.DelNotificationById(c, noticeId)
	if err != nil {
		log.Printf("[DeleteNotificationById] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "DELETE", "NOTIFICATION",
			"删除通知失败: "+notification.NoticeTitle, err.Error())
		// c.JSON(200, gin.H{
		// 	"status": 5002,
		// 	"result": err.Error(),
		// })
		sendFail(c, 5002, "删除失败"+err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "DELETE", "NOTIFICATION",
		"删除通知成功: "+notification.NoticeTitle)
	sendSuccess(c, nil, "删除成功")
	// c.JSON(200, gin.H{
	// 	"status": 2000,
	// })
}

// 查询通知
// @Summary 根据通知名字查询通知
// @Tags 通知
// @Accept  json
// @Produce  json
// @Param notice_title path string true "通知标题"
// @Param page query int false "页码"
// @Param limit query int false "每页数量"
// @Success 200 {object} Response
// @Router /api/notification/query/{notice_title} [get]
func GetNotificationByTitle(c *gin.Context) {
	noticeTitle := c.Param("notice_title")
	start, limit := service.AcceptPage(c)
	// 业务处理
	notifications, total, err := service.GetNotificationByTitle(c, noticeTitle, start, limit)
	if err != nil {
		log.Printf("[DeleteNotificationById] err = %v", err)
		sendFail(c, 5002, err.Error())
		return
	}
	sendTotalSuccess(c, notifications, total, "")
}

// 获取已发布通知
// @Summary 获取已发布通知
// @Tags 通知
// @Accept  json
// @Produce  json
// @Param page query int false "页码"
// @Param limit query int false "每页数量"
// @Success 200 {object} Response
// @Router /api/notification/query/published [get]
func GetPublishedNotifications(c *gin.Context) {
	start, limit := service.AcceptPage(c)
	// 业务处理
	notifications, total, err := service.GetPublishedNotifications(c, start, limit)
	if err != nil {
		log.Printf("[GetPublishedNotifications] err = %v", err)
		sendFail(c, 5002, err.Error())
		return
	}
	sendTotalSuccess(c, notifications, total, "")
}

// 修改通知
// @Summary 修改通知
// @Tags 通知
// @Accept  json
// @Produce  json
// @Param notification body model.NotificationEditDTO true "通知"
// @Success 200 {object} Response
// @Router /api/notification/edit [post]
func UpdateNotificationById(c *gin.Context) {
	var dto model.NotificationEditDTO
	if err := c.BindJSON(&dto); err != nil {
		// 获取操作用户信息用于失败日志
		staffId := getCurrentStaffId(c)
		staffName := getCurrentStaffName(c)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "NOTIFICATION",
			"编辑通知失败", err.Error())
		log.Printf("[UpdateNotificationById] err = %v", err)
		sendFail(c, 5001, "编辑失败"+err.Error())
		return
	}

	// 获取操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 查询原通知信息用于日志记录
	var originalNotification model.Notification
	resource.HrmsDB(c).Where("id = ?", dto.ID).First(&originalNotification)

	// 业务处理
	err := service.UpdateNotificationById(c, &dto)
	if err != nil {
		log.Printf("[UpdateNotificationById] err = %v", err)
		LogOperationFailure(c, staffId, staffName, "UPDATE", "NOTIFICATION",
			"编辑通知失败: "+originalNotification.NoticeTitle, err.Error())
		sendFail(c, 5002, "编辑失败"+err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "NOTIFICATION",
		"编辑通知成功: "+originalNotification.NoticeTitle)
	sendSuccess(c, nil, "编辑成功")
}
