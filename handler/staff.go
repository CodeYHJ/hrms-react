package handler

import (
	"errors"
	"fmt"
	"hrms/model"
	"hrms/resource"
	"hrms/service"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync/atomic"

	"github.com/gin-gonic/gin"
	"github.com/tealeg/xlsx"
	"golang.org/x/sync/errgroup"
	"gorm.io/gorm"
)

type StaffListVO struct {
	model.Staff
	RankName string `json:"rank_name"`
	DepName  string `json:"dep_name"`
}

func init() {

	Register(func(r *gin.RouterGroup) {
		staffGroup := r.Group("/staff")
		staffGroup.POST("/create", StaffCreate)
		staffGroup.POST("/excel_export", ExcelExport)
		staffGroup.DELETE("/del/:staff_id", StaffDel)
		staffGroup.POST("/edit", StaffEdit)
		staffGroup.GET("/query/:staff_id", StaffQuery)
		staffGroup.GET("/query_by_name/:staff_name", StaffQueryByName)
		staffGroup.GET("/query_by_dep/:dep_name", StaffQueryByDep)
		staffGroup.GET("/query_by_staff_id/:staff_id", StaffQueryByStaffId)
		// 员工生命周期相关
		staffGroup.POST("/onboard", StaffOnboard)
		staffGroup.POST("/promote", StaffPromote)
		staffGroup.POST("/transfer", StaffTransfer)
		staffGroup.POST("/resign", StaffResign)
		staffGroup.GET("/list", StaffList)
	})
}

// 创建员工信息
// @Summary 新增员工信息
// @Tags staff
// @Accept  json
// @Produce  json
// @Param staff body model.StaffCreateDTO true "员工信息"
// @Router /api/staff/create [post]
func StaffCreate(c *gin.Context) {
	var staffCreateDto model.StaffCreateDTO
	if err := c.BindJSON(&staffCreateDto); err != nil {
		log.Printf("[StaffCreate] err = %v", err)
		sendFail(c, 5001, "添加失败"+err.Error())
		return
	}
	log.Printf("[StaffCreate staff = %v]", staffCreateDto)

	// 获取当前操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	// 创建员工信息落表
	if staff, err := buildStaffInfoSaveDB(c, staffCreateDto); err != nil {
		log.Printf("[StaffCreate err = %v]", err)
		LogOperationFailure(c, staffId, staffName, "CREATE", "STAFF",
			"创建员工: "+staffCreateDto.StaffName, err.Error())
		sendFail(c, 5001, "添加失败"+err.Error())
	} else {
		LogOperationSuccess(c, staffId, staffName, "CREATE", "STAFF",
			"创建员工: "+staffCreateDto.StaffName)
		sendSuccess(c, staff, "添加员工信息成功")
	}
}

func buildStaffInfoSaveDB(c *gin.Context, staffCreateDto model.StaffCreateDTO) (model.Staff, error) {
	staffID := service.RandomStaffId()
	staff := model.Staff{
		StaffId:       staffID,
		StaffName:     staffCreateDto.StaffName,
		LeaderStaffId: staffCreateDto.LeaderStaffId,
		Phone:         staffCreateDto.Phone,
		Birthday:      staffCreateDto.BirthdayStr,
		IdentityNum:   staffCreateDto.IdentityNum,
		Sex:           service.SexStr2Int64(staffCreateDto.SexStr),
		Nation:        staffCreateDto.Nation,
		School:        staffCreateDto.School,
		Major:         staffCreateDto.Major,
		EduLevel:      staffCreateDto.EduLevel,
		BaseSalary:    staffCreateDto.BaseSalary,
		CardNum:       staffCreateDto.CardNum,
		RankId:        staffCreateDto.RankId,
		DepId:         staffCreateDto.DepId,
		Email:         staffCreateDto.Email,
		EntryDate:     staffCreateDto.EntryDateStr,
	}
	var exist int64
	resource.HrmsDB(c).Model(&model.Staff{}).Where("identity_num = ? or staff_id = ?", staffCreateDto.IdentityNum, staffID).Count(&exist)
	if exist != 0 {
		return staff, errors.New("已经存在该员工")
	}
	// 查询leader名称
	var leader model.Staff
	resource.HrmsDB(c).Where("staff_id = ?", staffCreateDto.LeaderStaffId).Find(&leader)
	staff.LeaderName = leader.StaffName
	// 创建登陆信息，密码为身份证后六位
	identLen := len(staff.IdentityNum)
	login := model.Authority{
		AuthorityId:  service.RandomID("auth"),
		StaffId:      staffID,
		UserPassword: service.MD5(staff.IdentityNum[identLen-6 : identLen]),
		//Aval:         1,
		UserType: "normal", // 暂时只能创建普通员工
	}
	err := resource.HrmsDB(c).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&staff).Error; err != nil {
			return err
		}
		if err := tx.Create(&login).Error; err != nil {
			return err
		}
		return nil
	})

	return staff, err
}

