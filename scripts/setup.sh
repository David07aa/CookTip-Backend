#!/bin/bash

# CookTip 后端项目初始化脚本

echo "🍳 CookTip 后端项目初始化..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16.x 或更高版本"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"

# 复制环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，填入真实配置信息"
else
    echo "✅ .env 文件已存在"
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 创建上传目录
if [ ! -d "uploads" ]; then
    echo "📁 创建上传目录..."
    mkdir -p uploads
fi

echo ""
echo "✨ 初始化完成！"
echo ""
echo "下一步："
echo "1. 编辑 .env 文件，填入数据库和微信小程序配置"
echo "2. 执行数据库初始化: mysql -u用户名 -p数据库名 < database/init.sql"
echo "3. 启动开发服务: npm run start:dev"
echo "4. 访问 API 文档: http://localhost:3000/api/docs"
echo ""

