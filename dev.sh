#!/bin/bash

# HRMS 开发环境启动脚本

echo "启动HRMS开发环境..."

# 检查Go是否安装
if ! command -v go &> /dev/null; then
    echo "错误: Go未安装，请先安装Go"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js未安装，请先安装Node.js"
    exit 1
fi

# 启动Go后端服务器
echo "启动Go后端服务器..."
go run main.go &
GO_PID=$!

# 等待后端启动
sleep 3

# 进入前端目录并启动开发服务器
echo "启动React前端开发服务器..."
cd frontend

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

# 启动前端开发服务器
npm run dev &
REACT_PID=$!

echo "✅ 开发环境启动成功！"
echo "Go后端服务器: http://localhost:8888"
echo "React前端开发服务器: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '正在停止服务...'; kill $GO_PID $REACT_PID; exit" INT
wait