// 编辑员工信息
// @Summary 编辑员工信息
// @Tags staff
// @Accept  json
// @Produce  json
// @Param staff body model.StaffCreateDTO true "员工信息"
// @Router /api/staff/edit [post]
func StaffEdit(c *gin.Context) {
	var staffEditDTO model.StaffEditDTO
	if err := c.BindJSON(&staffEditDTO); err != nil {
		log.Printf("[StaffEdit] err = %v", err)
		sendFail(c, 5001, "编辑失败"+err.Error())
		return
	}
	log.Printf("[StaffEdit staff = %v]", staffEditDTO)

	// 获取当前操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	staff := model.Staff{
		StaffId:       staffEditDTO.StaffId,
		StaffName:     staffEditDTO.StaffName,
		LeaderStaffId: staffEditDTO.LeaderStaffId,
		Phone:         staffEditDTO.Phone,
		Birthday:      staffEditDTO.BirthdayStr,
		IdentityNum:   staffEditDTO.IdentityNum,
		Sex:           service.SexStr2Int64(staffEditDTO.SexStr),
		Nation:        staffEditDTO.Nation,
		School:        staffEditDTO.School,
		Major:         staffEditDTO.Major,
		EduLevel:      staffEditDTO.EduLevel,
		BaseSalary:    staffEditDTO.BaseSalary,
		CardNum:       staffEditDTO.CardNum,
		RankId:        staffEditDTO.RankId,
		DepId:         staffEditDTO.DepId,
		Email:         staffEditDTO.Email,
		EntryDate:     staffEditDTO.EntryDateStr,
	}
	// 查询leader名称
	var leader model.Staff
	resource.HrmsDB(c).Where("staff_id = ?", staffEditDTO.LeaderStaffId).Find(&leader)
	staff.LeaderName = leader.StaffName

	result := resource.HrmsDB(c).Model(&model.Staff{}).Where("staff_id = ?", staffEditDTO.StaffId).Updates(&staff)
	if result.Error != nil {
		LogOperationFailure(c, staffId, staffName, "UPDATE", "STAFF",
			"编辑员工: "+staffEditDTO.StaffName, result.Error.Error())
		sendFail(c, 5001, "编辑失败"+result.Error.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "STAFF",
		"编辑员工: "+staffEditDTO.StaffName)
	sendSuccess(c, staff, "编辑成功")
}

