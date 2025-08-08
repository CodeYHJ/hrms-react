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
}

func htmlInit(server *gin.Engine) {
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
}
