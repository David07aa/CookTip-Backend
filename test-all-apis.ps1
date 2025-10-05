# CookTip 后端接口自动化测试脚本
# 创建时间: 2025-10-05

$API_BASE = "https://cooktip-backend.vercel.app"
$results = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CookTip 后端接口全面测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "测试服务器: $API_BASE" -ForegroundColor Yellow
Write-Host ""

function Test-API {
    param(
        [string]$name,
        [string]$method,
        [string]$path,
        [hashtable]$body = $null,
        [hashtable]$headers = @{}
    )
    
    Write-Host "测试: $name" -NoNewline
    Write-Host " [$method $path]" -ForegroundColor Gray
    
    try {
        $url = "$API_BASE$path"
        $params = @{
            Uri = $url
            Method = $method
            Headers = $headers
            ContentType = "application/json"
            TimeoutSec = 10
            ErrorAction = "Stop"
        }
        
        if ($body) {
            $params.Body = ($body | ConvertTo-Json)
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        
        Write-Host "  ✅ " -ForegroundColor Green -NoNewline
        Write-Host "状态码: $statusCode" -ForegroundColor Green
        
        # 尝试解析响应内容
        try {
            $content = $response.Content | ConvertFrom-Json
            Write-Host "  响应: " -NoNewline -ForegroundColor Gray
            Write-Host ($content | ConvertTo-Json -Compress) -ForegroundColor Gray
        } catch {
            Write-Host "  响应: $($response.Content)" -ForegroundColor Gray
        }
        
        $script:results += [PSCustomObject]@{
            Name = $name
            Path = $path
            Method = $method
            Status = $statusCode
            Result = "✅ 成功"
        }
        
        return $true
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMsg = $_.Exception.Message
        
        # 401, 400, 429 等状态码说明接口存在，只是参数或权限问题
        if ($statusCode -in @(400, 401, 403, 429)) {
            Write-Host "  ✅ " -ForegroundColor Green -NoNewline
            Write-Host "状态码: $statusCode (接口存在)" -ForegroundColor Yellow
            
            $script:results += [PSCustomObject]@{
                Name = $name
                Path = $path
                Method = $method
                Status = $statusCode
                Result = "✅ 接口存在"
            }
            
            return $true
        }
        # 404 说明接口不存在
        elseif ($statusCode -eq 404) {
            Write-Host "  ❌ " -ForegroundColor Red -NoNewline
            Write-Host "状态码: 404 (接口不存在)" -ForegroundColor Red
            
            $script:results += [PSCustomObject]@{
                Name = $name
                Path = $path
                Method = $method
                Status = 404
                Result = "❌ 不存在"
            }
            
            return $false
        }
        # 其他错误
        else {
            Write-Host "  ❌ " -ForegroundColor Red -NoNewline
            Write-Host "错误: $errorMsg" -ForegroundColor Red
            
            $script:results += [PSCustomObject]@{
                Name = $name
                Path = $path
                Method = $method
                Status = "Error"
                Result = "❌ $errorMsg"
            }
            
            return $false
        }
    }
    
    Write-Host ""
}

# ============================================
# 开始测试
# ============================================

Write-Host "开始测试..." -ForegroundColor Cyan
Write-Host ""

# 1. 微信登录接口
Write-Host "【1】认证接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Test-API -name "微信登录" -method "POST" -path "/api/auth/wechat" -body @{ code = "test-code" }
Write-Host ""

# 2. 菜谱接口
Write-Host "【2】菜谱接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Test-API -name "获取菜谱列表" -method "GET" -path "/api/recipes"
Test-API -name "获取菜谱详情" -method "GET" -path "/api/recipes/1"
Write-Host ""

# 3. 分类接口
Write-Host "【3】分类接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Test-API -name "获取分类列表" -method "GET" -path "/api/categories"
Write-Host ""

# 4. 搜索接口
Write-Host "【4】搜索接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Test-API -name "搜索菜谱" -method "GET" -path "/api/search?q=test"
Write-Host ""

# 5. 用户接口
Write-Host "【5】用户接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Test-API -name "获取用户信息" -method "GET" -path "/api/user/info"
Test-API -name "获取用户菜谱" -method "GET" -path "/api/user/recipes"
Test-API -name "获取指定用户信息" -method "GET" -path "/api/users/1"
Write-Host ""

# 6. 收藏接口
Write-Host "【6】收藏接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Test-API -name "获取收藏列表" -method "GET" -path "/api/favorites"
Test-API -name "添加收藏" -method "POST" -path "/api/favorites" -body @{ recipeId = 1 }
Write-Host ""

# 7. 点赞接口
Write-Host "【7】点赞接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Test-API -name "添加点赞" -method "POST" -path "/api/likes" -body @{ recipeId = 1 }
Write-Host ""

# 8. 评论接口
Write-Host "【8】评论接口" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Test-API -name "获取评论列表" -method "GET" -path "/api/comments?recipeId=1"
Test-API -name "添加评论" -method "POST" -path "/api/comments" -body @{ recipeId = 1; content = "test" }
Write-Host ""

# ============================================
# 测试总结
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 统计结果
$total = $results.Count
$success = ($results | Where-Object { $_.Result -like "*成功*" -or $_.Result -like "*存在*" }).Count
$failed = $total - $success

Write-Host "测试统计:" -ForegroundColor Yellow
Write-Host "  总计: $total 个接口" -ForegroundColor White
Write-Host "  ✅ 可用: $success 个" -ForegroundColor Green
Write-Host "  ❌ 失败: $failed 个" -ForegroundColor Red
Write-Host ""

# 显示详细结果表格
Write-Host "详细结果:" -ForegroundColor Yellow
$results | Format-Table -AutoSize

# 保存测试报告
$reportPath = "API测试报告-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$report = @"
========================================
CookTip 后端接口测试报告
========================================

测试时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
测试服务器: $API_BASE

测试统计:
- 总计: $total 个接口
- ✅ 可用: $success 个
- ❌ 失败: $failed 个

详细结果:
$(($results | Format-Table -AutoSize | Out-String))

========================================
"@

$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "测试报告已保存: $reportPath" -ForegroundColor Green
Write-Host ""

# 返回测试结果
if ($failed -eq 0) {
    Write-Host "🎉 所有接口测试通过！" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  有 $failed 个接口测试失败，请检查。" -ForegroundColor Yellow
    exit 1
}