// 根据员工ID查询员工信息
// @Summary 根据员工ID查询员工信息
// @Tags staff
// @Accept  json
// @Produce  json
// @Param staff_id path string true "员工ID"
// @Router /api/staff/query/{staff_id} [get]
func StaffQuery(c *gin.Context) {
	var total int64 = 1
	// 分页
	start, limit := service.AcceptPage(c)
	staffId := c.Param("staff_id")
	var staffs []model.Staff
	if staffId == "all" {
		// 查询全部
		if start == -1 && start == -1 {
			resource.HrmsDB(c).Where("staff_id != 'root' and staff_id != 'admin'").Find(&staffs)
		} else {
			resource.HrmsDB(c).Where("staff_id != 'root' and staff_id != 'admin'").Offset(start).Limit(limit).Find(&staffs)
		}
		if len(staffs) == 0 {
			// 不存在
			sendFail(c, 2001, "不存在")
			return
		}
		// 总记录数
		resource.HrmsDB(c).Model(&model.Staff{}).Where("staff_id != 'root' and staff_id != 'admin'").Count(&total)

		sendTotalSuccess(c, convert2VO(c, staffs), total, "")
		return
	}
	resource.HrmsDB(c).Where("staff_id = ? and staff_id != 'root' and staff_id != 'admin'", staffId).Find(&staffs)
	if len(staffs) == 0 {
		sendFail(c, 2001, "不存在")
		return
	}
	total = int64(len(staffs))
	sendTotalSuccess(c, convert2VO(c, staffs), total, "")

}

func getRuleByStaffId(c *gin.Context, staffId string) string {
	var authority model.Authority
	var userTypeName string
	if err := resource.HrmsDB(c).Where("staff_id = ?", staffId).Find(&authority).Error; err == nil {
		switch authority.UserType {
		case "supersys":
			userTypeName = "超级管理员"
		case "sys":
			userTypeName = "系统管理员"
		case "normal":
			userTypeName = "普通员工"
		default:
			userTypeName = "未知"
		}
	}
	return userTypeName
}
func convert2VO(c *gin.Context, staffs []model.Staff) []model.StaffVO {
	var staffVOs []model.StaffVO
	for _, staff := range staffs {
		staffVOs = append(staffVOs, model.StaffVO{
			Staff:        staff,
			DepName:      service.GetDepNameByDepId(c, staff.DepId),
			RankName:     service.GetRankNameRankDepId(c, staff.RankId),
			UserTypeName: getRuleByStaffId(c, staff.StaffId),
		})
	}
	return staffVOs
}

// 根据员工姓名查询员工信息
// @Summary 根据员工姓名查询员工信息
// @Tags staff
// @Accept  json
// @Produce  json
// @Param staff_name path string true "员工姓名"
// @Router /api/staff/query_by_name/{staff_name} [get]
func StaffQueryByName(c *gin.Context) {
	var total int64 = 1
	// 分页
	start, limit := service.AcceptPage(c)
	code := 2000
	staffName := c.Param("staff_name")
	var staffs []model.Staff
	if staffName == "all" {
		// 查询全部
		if start == -1 && start == -1 {
			resource.HrmsDB(c).Where("staff_id != 'root' and staff_id != 'admin'").Find(&staffs)
		} else {
			resource.HrmsDB(c).Where("staff_id != 'root' and staff_id != 'admin'").Offset(start).Limit(limit).Find(&staffs)
		}
		if len(staffs) == 0 {
			// 不存在
			code = 2001
		}
		// 总记录数
		resource.HrmsDB(c).Model(&model.Staff{}).Where("staff_id != 'root' and staff_id != 'admin'").Count(&total)
		c.JSON(http.StatusOK, gin.H{
			"status": code,
			"total":  total,
			"data":   convert2VO(c, staffs),
		})
		return
	}
	resource.HrmsDB(c).Where("staff_name like ?", "%"+staffName+"%").Where("staff_id != 'root' and staff_id != 'admin'").Find(&staffs)
	if len(staffs) == 0 {
		// 不存在
		code = 2001
	}
	total = int64(len(staffs))
	c.JSON(http.StatusOK, gin.H{
		"status": code,
		"total":  total,
		"data":   convert2VO(c, staffs),
	})
}

