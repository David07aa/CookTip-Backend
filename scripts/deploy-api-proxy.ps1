# 云函数快速部署脚本 (PowerShell)
# 用于部署修复后的 api-proxy 云函数

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  CookTip 云函数部署工具" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查当前目录
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查云函数目录
if (-Not (Test-Path "cloudfunctions/api-proxy")) {
    Write-Host "❌ 错误: 找不到云函数目录 cloudfunctions/api-proxy" -ForegroundColor Red
    exit 1
}

Write-Host "📦 准备部署 api-proxy 云函数..." -ForegroundColor Yellow
Write-Host ""

# 显示修改内容
Write-Host "📝 本次修改内容:" -ForegroundColor Green
Write-Host "  - 自动添加 /api/v1 API 前缀"
Write-Host "  - 修复前端 404 错误问题"
Write-Host ""

# 检查是否安装了 tcb CLI
$tcbInstalled = Get-Command tcb -ErrorAction SilentlyContinue

if ($tcbInstalled) {
    Write-Host "✅ 检测到 Tencent Cloud Base CLI" -ForegroundColor Green
    Write-Host ""
    
    $useTcb = Read-Host "是否使用 tcb CLI 部署? (y/n)"
    
    if ($useTcb -eq "y" -or $useTcb -eq "Y") {
        Write-Host ""
        Write-Host "🚀 开始部署..." -ForegroundColor Yellow
        
        Set-Location cloudfunctions/api-proxy
        tcb fn deploy api-proxy --force
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ 部署成功！" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ 部署失败，请检查错误信息" -ForegroundColor Red
            Set-Location ../..
            exit 1
        }
        
        Set-Location ../..
    }
} else {
    Write-Host "⚠️  未检测到 tcb CLI" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请使用以下方式之一部署:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "方式 1: 微信开发者工具（推荐）" -ForegroundColor White
    Write-Host "  1. 打开微信开发者工具"
    Write-Host "  2. 找到 cloudfunctions/api-proxy 文件夹"
    Write-Host "  3. 右键 → 上传并部署：云端安装依赖"
    Write-Host ""
    Write-Host "方式 2: 安装 tcb CLI 后重新运行" -ForegroundColor White
    Write-Host "  npm install -g @cloudbase/cli"
    Write-Host "  tcb login"
    Write-Host "  .\scripts\deploy-api-proxy.ps1"
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  部署完成" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 后续步骤:" -ForegroundColor Green
Write-Host "  1. 等待 1-2 分钟让云函数生效"
Write-Host "  2. 在微信开发者工具中测试登录功能"
Write-Host "  3. 查看云函数日志确认路径包含 /api/v1"
Write-Host ""
Write-Host "🧪 测试命令（在小程序控制台执行）:" -ForegroundColor Yellow
Write-Host ""
Write-Host "wx.cloud.callFunction({" -ForegroundColor Gray
Write-Host "  name: 'api-proxy'," -ForegroundColor Gray
Write-Host "  data: {" -ForegroundColor Gray
Write-Host "    method: 'GET'," -ForegroundColor Gray
Write-Host "    path: '/health'" -ForegroundColor Gray
Write-Host "  }" -ForegroundColor Gray
Write-Host "}).then(console.log)" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 详细文档: 修复404错误-部署指南.md" -ForegroundColor Cyan
Write-Host ""

