#!/bin/bash

# 测试云托管环境变量和后端健康状态

echo "========================================="
echo "🔍 测试云托管后端环境变量"
echo "========================================="
echo ""

# 云托管公网地址
CLOUD_URL="https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com"

echo "📡 测试1: 健康检查"
echo "URL: $CLOUD_URL/health"
curl -s "$CLOUD_URL/health" | jq .
echo ""
echo "----------------------------------------"
echo ""

echo "📡 测试2: 模拟微信登录（测试环境变量）"
echo "URL: $CLOUD_URL/api/v1/auth/wx-login"
echo ""
echo "发送测试code: test_code_123"
echo ""

RESPONSE=$(curl -s -X POST "$CLOUD_URL/api/v1/auth/wx-login" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test_code_123",
    "nickname": "测试用户",
    "avatar": "https://test.com/avatar.jpg"
  }')

echo "📥 后端响应:"
echo "$RESPONSE" | jq .
echo ""
echo "----------------------------------------"
echo ""

echo "🔍 分析结果:"
echo ""

# 检查是否包含特定错误
if echo "$RESPONSE" | grep -q "微信配置错误"; then
  echo "❌ 检测到: 环境变量未配置"
  echo "   解决方案: 在云托管控制台配置 WX_APPID 和 WX_SECRET"
  echo ""
elif echo "$RESPONSE" | grep -q "invalid appid"; then
  echo "❌ 检测到: AppID 错误"
  echo "   解决方案: 检查 WX_APPID 是否正确"
  echo ""
elif echo "$RESPONSE" | grep -q "invalid secret"; then
  echo "❌ 检测到: Secret 错误"
  echo "   解决方案: 检查 WX_SECRET 是否正确"
  echo ""
elif echo "$RESPONSE" | grep -q "code been used\|invalid code"; then
  echo "✅ 环境变量配置正确（code 错误是正常的，这是测试code）"
  echo "   真实登录应该能成功！"
  echo ""
elif echo "$RESPONSE" | grep -q "Unauthorized"; then
  echo "⚠️  返回401错误，但原因未知"
  echo "   请查看云托管后端日志获取详细信息"
  echo ""
else
  echo "✅ 测试完成，请查看上面的响应信息"
  echo ""
fi

echo "========================================="
echo "📋 下一步操作:"
echo "========================================="
echo ""
echo "1. 如果显示 '微信配置错误'："
echo "   → 登录腾讯云控制台"
echo "   → 云托管 → 环境变量"
echo "   → 添加 WX_APPID 和 WX_SECRET"
echo "   → 重启服务"
echo ""
echo "2. 如果显示 'invalid code' 或 'code been used'："
echo "   → 环境变量配置正确！"
echo "   → 前端使用真实微信code即可登录成功"
echo ""
echo "3. 查看详细日志："
echo "   → 腾讯云控制台 → 云托管 → 日志"
echo "   → 搜索关键字: 'code2Session' 或 '微信登录'"
echo ""