// 根据部门查询员工信息
// @Summary 根据部门查询员工信息
// @Tags staff
// @Accept  json
// @Produce  json
// @Param dep_name path string true "部门名称"
// @Router /api/staff/query_by_dep/{dep_name} [get]
func StaffQueryByDep(c *gin.Context) {
	var total int64 = 1
	// 分页
	start, limit := service.AcceptPage(c)
	code := 2000
	depName := c.Param("dep_name")
	var staffs []model.Staff
	reqSql := `select * from staff as staff left join department as dep on staff.dep_id = dep.dep_id where staff.deleted_at is null and dep.dep_name like "%v"`
	if start != -1 && limit != -1 {
		reqSql += fmt.Sprintf(` limit %v,%v`, start, limit)
	}
	reqSql = fmt.Sprintf(reqSql, "%"+depName+"%")
	resource.HrmsDB(c).Raw(reqSql).Scan(&staffs)
	if len(staffs) == 0 {
		// 不存在
		code = 2001
	}
	total = int64(len(staffs))
	c.JSON(http.StatusOK, gin.H{
		"status": code,
		"total":  total,
		"data":   convert2VO(c, staffs),
	})
}

// 删除员工信息
// @Summary 删除员工信息
// @Tags staff
// @Accept  json
// @Produce  json
// @Param staff_id path string true "员工ID"
// @Router /api/staff/del/{staff_id} [delete]
func StaffDel(c *gin.Context) {
	staffId := c.Param("staff_id")

	// 获取当前操作用户信息
	operatorId := getCurrentStaffId(c)
	operatorName := getCurrentStaffName(c)

	// 查询要删除的员工信息用于日志记录
	var staff model.Staff
	resource.HrmsDB(c).Where("staff_id = ?", staffId).First(&staff)

	if err := resource.HrmsDB(c).Where("staff_id = ?", staffId).Delete(&model.Staff{}).Error; err != nil {
		log.Printf("[StaffDel] err = %v", err)
		LogOperationFailure(c, operatorId, operatorName, "DELETE", "STAFF",
			"删除员工: "+staff.StaffName, err.Error())
		sendFail(c, 5001, "删除失败"+err.Error())
		return
	}
	// 密码删除
	if err := resource.HrmsDB(c).Where("staff_id = ?", staffId).Delete(&model.Authority{}).Error; err != nil {
		log.Printf("[StaffDel] err = %v", err)
		LogOperationFailure(c, operatorId, operatorName, "DELETE", "STAFF",
			"删除员工权限: "+staff.StaffName, err.Error())
		sendFail(c, 5001, "删除失败"+err.Error())
		return
	}

	LogOperationSuccess(c, operatorId, operatorName, "DELETE", "STAFF",
		"删除员工: "+staff.StaffName)
	sendSuccess(c, nil, "删除成功")
}

// 员工入职
// @Summary 员工入职
// @Tags 员工管理
// @Accept json
// @Produce json
// @Param data body model.StaffOnboardDTO true "员工入职信息"
// @Router /api/staff/onboard [post]
func StaffOnboard(c *gin.Context) {
	var dto model.StaffOnboardDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[StaffOnboard] err = %v", err)
		sendFail(c, 5001, "入职失败"+err.Error())
		return
	}

	// 获取当前操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	err := service.OnboardStaff(c, &dto, fmt.Sprintf("%d", staffId))
	if err != nil {
		log.Printf("[StaffOnboard] err = %v", err)
		sendFail(c, 5002, "入职失败"+err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "CREATE", "STAFF", "员工入职: "+dto.StaffName)
	sendSuccess(c, nil, "入职成功")
}

// 查询员工信息（按员工ID）
// @Summary 查询员工信息
// @Tags 员工管理
// @Accept json
// @Produce json
// @Param staff_id path string true "员工ID"
// @Router /api/staff/query_by_staff_id/{staff_id} [get]
func StaffQueryByStaffId(c *gin.Context) {
	staffId := c.Param("staff_id")
	var staff model.StaffVO
	if err := resource.HrmsDB(c).Model(&model.Staff{}).Where("staff_id = ?", staffId).First(&staff).Error; err != nil {
		sendFail(c, 5001, "查询失败"+err.Error())
		return
	}
	sendSuccess(c, staff, "查询成功")
}

