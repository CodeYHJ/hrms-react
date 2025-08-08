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
		// 密码管理信息相关
		passwordGroup := r.Group("/password")
		passwordGroup.GET("/query/:staff_id", PasswordQuery)
		passwordGroup.POST("/edit", PasswordEdit)
	})
}

// 查询所有密码
// @Summary 查询所有密码
// @Description 查询所有密码
// @Tags password
// @Accept  json
// @Produce  json
// @Success 200 {object} model.PasswordQueryVO
// @Failure 500 {object} Response
// @Router /api/password/query/{staff_id} [get]
func PasswordQuery(c *gin.Context) {
	var total int64 = 1
	// 分页
	start, limit := service.AcceptPage(c)
	staffId := c.Param("staff_id")
	log.Printf("[config.Init] buildPasswordQueryResult,config=%v", staffId)
	var psws []model.PasswordQueryVO
	result, err := buildPasswordQueryResult(c, staffId, start, limit)
	if err != nil {
		sendFail(c, 5000, err.Error())
		return
	}
	// 总记录数
	resource.HrmsDB(c).Where("staff_id != 'root' and staff_id != 'admin'").Model(&model.Staff{}).Count(&total)
	psws = result
	sendSuccess(c, psws, "")

}

func buildPasswordQueryResult(c *gin.Context, staffId string, start int, limit int) ([]model.PasswordQueryVO, error) {
	var loginList []model.Authority
	var err error
	if staffId == "all" {
		// 查询全部
		if start == -1 && limit == -1 {

			// 不加分页
			err = resource.HrmsDB(c).Where("staff_id != 'root' and staff_id != 'admin'").Find(&loginList).Error
		} else {
			// 加分页
			err = resource.HrmsDB(c).Where("staff_id != 'root' and staff_id != 'admin'").Offset(start).Limit(limit).Find(&loginList).Error
		}
	} else {
		// 查询单个用户
		err = resource.HrmsDB(c).Where("staff_id != 'root' and staff_id != 'admin'").Where("staff_id = ?", staffId).First(&loginList).Error
	}
	if err != nil {
		log.Printf("[buildPasswordQueryResult] err = %v", err)
		return nil, err
	}
	var queryVOs []model.PasswordQueryVO
	for _, loginData := range loginList {
		queryVO := model.PasswordQueryVO{
			Id:        int64(loginData.ID),
			StaffId:   loginData.StaffId,
			StaffName: convertStaffIdToName(c, loginData.StaffId),
			Password:  loginData.UserPassword,
		}
		queryVOs = append(queryVOs, queryVO)
	}
	return queryVOs, nil
}

type Result struct {
	StaffName string `json:"staff_name"`
}

func convertStaffIdToName(c *gin.Context, staffId string) string {
	var result Result
	resource.HrmsDB(c).Raw("select staff_name from staff where staff_id = ?", staffId).Scan(&result)
	return result.StaffName
}

// 修改密码
// @Summary 修改密码
// @Description 修改密码
// @Tags password
// @Accept  json
// @Produce  json
// @Param password body model.PasswordEditDTO true "密码信息"
// @Success 200 {object} Response
// @Failure 500 {object} Response
// @Router /api/password/edit [post]
func PasswordEdit(c *gin.Context) {
	var passwordEditDTO model.PasswordEditDTO
	if err := c.Bind(&passwordEditDTO); err != nil {
		log.Printf("[PasswordEdit] err = %v", err)
		sendFail(c, 5000, err.Error())
		return
	}
	staffId := passwordEditDTO.StaffId
	password := service.MD5(passwordEditDTO.Password)
	if err := resource.HrmsDB(c).Where("staff_id = ?", staffId).Updates(&model.Authority{
		UserPassword: password,
	}).Error; err != nil {

		sendFail(c, 5000, err.Error())
		return
	}
	sendSuccess(c, nil, "密码修改成功")

}
