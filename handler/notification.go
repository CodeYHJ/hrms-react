package handler

import (
	"hrms/model"
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
		log.Printf("[CreateNotification] err = %v", err)
		sendFail(c, 5001, "添加失败"+err.Error())
		return
	}
	// 业务处理
	err := service.CreateNotification(c, &notificationDTO)
	if err != nil {
		log.Printf("[CreateNotification] err = %v", err)
		sendFail(c, 5002, "添加失败"+err.Error())
		return
	}
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
	// 业务处理
	err := service.DelNotificationById(c, noticeId)
	if err != nil {
		log.Printf("[DeleteNotificationById] err = %v", err)
		// c.JSON(200, gin.H{
		// 	"status": 5002,
		// 	"result": err.Error(),
		// })
		sendFail(c, 5002, "删除失败"+err.Error())
		return
	}
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
		log.Printf("[UpdateNotificationById] err = %v", err)
		sendFail(c, 5001, "编辑失败"+err.Error())
		return
	}
	// 业务处理
	err := service.UpdateNotificationById(c, &dto)
	if err != nil {
		log.Printf("[UpdateNotificationById] err = %v", err)
		sendFail(c, 5002, "编辑失败"+err.Error())
		return
	}
	sendSuccess(c, nil, "编辑成功")

}
