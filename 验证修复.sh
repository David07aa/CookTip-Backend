#!/bin/bash

# 云托管 API 修复验证脚本

BASE_URL="https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com"

echo "🚀 开始验证云托管 API 修复..."
echo "=========================================="

# 测试 1: 推荐排序（之前 500 错误）
echo ""
echo "1️⃣ 测试推荐排序接口:"
echo "GET ${BASE_URL}/api/v1/recipes?page=1&limit=10&sort=recommended"
curl -s -o /dev/null -w "状态码: %{http_code}\n" "${BASE_URL}/api/v1/recipes?page=1&limit=10&sort=recommended"

# 测试 2: 评论接口（之前 404 错误）
echo ""
echo "2️⃣ 测试评论接口:"
echo "GET ${BASE_URL}/api/v1/comments?recipeId=4&page=1&limit=10"
curl -s -o /dev/null -w "状态码: %{http_code}\n" "${BASE_URL}/api/v1/comments?recipeId=4&page=1&limit=10"

# 测试 3: 其他排序方式
echo ""
echo "3️⃣ 测试其他排序:"
echo "  - latest 排序:"
curl -s -o /dev/null -w "    状态码: %{http_code}\n" "${BASE_URL}/api/v1/recipes?page=1&limit=10&sort=latest"
echo "  - hot 排序:"
curl -s -o /dev/null -w "    状态码: %{http_code}\n" "${BASE_URL}/api/v1/recipes?page=1&limit=10&sort=hot"
echo "  - popular 排序:"
curl -s -o /dev/null -w "    状态码: %{http_code}\n" "${BASE_URL}/api/v1/recipes?page=1&limit=10&sort=popular"

# 测试 4: 分类接口
echo ""
echo "4️⃣ 测试分类接口:"
curl -s -o /dev/null -w "状态码: %{http_code}\n" "${BASE_URL}/api/v1/categories"

# 测试 5: 食谱详情
echo ""
echo "5️⃣ 测试食谱详情:"
curl -s -o /dev/null -w "状态码: %{http_code}\n" "${BASE_URL}/api/v1/recipes/4"

echo ""
echo "=========================================="
echo "✅ 验证完成！"
echo ""
echo "📝 说明:"
echo "  - 200 = 成功 ✅"
echo "  - 404 = 未找到 ❌"
echo "  - 500 = 服务器错误 ❌"
echo ""
echo "如果所有状态码都是 200，说明修复成功！🎉"

