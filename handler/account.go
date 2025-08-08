package handler

import (
	"encoding/base64"
	"fmt"
	"hrms/model"
	"hrms/resource"
	"hrms/service"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func init() {
	Register(func(r *gin.RouterGroup) {
		r.GET("/ping", Ping)
		r.GET("/authority_render/:modelName", RenderAuthority)
		r.GET("/index", Index)

		accountGroup := r.Group("/account")
		{
			accountGroup.POST("/login", Login)
			accountGroup.POST("/quit", Quit)
		}
	})
}

// Ping godoc
// @Summary ping
// @Description ping
// @Tags account
// @Accept json
// @Produce json
// @Success 200 {string} string "ok"
// @Router /api/ping [get]
func Ping(c *gin.Context) {
	c.HTML(http.StatusOK, "staff_manage.html", gin.H{
		"create": true,
	})
}

// RenderAuthority godoc
// @Summary 权限重定向
// @Description 权限重定向
// @Tags account
// @Accept json
// @Produce json
// @Success 200 {string} string "ok"
// @Router /api/authority_render/:modelName [get]
func RenderAuthority(c *gin.Context) {
	cookie, err := c.Cookie("user_cookie")
	if err != nil || cookie == "" {
		c.HTML(http.StatusOK, "login.html", nil)
		return
	}
	modelName := c.Param("modelName")
	userType := strings.Split(cookie, "_")[0]
	dto := &model.GetAuthorityDetailDTO{
		UserType: userType,
		Model:    modelName,
	}
	autoContent, err := service.GetAuthorityDetailByUserTypeAndModel(c, dto)
	if err != nil {
		c.HTML(http.StatusOK, "login.html", nil)
		return
	}
	autoMap := make(map[string]bool)
	autoList := strings.Split(autoContent, "|")
	for _, autority := range autoList {
		autoMap[autority] = true
	}
	//c.JSON(200, autoMap)
	c.HTML(http.StatusOK, modelName+".html", autoMap)
}

// Index godoc
// @Summary 首页重定向
// @Description 首页重定向
// @Tags account
// @Accept json
// @Produce json
// @Success 200 {string} string "ok"
// @Router /api/index [get]
func Index(c *gin.Context) {
	// 判断是否存在cookie
	cookie, err := c.Cookie("user_cookie")
	if err != nil || cookie == "" {
		c.HTML(http.StatusOK, "login.html", nil)
		return
	}
	// 已登陆
	user := strings.Split(cookie, "_")
	userType := user[0]
	userNo := user[1]
	userName := user[3]
	c.HTML(http.StatusOK, "index.html", gin.H{
		//"title":     fmt.Sprintf("欢迎%v:%v登陆HRMS", userType, userNo),
		"title":      fmt.Sprintf("分公司-人力资源管理系统"),
		"user_type":  userType,
		"staff_id":   userNo,
		"staff_name": base64Decode(userName),
	})
}

func base64Decode(name string) string {
	decodeBytes, err := base64.StdEncoding.DecodeString(name)
	if err != nil {
		log.Fatalln(err)
		return "企业员工"
	}
	return string(decodeBytes)
}

// Login godoc
// @Summary 登陆
// @Description 登陆
// @Tags account
// @Accept json
// @Produce json
// @Param data body model.LoginDTO true "登录信息"
// @Success 200 {object} Response "登录成功"
// @Failure 200 {object} Response "登录失败"
// @Router /api/account/login [post]
func Login(c *gin.Context) {
	var loginR model.LoginDTO
	if err := c.ShouldBindJSON(&loginR); err != nil {
		log.Printf("[handler.Login] err = %v", err)
		sendFail(c, 5001, err.Error())
		// c.JSON(200, gin.H{
		// 	"status": 5001,
		// 	"result": err.Error(),
		// })
		return
	}
	dbName := fmt.Sprintf("hrms_%v", loginR.BranchId)
	log.Printf("[login db name = %v]", dbName)
	var hrmsDB *gorm.DB
	var ok bool
	if hrmsDB, ok = resource.DbMapper[dbName]; !ok {
		log.Printf("[Login err, 无法获取到该分公司db名称, name = %v]", dbName)
		// c.JSON(200, gin.H{
		// 	"status": 5000,
		// 	"result": fmt.Sprintf("[Login err, 无法获取到该分公司db名称, name = %v]", dbName),
		// })
		sendFail(c, 5000, fmt.Sprintf("[Login err, 无法获取到该分公司db名称, name = %v]", dbName))
		return
	}
	log.Printf("[handler.Login] login R = %v", loginR)
	var loginDb model.Authority
	var staff model.Staff
	hrmsDB.Where("staff_id = ? and user_password = ?",
		loginR.UserNo, service.MD5(loginR.UserPassword)).First(&loginDb)
	if loginDb.StaffId != loginR.UserNo {
		log.Printf("[handler.Login] user login fail, user = %v", loginR)
		// c.JSON(200, gin.H{
		// 	"status": 2001,
		// 	"result": "check fail",
		// })
		sendFail(c, 2001, "check fail")
		return
	}
	hrmsDB.Where("staff_id = ?", loginDb.StaffId).Find(&staff)

	log.Printf("[handler.Login] user login success, user = %v", loginR)
	// set cookie user_cookie=角色_工号_分公司ID_员工姓名(base64编码)
	c.SetCookie("user_cookie", fmt.Sprintf("%v_%v_%v_%v", loginDb.UserType, loginDb.StaffId, loginR.BranchId,
		base64.StdEncoding.EncodeToString([]byte(staff.StaffName))), 0, "/", "*", false, false)

	// c.JSON(200, gin.H{
	// 	"status": 2000,
	// })
	sendSuccess(c, 2000, "登录成功")
}

// Quit godoc
// @Summary 退出
// @Description 退出
// @Tags account
// @Accept json
// @Produce json
// @Success 200 {object} Response "退出成功"
// @Router /api/account/quit [post]
func Quit(c *gin.Context) {
	c.SetCookie("user_cookie", "null", -1, "/", "*", false, false)
	c.JSON(200, gin.H{
		"status": 2000,
	})
}
