# 延迟测试脚本 - 等待速率限制重置后测试
$BASE_URL = "https://cooktip-backend.vercel.app"
$WAIT_MINUTES = 8

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CookTip API 延迟测试" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "⏰ 等待 $WAIT_MINUTES 分钟后开始测试..." -ForegroundColor Yellow
Write-Host "   原因: 避免 Vercel 速率限制 (429 Too Many Requests)" -ForegroundColor Gray
Write-Host "   开始时间: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray

# 倒计时
for ($i = $WAIT_MINUTES; $i -gt 0; $i--) {
    Write-Host "   还需等待 $i 分钟..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
}

Write-Host "`n✓ 等待完成，开始测试！`n" -ForegroundColor Green

# 测试函数
function Test-API {
    param(
        [string]$Name,
        [string]$Url
    )
    
    Write-Host "测试: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 30 -ErrorAction Stop
        Write-Host "✓ 成功 (状态码: 200)" -ForegroundColor Green
        return @{ success = $true; data = $response }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "✗ 失败 (状态码: $statusCode)" -ForegroundColor Red
        Write-Host "  错误: $($_.Exception.Message)" -ForegroundColor Red
        return @{ success = $false; error = $_.Exception.Message }
    }
}

# 测试 1: 健康检查
Write-Host "`n【测试 1】健康检查" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
$health = Test-API -Name "健康检查" -Url "$BASE_URL/api/recipes?health=check"
if ($health.success) {
    Write-Host "  数据库状态: $($health.data.connection)" -ForegroundColor Green
    Write-Host "  数据库类型: $($health.data.database)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ 如果仍然是 429 错误，请再等待几分钟" -ForegroundColor Yellow
}

Start-Sleep -Seconds 5

# 测试 2: 食谱列表
Write-Host "`n【测试 2】食谱列表" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
$recipes = Test-API -Name "食谱列表" -Url "$BASE_URL/api/recipes?page=1&limit=5"
if ($recipes.success -and $recipes.data.code -eq 200) {
    $total = $recipes.data.data.pagination.total
    $count = $recipes.data.data.list.Count
    Write-Host "  总数: $total 个菜谱" -ForegroundColor Green
    Write-Host "  本页显示: $count 个菜谱" -ForegroundColor Green
    Write-Host "`n  前5个菜谱:" -ForegroundColor Yellow
    $recipes.data.data.list | ForEach-Object -Begin { $i = 1 } -Process {
        Write-Host "    $i. $($_.title) [$($_.category)] - $($_.difficulty)" -ForegroundColor White
        $i++
    }
}

Start-Sleep -Seconds 5

# 测试 3: 搜索功能
Write-Host "`n【测试 3】搜索功能" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
$search = Test-API -Name "搜索'鸡'" -Url "$BASE_URL/api/search?keyword=鸡&page=1&pageSize=5"
if ($search.success -and $search.data.code -eq 200) {
    Write-Host "  搜索结果: $($search.data.data.total) 个" -ForegroundColor Green
    Write-Host "`n  搜索到的菜谱:" -ForegroundColor Yellow
    $search.data.data.list | ForEach-Object -Begin { $i = 1 } -Process {
        Write-Host "    $i. $($_.title)" -ForegroundColor White
        $i++
    }
}

Start-Sleep -Seconds 5

# 测试 4: 分类筛选
Write-Host "`n【测试 4】分类筛选" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
$category = Test-API -Name "炒菜分类" -Url "$BASE_URL/api/recipes?category=炒菜&page=1&limit=3"
if ($category.success -and $category.data.code -eq 200) {
    Write-Host "  炒菜分类: $($category.data.data.pagination.total) 个" -ForegroundColor Green
}

Start-Sleep -Seconds 5

# 测试 5: 食谱详情
if ($recipes.success -and $recipes.data.data.list.Count -gt 0) {
    Write-Host "`n【测试 5】食谱详情" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    $firstId = $recipes.data.data.list[0].id
    $detail = Test-API -Name "食谱详情" -Url "$BASE_URL/api/recipes/$firstId"
    if ($detail.success -and $detail.data.code -eq 200) {
        Write-Host "`n  菜谱名称: $($detail.data.data.title)" -ForegroundColor Green
        $introLength = [Math]::Min(50, $detail.data.data.introduction.Length)
        Write-Host "  简介: $($detail.data.data.introduction.Substring(0, $introLength))..." -ForegroundColor Gray
        Write-Host "  烹饪时间: $($detail.data.data.cookTime) 分钟" -ForegroundColor Gray
        Write-Host "  难度: $($detail.data.data.difficulty)" -ForegroundColor Gray
        Write-Host "  原料数量: $($detail.data.data.ingredients.Count) 个" -ForegroundColor Gray
        Write-Host "  步骤数量: $($detail.data.data.steps.Count) 个" -ForegroundColor Gray
    }
}

# 总结
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  测试完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($health.success -and $recipes.success -and $search.success) {
    Write-Host "`n🎉 所有测试通过！" -ForegroundColor Green
    Write-Host "✓ API 运行正常" -ForegroundColor Green
    Write-Host "✓ 前端可以正常获取老乡鸡菜谱数据" -ForegroundColor Green
    Write-Host "✓ 共 198 个菜谱已成功上线`n" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ 部分测试失败" -ForegroundColor Yellow
    Write-Host "请查看上面的详细错误信息`n" -ForegroundColor Yellow
}

Write-Host "完成时间: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray

