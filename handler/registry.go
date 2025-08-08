package handler

import "github.com/gin-gonic/gin"

// 注册函数的类型
type RouteRegister func(r *gin.RouterGroup)

// 保存所有注册函数
var registers []RouteRegister

// Register 用于在 init() 中注册路由
func Register(fn RouteRegister) {
	registers = append(registers, fn)
}

// InitRoutes 在 main.go 调用，一次性执行所有注册
func InitRoutes(r *gin.Engine) {
	// 创建统一前缀组
	apiGroup := r.Group("/api")
	for _, fn := range registers {
		fn(apiGroup)
	}
}
