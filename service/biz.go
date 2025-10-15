package service

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	httpReq "github.com/kirinlabs/HttpRequest"
	"hrms/model"
	"hrms/resource"
	"log"
	"math/rand"
	"strconv"
	"time"
)

func AcceptPage(c *gin.Context) (int, int) {
	pageStr := c.Query("page")
	if pageStr == "" {
		log.Printf("未传入分页参数page，查询全部")
		return -1, -1
	}
	page, _ := strconv.Atoi(pageStr)
	limitStr := c.Query("limit")
	if limitStr == "" {
		log.Printf("未传入分页参数limit，查询全部")
		return -1, -1
	}
	limit, _ := strconv.Atoi(limitStr)
	startIndex := (page - 1) * limit
	return startIndex, limit
}

func RandomID(pre string) string {
	rand.Seed(time.Now().Unix())
	return fmt.Sprintf("%v_%v", pre, rand.Uint32())
}

func RandomStaffId() string {
	rand.Seed(time.Now().UnixNano())
	randStaffStr := fmt.Sprintf("H%v", rand.Uint32())
	return randStaffStr[0:6]
}

func Str2Time(timeStr string, typ int) time.Time {
	var curTime time.Time
	var err error
	if typ == 0 {
		curTime, err = time.Parse("2006-01-02", timeStr)
		if err != nil {
			fmt.Printf("err = %v", err)
		}
	}
	if typ == 1 {
		curTime, err = time.Parse("2006-01-02 15:04:05", timeStr)
		if err != nil {
			fmt.Printf("err = %v", err)
		}
	}
	return curTime
}

func Time2Str(curTime time.Time, typ int) string {
	var timeStr string
	if typ == 0 {
		timeStr = curTime.Format("2006-01-02")
	}
	if typ == 1 {
		timeStr = curTime.Format("2006-01-02 15:04:05")
	}
	return timeStr
}

func SexStr2Int64(sexStr string) int64 {
	var sex int64
	if sexStr == "1" || sexStr == "男" {
		sex = 1
	}
	if sexStr == "2" || sexStr == "女" {
		sex = 2
	}
	return sex
}

func SexInt2Str(sex int64) string {
	var sexStr = "Null"
	if sex == 1 {
		sexStr = "男"
	}
	if sex == 2 {
		sexStr = "女"
	}
	return sexStr
}

func GetDepNameByDepId(c *gin.Context, depId string) string {
	var dep model.Department
	resource.HrmsDB(c).Where("dep_id = ?", depId).Find(&dep)
	return dep.DepName
}

func GetRankNameRankDepId(c *gin.Context, rankId string) string {
	var rank model.Rank
	resource.HrmsDB(c).Where("rank_id = ?", rankId).Find(&rank)
	return rank.RankName
}

func Transfer(from, to interface{}) error {
	bytes, err := json.Marshal(&from)
	if err != nil {
		log.Println("Transfer json err = %v", err)
		return err
	}
	err = json.Unmarshal(bytes, &to)
	if err != nil {
		log.Println("Transfer json err = %v", err)
		return err
	}
	return nil
}

const SMS_URL = "https://api.apishop.net/communication/sms/send"

// 向指定手机号发放短信通知
func sendNoticeMsg(msgType string, phone int64, content []string) {
	if phone == 0 || phone != 15521306934 {
		// 给自己手机号发短信验证效果
		return
	}
	var templateID string
	switch msgType {
	case "notice":
		templateID = "10713"
	case "salary":
		templateID = "10714"
	}
	var resp *httpReq.Response
	reqJSON := map[string]interface{}{
		"apiKey":     "IBIMUBn846955ab1be1d10738e67fdb7214c5fef9a626c6",
		"phoneNum":   phone,
		"templateID": templateID,
		"params":     content,
	}
	datas, _ := json.Marshal(&reqJSON)
	var err error
	log.Printf("[sendNoticeMsg] req data = %v", string(datas))
	resp, err = httpReq.Post(SMS_URL, reqJSON)
	if err != nil {
		log.Printf("[sendNoticeMsg] err = %v", err)
	}
	body, _ := resp.Body()
	log.Printf("[sendNoticeMsg] resp = %v", string(body))
}

func MD5(input string) string {
	data := []byte(input)
	md5Ctx := md5.New()
	md5Ctx.Write(data)
	cipherStr := md5Ctx.Sum(nil)
	return hex.EncodeToString(cipherStr)
}

