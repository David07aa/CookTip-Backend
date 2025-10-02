# CookTip Backend 一键部署脚本
# 用法: .\deploy.ps1 "提交信息"

param(
    [Parameter(Mandatory=$true)]
    [string]$message
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CookTip Backend 一键部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 添加所有更改
Write-Host "[1/5] 添加所有更改到 Git..." -ForegroundColor Yellow
git add -A

# 2. 提交更改
Write-Host "[2/5] 提交更改: $message" -ForegroundColor Yellow
git commit -m "$message"

# 3. 推送到 GitHub
Write-Host "[3/5] 推送到 GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ GitHub 推送失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✅ GitHub 推送成功！" -ForegroundColor Green
Write-Host ""

# 4. 部署到 Vercel
Write-Host "[4/5] 部署到 Vercel 生产环境..." -ForegroundColor Yellow
$env:VERCEL_TOKEN = "G6jj9jmjazCTlSAsQ7BYhbEf"
vercel --prod --token $env:VERCEL_TOKEN --yes

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel 部署失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Vercel 部署成功！" -ForegroundColor Green
Write-Host ""

# 5. 完成
Write-Host "[5/5] 部署完成！" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ 部署成功完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "生产环境: https://cooktip-backend.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "常用测试接口:" -ForegroundColor Yellow
Write-Host "  - 食谱列表: https://cooktip-backend.vercel.app/api/recipes?page=1&limit=5" -ForegroundColor Gray
Write-Host "  - 搜索接口: https://cooktip-backend.vercel.app/api/search?keyword=鸡&page=1&pageSize=5" -ForegroundColor Gray
Write-Host "  - 分类列表: https://cooktip-backend.vercel.app/api/categories" -ForegroundColor Gray
Write-Host ""

