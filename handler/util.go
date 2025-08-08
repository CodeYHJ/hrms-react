package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response 统一响应结构体
type PageResponse struct {
	Code    int         `json:"code"` // 状态码
	Status  bool        `json:"status"`
	Message interface{} `json:"message"` // 响应消息
	Data    interface{} `json:"data"`    // 响应数据
	Total   int64       `json:"total"`   // 数据总数（用于分页）
}
type Response struct {
	Code    int         `json:"code"`    // 状态码
	Status  bool        `json:"status"`  // 状态码
	Message interface{} `json:"message"` // 响应消息
	Data    interface{} `json:"data"`    // 响应数据
}

func sendSuccess(c *gin.Context, data interface{}, msg string) {
	c.JSON(http.StatusOK, Response{Code: 200, Status: true, Message: msg, Data: data})
}

func sendTotalSuccess(c *gin.Context, data interface{}, total int64, msg string) {
	c.JSON(http.StatusOK, PageResponse{Code: 200, Status: true, Message: msg, Data: data})
}

func sendFail(c *gin.Context, code int, msg string) {
	c.JSON(http.StatusOK, Response{Code: 200, Status: false, Message: msg, Data: nil})
}
