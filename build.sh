#!/bin/bash

# HRMS React前端构建脚本

echo "开始构建HRMS React前端..."

# 检查Node.js和npm是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js未安装，请先安装Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "错误: npm未安装，请先安装npm"
    exit 1
fi

# 进入前端目录
cd frontend

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "错误: package.json文件不存在"
    exit 1
fi

# 安装依赖
echo "安装依赖包..."
npm install

if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败"
    exit 1
fi

# 构建生产版本
echo "构建生产版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "错误: 构建失败"
    exit 1
fi

# 返回根目录
cd ..

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！"
    echo "构建文件已生成到 dist/ 目录"
    echo "现在可以启动Go服务器: go run main.go"
else
    echo "❌ 构建失败：dist目录未生成"
    exit 1
fi

echo "构建完成！"