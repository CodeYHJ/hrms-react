package main

import (
	"fmt"
	"hrms/handler"
	"hrms/resource"
	"log"
	"net/http"
	"os"
	"strings"

	_ "hrms/docs"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

func InitConfig() error {
	config := &resource.Config{}
	vip := viper.New()
	vip.AddConfigPath("./config")
	vip.SetConfigType("yaml")
	// 环境判断
	env := os.Getenv("HRMS_ENV")
	if env == "" || env == "dev" {
		// 开发环境
		vip.SetConfigName("config-dev")
	}
	if env == "prod" {
		// 生产环境
		vip.SetConfigName("config-prod")
	}
	if env == "self" {
		// 生产环境
		vip.SetConfigName("config-self")
	}
	err := vip.ReadInConfig()
	if err != nil {
		log.Printf("[config.Init] err = %v", err)
		return err
	}
	if err := vip.Unmarshal(config); err != nil {
		log.Printf("[config.Init] err = %v", err)
		return err
	}
	log.Printf("[config.Init] 初始化配置成功,config=%v", config)
	resource.HrmsConf = config
	return nil
}

func InitGin() error {
	server := gin.Default()

	// 初始化swag
	swagInit(server)
	// 初始化路由
	routerInit(server)
	// 静态资源及模板配置
	htmlInit(server)
	err := server.Run(fmt.Sprintf(":%v", resource.HrmsConf.Gin.Port))
	if err != nil {
		log.Printf("[InitGin] err = %v", err)
	}
	log.Printf("[InitGin] success")
	return err
}
func swagInit(server *gin.Engine) {
	server.GET("/api/openapi.json", func(c *gin.Context) {
		data, err := os.ReadFile("docs/swagger.json")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json; charset=utf-8", data)
	})
}
func routerInit(server *gin.Engine) {
	handler.InitRoutes(server)
	// 测试
	// server.GET("/ping", handler.Ping)
	// // 权限重定向
	// server.GET("/authority_render/:modelName", handler.RenderAuthority)
	// 首页重定向
	// server.GET("/index", handler.Index)
	// 账户相关
	// accountGroup := server.Group("/account")
	// accountGroup.POST("/login", handler.Login)
	// accountGroup.POST("/quit", handler.Quit)
	// 部门相关
	// departGroup := server.Group("/depart")
	// departGroup.POST("/create", handler.DepartCreate)
	// departGroup.DELETE("/del/:dep_id", handler.DepartDel)
	// departGroup.POST("/edit", handler.DepartEdit)
	// departGroup.GET("/query/:dep_id", handler.DepartQuery)
	// 职级相关
	// rankGroup := server.Group("/rank")
	// rankGroup.POST("/create", handler.RankCreate)
	// rankGroup.DELETE("/del/:rank_id", handler.RankDel)
	// rankGroup.POST("/edit", handler.RankEdit)
	// rankGroup.GET("/query/:rank_id", handler.RankQuery)
	// 员工信息相关
	// staffGroup := server.Group("/staff")
	// staffGroup.POST("/create", handler.StaffCreate)
	// staffGroup.POST("/excel_export", handler.ExcelExport)
	// staffGroup.DELETE("/del/:staff_id", handler.StaffDel)
	// staffGroup.POST("/edit", handler.StaffEdit)
	// staffGroup.GET("/query/:staff_id", handler.StaffQuery)
	// staffGroup.GET("/query_by_name/:staff_name", handler.StaffQueryByName)
	// staffGroup.GET("/query_by_dep/:dep_name", handler.StaffQueryByDep)
	// staffGroup.GET("/query_by_staff_id/:staff_id", handler.StaffQueryByStaffId)
	// 密码管理信息相关
	// passwordGroup := server.Group("/password")
	// passwordGroup.GET("/query/:staff_id", handler.PasswordQuery)
	// passwordGroup.GET("/query/all", handler.PasswordQuery)
	// passwordGroup.POST("/edit", handler.PasswordEdit)
	// 授权信息相关
	// authorityGroup := server.Group("/authority")
	// authorityGroup.POST("/create", handler.AddAuthorityDetail)
	// authorityGroup.POST("/edit", handler.UpdateAuthorityDetailById)
	// authorityGroup.GET("/query_by_user_type/:user_type", handler.GetAuthorityDetailListByUserType)
	// authorityGroup.POST("/query_by_user_type_and_model", handler.GetAuthorityDetailByUserTypeAndModel)
	// authorityGroup.POST("/set_admin/:staff_id", handler.SetAdminByStaffId)
	// authorityGroup.POST("/set_normal/:staff_id", handler.SetNormalByStaffId)
	// 通知相关
	// notificationGroup := server.Group("/notification")
	// notificationGroup.POST("/create", handler.CreateNotification)
	// notificationGroup.DELETE("/delete/:notice_id", handler.DeleteNotificationById)
	// notificationGroup.POST("/edit", handler.UpdateNotificationById)
	// notificationGroup.GET("/query/:notice_title", handler.GetNotificationByTitle)
	// 分公司相关
	// companyGroup := server.Group("/company")
	// companyGroup.GET("/query", handler.BranchCompanyQuery)
	// 薪资相关
	// salaryGroup := server.Group("/salary")
	// salaryGroup.POST("/create", handler.CreateSalary)
	// salaryGroup.DELETE("/delete/:salary_id", handler.DelSalary)
	// salaryGroup.POST("/edit", handler.UpdateSalaryById)
	// salaryGroup.GET("/query/:staff_id", handler.GetSalaryByStaffId)
	// salaryGroup.GET("/query/all", handler.GetSalaryByStaffId)
	// 薪资发放相关
	// salaryRecordGroup := server.Group("/salary_record")
	//salaryRecordGroup.POST("/create", handler.CreateSalaryRecord)
	//salaryRecordGroup.DELETE("/delete/:salary_record_id", handler.DelSalaryRecord)
	//salaryRecordGroup.POST("/edit", handler.UpdateSalaryRecordById)
	// salaryRecordGroup.GET("/query/:staff_id", handler.GetSalaryRecordByStaffId)
	// salaryRecordGroup.GET("/query/all", handler.GetSalaryRecordByStaffId)
	// salaryRecordGroup.GET("/get_salary_record_is_pay_by_id/:id", handler.GetSalaryRecordIsPayById)
	// salaryRecordGroup.GET("/pay_salary_record_by_id/:id", handler.PaySalaryRecordById)
	// salaryRecordGroup.GET("/query_history/:staff_id", handler.GetHadPaySalaryRecordByStaffId)
	// salaryRecordGroup.GET("/query_history/all", handler.GetHadPaySalaryRecordByStaffId)
	// 考勤相关
	// attendGroup := server.Group("/attendance_record")
	// attendGroup.POST("/create", handler.CreateAttendRecord)
	// attendGroup.DELETE("/delete/:attendance_id", handler.DelAttendRecordByAttendId)
	// attendGroup.POST("/edit", handler.UpdateAttendRecordById)
	// attendGroup.GET("/query/:staff_id", handler.GetAttendRecordByStaffId)
	// attendGroup.GET("/query_history/:staff_id", handler.GetAttendRecordHistoryByStaffId)
	// attendGroup.GET("/query_history/all", handler.GetAttendRecordHistoryByStaffId)
	// attendGroup.GET("/get_attend_record_is_pay/:staff_id/:date", handler.GetAttendRecordIsPayByStaffIdAndDate)
	// attendGroup.GET("/approve/query/:leader_staff_id", handler.GetAttendRecordApproveByLeaderStaffId)
	// attendGroup.GET("/approve/query/all", handler.GetAttendRecordApproveByLeaderStaffId)
	// attendGroup.GET("/approve_accept/:attendId", handler.ApproveAccept)
	// attendGroup.GET("/approve_reject/:attendId", handler.ApproveReject)
	// 招聘信息相关
	// recruitmentGroup := server.Group("/recruitment")
	// recruitmentGroup.POST("/create", handler.CreateRecruitment)
	// recruitmentGroup.DELETE("/delete/:recruitment_id", handler.DelRecruitmentByRecruitmentId)
	// recruitmentGroup.POST("/edit", handler.UpdateRecruitmentById)
	// recruitmentGroup.GET("/query/:job_name", handler.GetRecruitmentByJobName)
	// 候选人管理相关
	// candidateGroup := server.Group("/candidate")
	// candidateGroup.POST("/create", handler.CreateCandidate)
	// candidateGroup.DELETE("/delete/:candidate_id", handler.DelCandidateByCandidateId)
	// candidateGroup.POST("/edit", handler.UpdateCandidateById)
	// candidateGroup.GET("/query_by_name/:name", handler.GetCandidateByName)
	// candidateGroup.GET("/query_by_staff_id/:staff_id", handler.GetCandidateByStaffId)
	// candidateGroup.GET("/reject/:id", handler.SetCandidateRejectById)
	// candidateGroup.GET("/accept/:id", handler.SetCandidateAcceptById)
	// // 考试管理相关
	// exampleGroup := server.Group("/example")
	// exampleGroup.POST("/create", handler.CreateExample)
	// exampleGroup.POST("/parse_example_content", handler.ParseExampleContent)
	// exampleGroup.DELETE("/delete/:example_id", handler.DelExample)
	// exampleGroup.POST("/edit", handler.UpdateExampleById)
	// exampleGroup.GET("/query/:name", handler.GetExampleByName)
	// exampleGroup.GET("/render_example/:id", handler.RenderExample)
	// // 考试成绩相关
	// exampleScoreGroup := server.Group("/example_score")
	// exampleScoreGroup.POST("/create", handler.CreateExampleScore)
	// exampleScoreGroup.GET("/query_by_name/:name", handler.GetExampleHistoryByName)
	// exampleScoreGroup.GET("/query_by_staff_id/:staff_id", handler.GetExampleHistoryByStafId)
}

func htmlInit(server *gin.Engine) {
	// 原有静态资源（保持现有功能）
	// server.StaticFS("/static", http.Dir("./static"))
	// server.StaticFS("/views", http.Dir("./views"))

	// React应用静态资源服务（JS、CSS、图片等）
	server.Static("/app/assets", "./dist/assets")

	// React应用路由处理
	server.GET("/app/", func(c *gin.Context) {
		c.File("./dist/index.html")
	})

	// 根路径重定向到React应用
	server.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/app/")
	})

	// // 直接访问 /dist 重定向到 React 应用
	// server.GET("/dist", func(c *gin.Context) {
	// 	c.Redirect(http.StatusMovedPermanently, "/app/")
	// })
	// server.GET("/dist/*path", func(c *gin.Context) {
	// 	c.Redirect(http.StatusMovedPermanently, "/app/")
	// })

	// 404页面处理
	server.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// 如果是API请求，返回JSON错误
		if strings.HasPrefix(path, "/account") ||
			strings.HasPrefix(path, "/staff") ||
			strings.HasPrefix(path, "/depart") ||
			strings.HasPrefix(path, "/rank") ||
			strings.HasPrefix(path, "/company") ||
			strings.HasPrefix(path, "/password") ||
			strings.HasPrefix(path, "/authority") ||
			strings.HasPrefix(path, "/notification") ||
			strings.HasPrefix(path, "/salary") ||
			strings.HasPrefix(path, "/attendance_record") ||
			strings.HasPrefix(path, "/recruitment") ||
			strings.HasPrefix(path, "/candidate") ||
			strings.HasPrefix(path, "/example") {
			c.JSON(404, gin.H{"status": 404, "msg": "API not found"})
			return
		}

		// 如果是 /app/* 路径（除了 /app/assets），返回 React 应用
		if strings.HasPrefix(path, "/app/") && !strings.HasPrefix(path, "/app/assets/") {
			c.File("./dist/index.html")
			return
		}

		// 其他404
		c.JSON(404, gin.H{"status": 404, "msg": "Not found"})
	})
}

