#!/bin/bash

# 云函数快速部署脚本
# 用于部署修复后的 api-proxy 云函数

echo "================================"
echo "  CookTip 云函数部署工具"
echo "================================"
echo ""

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查云函数目录
if [ ! -d "cloudfunctions/api-proxy" ]; then
    echo "❌ 错误: 找不到云函数目录 cloudfunctions/api-proxy"
    exit 1
fi

echo "📦 准备部署 api-proxy 云函数..."
echo ""

# 显示修改内容
echo "📝 本次修改内容:"
echo "  - 自动添加 /api/v1 API 前缀"
echo "  - 修复前端 404 错误问题"
echo ""

# 检查是否安装了 tcb CLI
if command -v tcb &> /dev/null; then
    echo "✅ 检测到 Tencent Cloud Base CLI"
    echo ""
    
    read -p "是否使用 tcb CLI 部署? (y/n): " use_tcb
    
    if [ "$use_tcb" = "y" ] || [ "$use_tcb" = "Y" ]; then
        echo ""
        echo "🚀 开始部署..."
        cd cloudfunctions/api-proxy
        tcb fn deploy api-proxy --force
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ 部署成功！"
        else
            echo ""
            echo "❌ 部署失败，请检查错误信息"
            exit 1
        fi
        
        cd ../..
    fi
else
    echo "⚠️  未检测到 tcb CLI"
    echo ""
    echo "请使用以下方式之一部署:"
    echo ""
    echo "方式 1: 微信开发者工具（推荐）"
    echo "  1. 打开微信开发者工具"
    echo "  2. 找到 cloudfunctions/api-proxy 文件夹"
    echo "  3. 右键 → 上传并部署：云端安装依赖"
    echo ""
    echo "方式 2: 安装 tcb CLI 后重新运行"
    echo "  npm install -g @cloudbase/cli"
    echo "  tcb login"
    echo "  bash scripts/deploy-api-proxy.sh"
    echo ""
    exit 0
fi

echo ""
echo "================================"
echo "  部署完成"
echo "================================"
echo ""
echo "📋 后续步骤:"
echo "  1. 等待 1-2 分钟让云函数生效"
echo "  2. 在微信开发者工具中测试登录功能"
echo "  3. 查看云函数日志确认路径包含 /api/v1"
echo ""
echo "🧪 测试命令（在小程序控制台执行）:"
echo ""
echo "wx.cloud.callFunction({"
echo "  name: 'api-proxy',"
echo "  data: {"
echo "    method: 'GET',"
echo "    path: '/health'"
echo "  }"
echo "}).then(console.log)"
echo ""
echo "📚 详细文档: 修复404错误-部署指南.md"
echo ""

