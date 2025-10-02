# 测试微信登录接口是否可访问
$url = "https://cooktip-backend.vercel.app/api/auth/wechat"

Write-Host "`n=== 测试微信登录接口 ===" -ForegroundColor Cyan
Write-Host "URL: $url`n" -ForegroundColor Yellow

try {
    $body = @{
        code = "test-code-12345"
        nickName = "测试用户"
        avatar = "https://example.com/avatar.jpg"
    } | ConvertTo-Json

    Write-Host "发送请求..." -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri $url -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "`n✅ 接口可访问！状态码: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "`n响应内容:" -ForegroundColor White
    Write-Host $response.Content
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    Write-Host "`n状态码: $statusCode" -ForegroundColor $(
        if ($statusCode -eq 404) { "Red" }
        elseif ($statusCode -eq 401) { "Green" }
        elseif ($statusCode -eq 429) { "Yellow" }
        else { "Red" }
    )
    
    if ($statusCode -eq 404) {
        Write-Host "❌ 404 错误 - 接口未找到！" -ForegroundColor Red
        Write-Host "`n可能的原因:" -ForegroundColor Yellow
        Write-Host "1. Vercel 部署未完成" -ForegroundColor Gray
        Write-Host "2. CDN 缓存未更新（等待 1-2 分钟）" -ForegroundColor Gray
        Write-Host "3. 路由配置问题" -ForegroundColor Gray
    }
    elseif ($statusCode -eq 401) {
        Write-Host "✅ 接口正常！返回 401 是预期的（测试 code 无效）" -ForegroundColor Green
        
        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "`n响应内容:" -ForegroundColor White
                Write-Host $responseBody
            } catch {}
        }
    }
    elseif ($statusCode -eq 429) {
        Write-Host "⚠️  请求过于频繁（429）" -ForegroundColor Yellow
        Write-Host "等待几分钟后再试" -ForegroundColor Gray
    }
    else {
        Write-Host "❌ 错误: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

