package handler

import (
	"hrms/model"
	"hrms/resource"
	"log"

	"github.com/gin-gonic/gin"
)

func init() {
	Register(func(r *gin.RouterGroup) {
		companyGroup := r.Group("/company")
		companyGroup.GET("/query", BranchCompanyQuery)
	})
}

// 查询公司列表
// @Summary 查询公司列表
// @Tags 公司
// @Produce  json
// @Success 200 {object} model.BranchCompany
// @Router /api/company/query [get]
func BranchCompanyQuery(c *gin.Context) {
	var list []*model.BranchCompany
	if err := resource.DefaultDb.Find(&list).Error; err != nil {
		log.Println("GetBranchCompanyList err = %v", err)
		log.Printf("BranchCompanyQuery err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	sendSuccess(c, list, "")

}