func InitGorm() error {
	// "user:pass@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
	// 对每个分公司数据库进行连接
	dbNames := resource.HrmsConf.Db.DbName
	dbNameList := strings.Split(dbNames, ",")
	for index, dbName := range dbNameList {
		dsn := fmt.Sprintf(
			"%v:%v@tcp(%v:%v)/%v?charset=utf8mb4&parseTime=True&loc=Local",
			resource.HrmsConf.Db.User,
			resource.HrmsConf.Db.Password,
			resource.HrmsConf.Db.Host,
			resource.HrmsConf.Db.Port,
			dbName,
		)
		db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
			NamingStrategy: schema.NamingStrategy{
				// 全局禁止表名复数
				SingularTable: true,
			},
			// 日志等级
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			log.Printf("[InitGorm] err = %v", err)
			return err
		}
		// 添加到映射表中
		resource.DbMapper[dbName] = db
		// 第一个是默认DB，用以启动程序选择分公司
		if index == 0 {
			resource.DefaultDb = db
		}
		log.Printf("[InitGorm] 分公司数据库%v注册成功", dbName)
	}
	//fmt.Println(resource.DbMapper["hrms_C001"])
	log.Printf("[InitGorm] success")
	return nil
}

//func InitMongo() error {
//	mongo := resource.HrmsConf.Mongo
//	var err error
//	resource.MongoClient, err = qmgo.NewClient(context.Background(), &qmgo.Config{
//		Uri:      fmt.Sprintf("mongodb://%v:%v", mongo.IP, mongo.Port),
//		Database: mongo.Dataset,
//	})
//	if err != nil {
//		return err
//	}
//	return nil
//}

func main() {
	if err := InitConfig(); err != nil {
		log.Fatal(err)
	}
	if err := InitGorm(); err != nil {
		log.Fatal(err)
	}
	if err := InitGin(); err != nil {
		log.Fatal(err)
	}
	//if err := InitMongo(); err != nil {
	//	log.Fatal(err)
	//}
}
