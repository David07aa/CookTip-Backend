#!/bin/bash

# CookTip 后端项目部署脚本

echo "🚀 开始部署 CookTip 后端..."

# 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"

# 构建 Docker 镜像
echo "🐳 构建 Docker 镜像..."
docker build -t cooktip-backend:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker 镜像构建失败"
    exit 1
fi

echo "✅ Docker 镜像构建成功"

# 停止并删除旧容器
echo "🔄 停止旧容器..."
docker stop cooktip-api 2>/dev/null || true
docker rm cooktip-api 2>/dev/null || true

# 启动新容器
echo "▶️  启动新容器..."
docker run -d \
  --name cooktip-api \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  --restart unless-stopped \
  cooktip-backend:latest

if [ $? -ne 0 ]; then
    echo "❌ 容器启动失败"
    exit 1
fi

echo "✅ 容器启动成功"

# 查看容器状态
echo ""
echo "📊 容器状态:"
docker ps | grep cooktip-api

echo ""
echo "✨ 部署完成！"
echo "🌐 API 地址: http://localhost:3000"
echo "📚 API 文档: http://localhost:3000/api/docs"
echo ""
echo "查看日志: docker logs -f cooktip-api"
echo ""

