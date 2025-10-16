# 测试云托管环境变量和后端健康状态

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔍 测试云托管后端环境变量" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$CloudUrl = "https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com"

# 测试1: 健康检查
Write-Host "📡 测试1: 健康检查" -ForegroundColor Yellow
Write-Host "URL: $CloudUrl/health"
try {
    $health = Invoke-RestMethod -Uri "$CloudUrl/health" -Method Get
    Write-Host "响应:" ($health | ConvertTo-Json -Depth 10) -ForegroundColor Green
} catch {
    Write-Host "❌ 健康检查失败: $_" -ForegroundColor Red
}
Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 测试2: 模拟微信登录
Write-Host "📡 测试2: 模拟微信登录（测试环境变量）" -ForegroundColor Yellow
Write-Host "URL: $CloudUrl/api/v1/auth/wx-login"
Write-Host ""
Write-Host "发送测试code: test_code_123"
Write-Host ""

$body = @{
    code = "test_code_123"
    nickname = "测试用户"
    avatar = "https://test.com/avatar.jpg"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$CloudUrl/api/v1/auth/wx-login" -Method Post -ContentType "application/json" -Body $body
    Write-Host "📥 后端响应:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    
    Write-Host "📥 后端响应 (HTTP $statusCode):" -ForegroundColor Yellow
    Write-Host ($errorBody | ConvertTo-Json -Depth 10) -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "🔍 分析结果:" -ForegroundColor Cyan
    Write-Host ""
    
    if ($errorBody.message -like "*微信配置错误*") {
        Write-Host "❌ 检测到: 环境变量未配置" -ForegroundColor Red
        Write-Host "   解决方案: 在云托管控制台配置 WX_APPID 和 WX_SECRET" -ForegroundColor Yellow
    }
    elseif ($errorBody.message -like "*invalid appid*") {
        Write-Host "❌ 检测到: AppID 错误" -ForegroundColor Red
        Write-Host "   解决方案: 检查 WX_APPID 是否正确" -ForegroundColor Yellow
    }
    elseif ($errorBody.message -like "*invalid secret*") {
        Write-Host "❌ 检测到: Secret 错误" -ForegroundColor Red
        Write-Host "   解决方案: 检查 WX_SECRET 是否正确" -ForegroundColor Yellow
    }
    elseif ($errorBody.message -like "*code been used*" -or $errorBody.message -like "*invalid code*") {
        Write-Host "✅ 环境变量配置正确！（code 错误是正常的，这是测试code）" -ForegroundColor Green
        Write-Host "   真实微信登录应该能成功！" -ForegroundColor Green
    }
    elseif ($statusCode -eq 401) {
        Write-Host "⚠️  返回401错误，原因: $($errorBody.message)" -ForegroundColor Yellow
        Write-Host "   请查看云托管后端日志获取详细信息" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📋 下一步操作:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 如果显示 '微信配置错误'："
Write-Host "   → 登录腾讯云控制台"
Write-Host "   → 云托管 → 环境变量"
Write-Host "   → 添加 WX_APPID 和 WX_SECRET"
Write-Host "   → 重启服务"
Write-Host ""
Write-Host "2. 如果显示 'invalid code' 或 'code been used'："
Write-Host "   → 环境变量配置正确！"
Write-Host "   → 前端使用真实微信code即可登录成功"
Write-Host ""
Write-Host "3. 查看详细日志："
Write-Host "   → 腾讯云控制台 → 云托管 → 日志"
Write-Host "   → 搜索关键字: 'code2Session' 或 '微信登录'"
Write-Host ""

