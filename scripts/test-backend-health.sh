#!/bin/bash

echo "=================================="
echo "测试后端服务健康状态"
echo "=================================="

BACKEND_URL="https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com"

echo ""
echo "1. 测试健康检查接口..."
curl -s "$BACKEND_URL/health" | jq '.' || curl -s "$BACKEND_URL/health"

echo ""
echo ""
echo "2. 测试登录接口（使用测试数据）..."
curl -s -X POST "$BACKEND_URL/api/v1/auth/wx-login" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test123456789",
    "nickName": "测试用户",
    "avatarUrl": "https://test.com/avatar.jpg"
  }' | jq '.' || curl -s -X POST "$BACKEND_URL/api/v1/auth/wx-login" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test123456789",
    "nickName": "测试用户",
    "avatarUrl": "https://test.com/avatar.jpg"
  }'

echo ""
echo ""
echo "=================================="
echo "✅ 测试完成"
echo "=================================="
echo ""
echo "如果登录接口返回："
echo "  - 401: 环境变量未加载或服务未重启"
echo "  - 40029: 配置正确，但code无效（正常）"
echo "  - 200: 登录成功（不太可能，因为code是测试的）"

