# hrms

基于 go、gorm、gin、mysql 及 React 构建的人力资源管理系统。提供员工管理、考试管理、通知管理、薪资考勤管理、招聘管理、权限管理及分公司分库数据隔离等功能。欢迎 Star 或提 Issue。

## Install

### 开发

#### 前端准备

1. cd frontend && npm install && npm run dev

#### 后端准备

1. go mod tidy
2. 运行 docker-compose.yml
3. go run main.go
4. 访问 http://localhost:8888/app
5. 默认用户名密码：root/root1
6. 默认管理员用户名密码：admin/admin1
