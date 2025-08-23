package model

import (
	"gorm.io/gorm"
)

type DepartmentCreateDTO struct {
	DepDescribe  string `json:"dep_describe" binding:"required"`
	DepName      string `json:"dep_name" binding:"required"`
	ParentDepId  string `json:"parent_dep_id" default:"0"`
}

type DepartmentEditDTO struct {
	DepId        string `json:"dep_id" binding:"required"`
	DepDescribe  string `json:"dep_describe" binding:"required"`
	DepName      string `json:"dep_name" binding:"required"`
	ParentDepId  string `json:"parent_dep_id" default:"0"`
}

type Department struct {
	gorm.Model
	DepId        string `gorm:"column:dep_id" db:"column:dep_id" json:"dep_id"`
	DepDescribe  string `gorm:"column:dep_describe" json:"dep_describe"`
	DepName      string `gorm:"column:dep_name" db:"column:dep_name" json:"dep_name"`
	ParentDepId  string `gorm:"column:parent_dep_id;default:'0'" json:"parent_dep_id"`
	ParentName   string `gorm:"-" json:"parent_name"`
	Children     []Department `gorm:"-" json:"children,omitempty"`
	Level        int    `gorm:"-" json:"level"`
}

func (d *Department) AfterFind(tx *gorm.DB) (err error) {
	// 查询父部门名称，只有当parent_dep_id不为'0'时才查询
	if d.ParentDepId != "" && d.ParentDepId != "0" {
		var parent Department
		if err := tx.Where("dep_id = ?", d.ParentDepId).First(&parent).Error; err == nil {
			d.ParentName = parent.DepName
		} else {
			// 如果找不到父部门，设置为空
			d.ParentName = ""
		}
	} else {
		// 顶级部门
		d.ParentName = ""
	}
	return nil
}

// DepartmentTreeNode 部门树节点结构
type DepartmentTreeNode struct {
	DepId       string              `json:"DepId"`
	DepName     string              `json:"DepName"`
	DepDescribe string              `json:"DepDescribe"`
	ParentDepId string              `json:"ParentDepId"`
	Level       int                 `json:"Level"`
	Children    []DepartmentTreeNode `json:"Children,omitempty"`
	CreatedAt   string              `json:"CreatedAt"`
	UpdatedAt   string              `json:"UpdatedAt"`
}

// BuildDepartmentTree 构建部门树
func BuildDepartmentTree(departments []Department) []DepartmentTreeNode {
	// 创建部门映射
	departmentMap := make(map[string]Department)
	for _, dept := range departments {
		departmentMap[dept.DepId] = dept
	}

	// 找到所有顶级部门（parent_dep_id 为 "0" 的部门）
	var rootDepartments []Department
	for _, dept := range departments {
		if dept.ParentDepId == "0" {
			rootDepartments = append(rootDepartments, dept)
		}
	}

	// 为每个顶级部门构建树
	var result []DepartmentTreeNode
	for _, rootDept := range rootDepartments {
		treeNode := buildTreeNode(rootDept, departmentMap, 0)
		result = append(result, treeNode)
	}

	return result
}

// buildTreeNode 递归构建树节点
func buildTreeNode(dept Department, departmentMap map[string]Department, level int) DepartmentTreeNode {
	node := DepartmentTreeNode{
		DepId:       dept.DepId,
		DepName:     dept.DepName,
		DepDescribe: dept.DepDescribe,
		ParentDepId: dept.ParentDepId,
		Level:       level,
		Children:    make([]DepartmentTreeNode, 0),
		CreatedAt:   dept.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:   dept.UpdatedAt.Format("2006-01-02 15:04:05"),
	}

	// 找到所有子部门
	for _, childDept := range departmentMap {
		if childDept.ParentDepId == dept.DepId {
			childNode := buildTreeNode(childDept, departmentMap, level+1)
			node.Children = append(node.Children, childNode)
		}
	}

	return node
}