// 员工转正
// @Summary 员工转正
// @Tags 员工管理
// @Accept json
// @Produce json
// @Param data body model.StaffPromotionDTO true "员工转正信息"
// @Router /api/staff/promote [post]
func StaffPromote(c *gin.Context) {
	var dto model.StaffPromotionDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[StaffPromote] err = %v", err)
		sendFail(c, 5001, "转正失败"+err.Error())
		return
	}

	// 获取当前操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	err := service.PromoteStaff(c, &dto, fmt.Sprintf("%d", staffId))
	if err != nil {
		log.Printf("[StaffPromote] err = %v", err)
		sendFail(c, 5002, "转正失败"+err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "STAFF", "员工转正: "+dto.StaffId)
	sendSuccess(c, nil, "转正成功")
}

// 员工调岗
// @Summary 员工调岗
// @Tags 员工管理
// @Accept json
// @Produce json
// @Param data body model.StaffTransferDTO true "员工调岗信息"
// @Router /api/staff/transfer [post]
func StaffTransfer(c *gin.Context) {
	var dto model.StaffTransferDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[StaffTransfer] err = %v", err)
		sendFail(c, 5001, "调岗失败"+err.Error())
		return
	}

	// 获取当前操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	err := service.TransferStaff(c, &dto, fmt.Sprintf("%d", staffId))
	if err != nil {
		log.Printf("[StaffTransfer] err = %v", err)
		sendFail(c, 5002, "调岗失败"+err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "STAFF", "员工调岗: "+dto.StaffId)
	sendSuccess(c, nil, "调岗成功")
}

// 员工离职
// @Summary 员工离职
// @Tags 员工管理
// @Accept json
// @Produce json
// @Param data body model.StaffResignationDTO true "员工离职信息"
// @Router /api/staff/resign [post]
func StaffResign(c *gin.Context) {
	var dto model.StaffResignationDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Printf("[StaffResign] err = %v", err)
		sendFail(c, 5001, "离职失败"+err.Error())
		return
	}

	// 获取当前操作用户信息
	staffId := getCurrentStaffId(c)
	staffName := getCurrentStaffName(c)

	err := service.ResignStaff(c, &dto, fmt.Sprintf("%d", staffId))
	if err != nil {
		log.Printf("[StaffResign] err = %v", err)
		sendFail(c, 5002, "离职失败"+err.Error())
		return
	}

	LogOperationSuccess(c, staffId, staffName, "UPDATE", "STAFF", "员工离职: "+dto.StaffId)
	sendSuccess(c, nil, "离职成功")
}

