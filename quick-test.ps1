# CookTip API 快速测试脚本
# 绕过浏览器限制，直接测试后端接口

Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CookTip Backend API 快速测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"

$baseUrl = "https://cooktip-backend.vercel.app"
$testResults = @()

# 测试函数
function Test-API {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    Write-Host "测试: $Name" -ForegroundColor Yellow -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host " ✅ 成功" -ForegroundColor Green
        
        $script:testResults += @{
            Name = $Name
            Status = "Success"
            Response = $response
        }
        
        return $response
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 401) {
            Write-Host " ⚠️  401 (正常 - 测试code无效或未登录)" -ForegroundColor Yellow
            $script:testResults += @{
                Name = $Name
                Status = "Expected Error"
                Code = 401
            }
        } else {
            Write-Host " ❌ 失败: $($_.Exception.Message)" -ForegroundColor Red
            $script:testResults += @{
                Name = $Name
                Status = "Failed"
                Error = $_.Exception.Message
            }
        }
    }
    
    Start-Sleep -Milliseconds 500
}

# 1. 测试菜谱列表
$recipes = Test-API -Name "菜谱列表" -Url "$baseUrl/api/recipes?page=1&limit=5"
if ($recipes) {
    Write-Host "   └─ 获取到 $($recipes.data.total) 条菜谱，当前页 $($recipes.data.recipes.Count) 条" -ForegroundColor Gray
    $recipeId = $recipes.data.recipes[0].id
    Write-Host "   └─ 第一个菜谱ID: $recipeId" -ForegroundColor Gray
}

# 2. 测试搜索
$search = Test-API -Name "搜索菜谱" -Url "$baseUrl/api/search?keyword=鸡"
if ($search) {
    Write-Host "   └─ 搜索到 $($search.data.total) 个结果" -ForegroundColor Gray
}

# 3. 测试分类
$categories = Test-API -Name "分类列表" -Url "$baseUrl/api/categories"
if ($categories) {
    Write-Host "   └─ 获取到 $($categories.data.categories.Count) 个分类" -ForegroundColor Gray
}

# 4. 测试菜谱详情（如果有菜谱ID）
if ($recipeId) {
    $recipe = Test-API -Name "菜谱详情" -Url "$baseUrl/api/recipes/$recipeId"
    if ($recipe) {
        Write-Host "   └─ 菜谱名称: $($recipe.data.title)" -ForegroundColor Gray
    }
}

# 5. 测试评论列表（如果有菜谱ID）
if ($recipeId) {
    $comments = Test-API -Name "评论列表" -Url "$baseUrl/api/comments?recipeId=$recipeId"
    if ($comments) {
        Write-Host "   └─ 评论数量: $($comments.data.comments.Count)" -ForegroundColor Gray
    }
}

# 6. 测试微信登录（预期 401）
Test-API -Name "微信登录" -Url "$baseUrl/api/auth/wechat" -Method POST -Body @{ code = "test-code-12345" }

# 7. 测试用户信息（预期 401，未登录）
Test-API -Name "用户信息" -Url "$baseUrl/api/user/info"

# 8. 测试收藏列表（预期 401，未登录）
Test-API -Name "收藏列表" -Url "$baseUrl/api/favorites"

Write-Host "`n"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试结果汇总" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"

$successCount = ($testResults | Where-Object { $_.Status -eq "Success" }).Count
$expectedErrorCount = ($testResults | Where-Object { $_.Status -eq "Expected Error" }).Count
$failedCount = ($testResults | Where-Object { $_.Status -eq "Failed" }).Count
$totalCount = $testResults.Count

Write-Host "总测试数: $totalCount" -ForegroundColor White
Write-Host "成功: $successCount" -ForegroundColor Green
Write-Host "预期错误 (401): $expectedErrorCount" -ForegroundColor Yellow
Write-Host "真实失败: $failedCount" -ForegroundColor Red

Write-Host "`n"

if ($failedCount -eq 0) {
    Write-Host "🎉 所有接口正常工作！" -ForegroundColor Green
    Write-Host "`n后端服务状态: ✅ 正常" -ForegroundColor Green
    Write-Host "数据库连接: ✅ 正常" -ForegroundColor Green
    Write-Host "API 部署: ✅ 正常" -ForegroundColor Green
} else {
    Write-Host "⚠️  发现 $failedCount 个接口失败" -ForegroundColor Yellow
    Write-Host "`n失败的接口:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "Failed" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host "`n"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"

# 提示
Write-Host "💡 提示:" -ForegroundColor Cyan
Write-Host "  - 401 错误是正常的（测试code无效或需要登录）" -ForegroundColor Gray
Write-Host "  - 真实的微信登录需要在小程序中测试" -ForegroundColor Gray
Write-Host "  - 需要认证的接口需要先登录获取 Token" -ForegroundColor Gray
Write-Host "`n"

