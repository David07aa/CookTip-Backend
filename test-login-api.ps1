# 测试微信登录接口
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  微信登录接口测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "https://cooktip-backend.vercel.app/api"

# 测试1: 分类接口（验证基础连接）
Write-Host "[测试 1] 验证 API 基础连接..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/categories" -Method Get
    Write-Host "✅ 分类接口正常 (状态码: 200)" -ForegroundColor Green
    Write-Host "   - 返回 $($response.data.list.Count) 个分类" -ForegroundColor Gray
} catch {
    Write-Host "❌ 分类接口失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 测试2: 微信登录接口（主要测试）
Write-Host "[测试 2] 测试微信登录接口..." -ForegroundColor Yellow

$body = @{
    code = "test_code_12345"
    nickName = "测试用户"
    avatar = "https://example.com/avatar.jpg"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/wechat" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "✅ 接口可访问" -ForegroundColor Green
    Write-Host "   状态: $($response.code)" -ForegroundColor Gray
    Write-Host "   消息: $($response.message)" -ForegroundColor Gray
    
    if ($response.code -eq 200) {
        Write-Host "   ✅ 登录成功（不应该出现，除非测试code有效）" -ForegroundColor Green
    } elseif ($response.code -eq 401) {
        Write-Host "   ✅ 接口正常！返回401是预期的（测试code无效）" -ForegroundColor Green
    } elseif ($response.code -eq 400) {
        Write-Host "   ✅ 接口正常！返回400是预期的（参数验证）" -ForegroundColor Green
    }
    
} catch {
    $errorDetails = $_.ErrorDetails.Message
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 404) {
        Write-Host "❌ 404 错误：接口未找到" -ForegroundColor Red
        Write-Host "   可能原因：CDN未更新，请等待5-10分钟" -ForegroundColor Yellow
    } elseif ($statusCode -eq 401) {
        Write-Host "✅ 接口正常！返回401是预期的" -ForegroundColor Green
        Write-Host "   原因：使用了测试code，真实code应该可以登录" -ForegroundColor Gray
        if ($errorDetails) {
            $errorJson = $errorDetails | ConvertFrom-Json
            Write-Host "   错误详情: $($errorJson.message)" -ForegroundColor Gray
        }
    } elseif ($statusCode -eq 500) {
        Write-Host "⚠️  500 服务器错误" -ForegroundColor Yellow
        Write-Host "   可能原因：" -ForegroundColor Yellow
        Write-Host "   1. 环境变量未配置（WECHAT_APPID, WECHAT_SECRET）" -ForegroundColor Gray
        Write-Host "   2. 数据库连接问题" -ForegroundColor Gray
        if ($errorDetails) {
            Write-Host "   错误详情: $errorDetails" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ 请求失败: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   状态码: $statusCode" -ForegroundColor Gray
        if ($errorDetails) {
            Write-Host "   响应: $errorDetails" -ForegroundColor Gray
        }
    }
}

Write-Host ""

# 测试3: OPTIONS 请求（CORS预检）
Write-Host "[测试 3] 测试 CORS 预检请求..." -ForegroundColor Yellow
try {
    $headers = @{
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
        "Origin" = "http://localhost"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/wechat" -Method Options -Headers $headers -UseBasicParsing
    
    $corsHeaders = $response.Headers.'Access-Control-Allow-Origin'
    
    if ($corsHeaders -contains '*' -or $corsHeaders) {
        Write-Host "✅ CORS 配置正常" -ForegroundColor Green
        Write-Host "   - Allow-Origin: $corsHeaders" -ForegroundColor Gray
        Write-Host "   - Allow-Methods: $($response.Headers.'Access-Control-Allow-Methods')" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  未检测到 CORS 头部" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  CORS 预检失败: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 总结
Write-Host "📋 测试总结:" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果看到以下任一结果，说明接口正常：" -ForegroundColor White
Write-Host "  ✅ 返回 401（测试code无效，这是正常的）" -ForegroundColor Gray
Write-Host "  ✅ 返回 400（参数验证，这是正常的）" -ForegroundColor Gray
Write-Host "  ✅ 返回 200（登录成功，极少出现）" -ForegroundColor Gray
Write-Host ""
Write-Host "如果看到以下结果，需要处理：" -ForegroundColor White
Write-Host "  ❌ 返回 404：等待CDN更新（5-10分钟）" -ForegroundColor Gray
Write-Host "  ⚠️  返回 500：检查环境变量配置" -ForegroundColor Gray
Write-Host ""

