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
		rankGroup := r.Group("/rank")
		{
			rankGroup.POST("/create", RankCreate)
			rankGroup.DELETE("/del/:rank_id", RankDel)
			rankGroup.POST("/edit", RankEdit)
			rankGroup.GET("/query/:rank_id", RankQuery)
		}
	})
}

// RankCreate godoc
// @Summary 创建职级
// @Tags Rank
// @Accept json
// @Produce json
// @Param rankCreateDTO body model.RankCreateDTO true "创建职级"
// @Router /api/rank/create [post]
func RankCreate(c *gin.Context) {
	var rankCreateDto model.RankCreateDTO
	if err := c.BindJSON(&rankCreateDto); err != nil {
		log.Printf("[RankCreate] err = %v", err)
		sendFail(c, 5001, err.Error())
		return
	}
	var exist int64
	resource.HrmsDB(c).Model(&model.Rank{}).Where("rank_name = ?", rankCreateDto.RankName).Count(&exist)
	if exist != 0 {
		sendFail(c, 2001, "职级名称已存在")
		return
	}
	rank := model.Rank{
		RankId:   service.RandomID("rank"),
		RankName: rankCreateDto.RankName,
	}
	resource.HrmsDB(c).Create(&rank)

	sendSuccess(c, rank, "新增职级成功")
}

// RankEdit godoc
// @Summary 编辑职级
// @Tags Rank
// @Accept json
// @Produce json
// @Param rankEditDTO body model.RankEditDTO true "编辑职级"
// @Router /api/rank/edit [post]
func RankEdit(c *gin.Context) {
	var rankEditDTO model.RankEditDTO
	if err := c.BindJSON(&rankEditDTO); err != nil {
		log.Printf("[RankEdit] err = %v", err)
		sendFail(c, 5001, "编辑职级失败")
		return
	}
	resource.HrmsDB(c).Model(&model.Rank{}).Where("rank_id = ?", rankEditDTO.RankId).
		Updates(&model.Rank{RankName: rankEditDTO.RankName})
	sendSuccess(c, nil, "编辑职级成功")
}

// RankQuery godoc
// @Summary 查询职级
// @Tags Rank
// @Accept json
// @Produce json
// @Param rank_id path string true "职级id"
// @Router /api/rank/{rank_id}/query [get]
func RankQuery(c *gin.Context) {
	var total int64 = 1
	// 分页
	start, limit := service.AcceptPage(c)
	rankId := c.Param("rank_id")
	var ranks []model.Rank
	if rankId == "all" {
		// 查询全部
		if start == -1 && start == -1 {
			resource.HrmsDB(c).Find(&ranks)
		} else {
			resource.HrmsDB(c).Offset(start).Limit(limit).Find(&ranks)
		}
		if len(ranks) == 0 {
			// 不存在
			sendFail(c, 2001, "不存在")
			return
		}
		// 总记录数
		resource.HrmsDB(c).Model(&model.Rank{}).Count(&total)
		sendTotalSuccess(c, ranks, total, "")
		return
	}
	resource.HrmsDB(c).Where("rank_id = ?", rankId).Find(&ranks)
	if len(ranks) == 0 {
		// 不存在
		sendFail(c, 2001, "不存在")
		return
	}
	total = int64(len(ranks))

	sendTotalSuccess(c, ranks, total, "")
}

// RankDel godoc
// @Summary 删除职级
// @Tags Rank
// @Accept json
// @Produce json
// @Param rank_id path string true "职级id"
// @Router /api/rank/{rank_id}/del [delete]
func RankDel(c *gin.Context) {
	rankId := c.Param("rank_id")
	if err := resource.HrmsDB(c).Where("rank_id = ?", rankId).Delete(&model.Rank{}).Error; err != nil {
		log.Printf("[RankDel] err = %v", err)
		sendFail(c, 5001, err.Error())
		return
	}
	sendSuccess(c, nil, "删除成功")
}