// 员工入职
func OnboardStaff(c *gin.Context, dto *model.StaffOnboardDTO, operatorId string) error {
	var staffRecord model.Staff
	Transfer(&dto, &staffRecord)
	staffRecord.Status = 0 // 试用期
	staffRecord.StaffId = RandomID("H")
	
	if err := resource.HrmsDB(c).Create(&staffRecord).Error; err != nil {
		log.Printf("OnboardStaff err = %v", err)
		return err
	}

	// 创建默认普通员工权限
	authorityRecord := model.Authority{
		AuthorityId: RandomID("A"),
		StaffId:     staffRecord.StaffId,
		UserType:    "normal",
	}
	if err := resource.HrmsDB(c).Create(&authorityRecord).Error; err != nil {
		log.Printf("OnboardStaff create authority err = %v", err)
		return err
	}

	// 记录生命周期日志
	logRecord := model.StaffLifecycleLog{
		StaffId:    staffRecord.StaffId,
		ActionType: "onboard",
		ActionDate: time.Now(),
		OldValue:   "{}",
		NewValue:   fmt.Sprintf(`{"staff_id":"%s","status":0}`, staffRecord.StaffId),
		Operator:   operatorId,
		Remark:     "员工入职",
	}
	
	if err := resource.HrmsDB(c).Create(&logRecord).Error; err != nil {
		log.Printf("OnboardStaff log err = %v", err)
		// 注意：这里不返回错误，因为主要业务已成功
	}
	
	return nil
}

// 员工转正
func PromoteStaff(c *gin.Context, dto *model.StaffPromotionDTO, operatorId string) error {
	if err := resource.HrmsDB(c).Model(&model.Staff{}).Where("staff_id = ?", dto.StaffId).
		Updates(map[string]interface{}{
			"status": 1,
			"probation_end_date": dto.ProbationEndDate,
		}).Error; err != nil {
		log.Printf("PromoteStaff err = %v", err)
		return err
	}
	
	// 记录生命周期日志
	logRecord := model.StaffLifecycleLog{
		StaffId:    dto.StaffId,
		ActionType: "promote",
		ActionDate: time.Now(),
		OldValue:   fmt.Sprintf(`{"status":0}`),
		NewValue:   fmt.Sprintf(`{"status":1,"probation_end_date":"%s"}`, dto.ProbationEndDate),
		Operator:   operatorId,
		Remark:     "员工转正",
	}
	
	if err := resource.HrmsDB(c).Create(&logRecord).Error; err != nil {
		log.Printf("PromoteStaff log err = %v", err)
		// 注意：这里不返回错误，因为主要业务已成功
	}
	
	return nil
}

// 员工调岗
func TransferStaff(c *gin.Context, dto *model.StaffTransferDTO, operatorId string) error {
	if err := resource.HrmsDB(c).Model(&model.Staff{}).Where("staff_id = ?", dto.StaffId).
		Updates(map[string]interface{}{
			"dep_id": dto.DepId,
			"rank_id": dto.RankId,
		}).Error; err != nil {
		log.Printf("TransferStaff err = %v", err)
		return err
	}
	
	// 记录生命周期日志
	logRecord := model.StaffLifecycleLog{
		StaffId:    dto.StaffId,
		ActionType: "transfer",
		ActionDate: time.Now(),
		OldValue:   fmt.Sprintf(`{"dep_id":"%s","rank_id":"%s"}`, "", ""),
		NewValue:   fmt.Sprintf(`{"dep_id":"%s","rank_id":"%s"}`, dto.DepId, dto.RankId),
		Operator:   operatorId,
		Remark:     "员工调岗",
	}
	
	if err := resource.HrmsDB(c).Create(&logRecord).Error; err != nil {
		log.Printf("TransferStaff log err = %v", err)
		// 注意：这里不返回错误，因为主要业务已成功
	}
	
	return nil
}

// 员工离职
func ResignStaff(c *gin.Context, dto *model.StaffResignationDTO, operatorId string) error {
	if err := resource.HrmsDB(c).Model(&model.Staff{}).Where("staff_id = ?", dto.StaffId).
		Updates(map[string]interface{}{
			"status": 2,
			"resignation_date": dto.ResignationDate,
			"resignation_reason": dto.ResignationReason,
		}).Error; err != nil {
		log.Printf("ResignStaff err = %v", err)
		return err
	}
	
	// 记录生命周期日志
	logRecord := model.StaffLifecycleLog{
		StaffId:    dto.StaffId,
		ActionType: "resign",
		ActionDate: time.Now(),
		OldValue:   fmt.Sprintf(`{"status":0}`),
		NewValue:   fmt.Sprintf(`{"status":2,"resignation_date":"%s","resignation_reason":"%s"}`, dto.ResignationDate, dto.ResignationReason),
		Operator:   operatorId,
		Remark:     "员工离职",
	}
	
	if err := resource.HrmsDB(c).Create(&logRecord).Error; err != nil {
		log.Printf("ResignStaff log err = %v", err)
		// 注意：这里不返回错误，因为主要业务已成功
	}
	
	return nil
}