// 导出员工信息
// @Summary 导出员工信息
// @Tags staff
// @Accept  json
// @Produce  json
// @Router /api/staff/excel_export [post]
func ExcelExport(c *gin.Context) {
	var err error
	defer func() {
		if err != nil {
			log.Printf("[ExcelExport err = %v]", err)
			sendFail(c, 5001, err.Error())
			return
		}
	}()
	file, err := c.FormFile("excel_staffs")
	if err != nil {
		log.Printf("ExcelExport err = %v", err)
		return
	}
	if strings.Split(file.Filename, ".")[1] != "xlsx" {
		log.Printf("ExcelExport 只可上传xlsx格式文件")
		return
	}
	fileOpen, err := file.Open()
	if err != nil {
		log.Printf("ExcelExport err = %v", err)
		return
	}
	defer fileOpen.Close()
	bytes, err := ioutil.ReadAll(fileOpen)
	if err != nil {
		log.Printf("ExcelExport err = %v", err)
		return
	}
	xfile, err := xlsx.OpenBinary(bytes)
	if err != nil {
		log.Printf("ExcelExport err = %v", err)
		return
	}
	var exportStaffList []model.StaffCreateDTO
	for _, sheet := range xfile.Sheets {
		headers := sheet.Rows[0]
		for _, r := range sheet.Rows[1:] {
			staff := model.StaffCreateDTO{}
			for i, v := range r.Cells {
				switch headers.Cells[i].String() {
				case "员工姓名":
					staff.StaffName = v.String()
				case "指定上级":
					staff.LeaderName = v.String()
				case "上级工号":
					staff.LeaderStaffId = v.String()
				case "员工性别":
					staff.SexStr = v.String()
				case "身份证号":
					staff.IdentityNum = v.String()
				case "出生日期":
					staff.BirthdayStr = v.String()
				case "民族":
					staff.Nation = v.String()
				case "毕业院校":
					staff.School = v.String()
				case "毕业专业":
					staff.Major = v.String()
				case "最高学历":
					staff.EduLevel = v.String()
				case "基本薪资":
					if s, err := v.Int64(); err != nil {
						staff.BaseSalary = -1
					} else {
						staff.BaseSalary = s
					}
				case "银行卡号":
					staff.CardNum = v.String()
				case "职位":
					staff.RankId = getRankID(c, v.String())
				case "部门":
					staff.DepId = getDepID(c, v.String())
				case "电子邮箱":
					staff.Email = v.String()
				case "手机号":
					if s, err := v.Int64(); err != nil {
						staff.Phone = -1
					} else {
						staff.Phone = s
					}
				case "入职日期":
					staff.EntryDateStr = v.String()
				}
			}
			exportStaffList = append(exportStaffList, staff)
		}
	}

	var (
		eg         errgroup.Group
		successNum int64
		errNum     int64
	)
	for _, s := range exportStaffList {
		var s = s
		eg.Go(func() error {
			if _, err := buildStaffInfoSaveDB(c, s); err != nil {
				atomic.AddInt64(&errNum, 1)
				return err
			}
			atomic.AddInt64(&successNum, 1)
			return nil
		})
	}
	eg.Wait()
	sendSuccess(c, nil, fmt.Sprintf("完成员工信息导入，成功%v条，失败%v条", successNum, errNum))

}

func getDepID(c *gin.Context, depName string) string {
	var dep model.Department
	if err := resource.HrmsDB(c).Model(&model.Department{}).Where("dep_name = ?", depName).Take(&dep).Error; err != nil {
		return "-1"
	}
	return dep.DepId
}

func getRankID(c *gin.Context, rankName string) string {
	var rank model.Rank
	if err := resource.HrmsDB(c).Model(&model.Rank{}).Where("rank_name = ?", rankName).Take(&rank).Error; err != nil {
		return "-1"
	}
	return rank.RankId
}

// 分页查询员工列表
// @Summary 分页查询员工列表
// @Tags staff
// @Accept  json
// @Produce  json
// @Param page query int false "页码" default(1)
// @Param size query int false "每页大小" default(10)
// @Param search query string false "搜索关键词（姓名）"
// @Router /api/staff/list [get]
func StaffList(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	sizeStr := c.DefaultQuery("size", "10")
	search := c.Query("search")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	size, err := strconv.Atoi(sizeStr)
	if err != nil || size < 1 {
		size = 10
	}

	var vos []StaffListVO
	var total int64

	query := resource.HrmsDB(c).Model(&model.Staff{}).Where("staff_name LIKE ?", "%"+search+"%")
	query.Joins("LEFT JOIN `rank` ON staff.rank_id = `rank`.rank_id").
		Joins("LEFT JOIN `department` ON staff.dep_id = `department`.dep_id").
		Select("staff.*, `rank`.rank_name as rank_name, `department`.dep_name as dep_name")
	query.Count(&total)
	query.Limit(size).Offset((page - 1) * size).Find(&vos)

	sendSuccess(c, gin.H{"data": vos, "total": total}, "查询成功")
}
