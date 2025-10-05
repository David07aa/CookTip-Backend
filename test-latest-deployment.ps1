# 测试最新部署地址
$LATEST_DEPLOYMENT = "https://cooktip-backend-pp5qqbv2m-davids-projects-688aeefc.vercel.app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试最新部署地址" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "最新部署: $LATEST_DEPLOYMENT" -ForegroundColor Yellow
Write-Host ""

# 测试关键接口
Write-Host "【1】测试微信登录接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$LATEST_DEPLOYMENT/api/auth/wechat" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"code":"test"}' `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "✅ 状态码: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应: $($response.Content)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -in @(400, 401, 429)) {
        Write-Host "✅ 状态码: $statusCode (接口存在)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "❌ 状态码: 404 (接口不存在)" -ForegroundColor Red
    } else {
        Write-Host "❌ 错误: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "【2】测试菜谱列表接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$LATEST_DEPLOYMENT/api/recipes" `
        -Method GET `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "✅ 状态码: $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "返回数据数量: $($content.data.recipes.Count)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode) {
        Write-Host "❌ 状态码: $statusCode" -ForegroundColor Red
    } else {
        Write-Host "❌ 错误: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "【3】测试用户信息接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$LATEST_DEPLOYMENT/api/user/info" `
        -Method GET `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "✅ 状态码: $($response.StatusCode)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -in @(400, 401, 429)) {
        Write-Host "✅ 状态码: $statusCode (接口存在，需要认证)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "❌ 状态码: 404 (接口不存在)" -ForegroundColor Red
    } else {
        Write-Host "❌ 错误: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

