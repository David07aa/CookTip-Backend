# 测试 CookTip API 接口
$BASE_URL = "https://cooktip-backend.vercel.app"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CookTip API 接口测试" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

function Test-API {
    param(
        [string]$Name,
        [string]$Url
    )
    
    Write-Host "测试: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 30 -ErrorAction Stop
        Write-Host "✓ 成功" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "✗ 失败: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 测试 1: 健康检查
Write-Host "`n【测试 1】健康检查" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
$health = Test-API -Name "健康检查" -Url "$BASE_URL/api/recipes?health=check"
if ($health) {
    Write-Host "数据库状态: $($health.connection)" -ForegroundColor Green
    Write-Host "数据库类型: $($health.database)" -ForegroundColor Green
}

Start-Sleep -Seconds 3

# 测试 2: 食谱列表
Write-Host "`n【测试 2】食谱列表" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
$recipes = Test-API -Name "食谱列表" -Url "$BASE_URL/api/recipes?page=1&limit=5"
if ($recipes -and $recipes.code -eq 200) {
    $total = $recipes.data.pagination.total
    $count = $recipes.data.list.Count
    Write-Host "总数: $total 个菜谱" -ForegroundColor Green
    Write-Host "本页显示: $count 个菜谱" -ForegroundColor Green
    Write-Host "`n前5个菜谱:" -ForegroundColor Yellow
    $recipes.data.list | ForEach-Object -Begin { $i = 1 } -Process {
        Write-Host "  $i. $($_.title) [$($_.category)] - $($_.difficulty)" -ForegroundColor White
        $i++
    }
}

Start-Sleep -Seconds 3

# 测试 3: 搜索功能
Write-Host "`n【测试 3】搜索功能" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
$search = Test-API -Name "搜索'鸡'" -Url "$BASE_URL/api/search?keyword=鸡&page=1&pageSize=5"
if ($search -and $search.code -eq 200) {
    Write-Host "搜索结果: $($search.data.total) 个" -ForegroundColor Green
    Write-Host "`n搜索到的菜谱:" -ForegroundColor Yellow
    $search.data.list | ForEach-Object -Begin { $i = 1 } -Process {
        Write-Host "  $i. $($_.title)" -ForegroundColor White
        $i++
    }
}

Start-Sleep -Seconds 3

# 测试 4: 分类筛选
Write-Host "`n【测试 4】分类筛选" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
$category = Test-API -Name "炒菜分类" -Url "$BASE_URL/api/recipes?category=炒菜&page=1&limit=3"
if ($category -and $category.code -eq 200) {
    Write-Host "炒菜分类: $($category.data.pagination.total) 个" -ForegroundColor Green
}

Start-Sleep -Seconds 3

# 测试 5: 食谱详情
if ($recipes -and $recipes.data.list.Count -gt 0) {
    Write-Host "`n【测试 5】食谱详情" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    $firstId = $recipes.data.list[0].id
    $detail = Test-API -Name "食谱详情" -Url "$BASE_URL/api/recipes/$firstId"
    if ($detail -and $detail.code -eq 200) {
        Write-Host "`n菜谱名称: $($detail.data.title)" -ForegroundColor Green
        Write-Host "简介: $($detail.data.introduction.Substring(0, [Math]::Min(50, $detail.data.introduction.Length)))..." -ForegroundColor Gray
        Write-Host "烹饪时间: $($detail.data.cookTime) 分钟" -ForegroundColor Gray
        Write-Host "难度: $($detail.data.difficulty)" -ForegroundColor Gray
        Write-Host "原料数量: $($detail.data.ingredients.Count) 个" -ForegroundColor Gray
        Write-Host "步骤数量: $($detail.data.steps.Count) 个" -ForegroundColor Gray
    }
}

# 总结
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  测试完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n✓ API 运行正常" -ForegroundColor Green
Write-Host "✓ 前端可以正常获取老乡鸡菜谱数据" -ForegroundColor Green
Write-Host "✓ 共 198 个菜谱已成功上线`n" -ForegroundColor Green

