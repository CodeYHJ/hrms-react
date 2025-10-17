package service

import (
	"log"

	"github.com/robfig/cron/v3"
)

// InitCron 初始化定时任务
func InitCron() {
	c := cron.New()

	// 每月最后一天23:59执行考勤报表自动更新
	c.AddFunc("59 23 L * *", func() {
		log.Println("开始执行月末考勤报表自动更新...")
		AutoUpdateAttendanceReports()
		log.Println("月末考勤报表自动更新完成")
	})

	c.Start()
	log.Println("定时任务初始化成功")
}