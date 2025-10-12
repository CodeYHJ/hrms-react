# ===== 前端构建阶段 =====
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ===== Go 构建阶段 =====
FROM golang:1.23-alpine AS go-builder
WORKDIR /app

# 先拷贝依赖定义文件（加速缓存）
COPY go.mod go.sum ./
RUN go mod tidy

# 拷贝 Go 源码（包括config）
COPY . .

# 拷贝前端构建结果到 Go 工程的某个目录（假设后端会读取 ./dist 提供静态文件）
COPY --from=frontend-builder ./dist ./dist

RUN go build -o server .

# ===== 最终运行阶段 =====
FROM golang:1.23-alpine
ENV HRMS_ENV=prod
WORKDIR /app
COPY --from=go-builder /app/server .
COPY --from=go-builder /app/dist ./dist
COPY --from=go-builder /app/config ./config
COPY --from=go-builder /app/sql ./sql

EXPOSE 8080
CMD ["./server"]
