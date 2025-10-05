# 更新数据库表结构
# 根据接口文档设计添加微信登录必需字段

Write-Host "`n=== 更新 users 表结构 ===" -ForegroundColor Cyan
Write-Host "根据后端接口开发文档添加微信登录必需字段`n" -ForegroundColor Yellow

# 检查 .env 文件
if (-not (Test-Path ".env")) {
    Write-Host "❌ 错误: 未找到 .env 文件" -ForegroundColor Red
    Write-Host "请确保项目根目录存在 .env 文件，包含 DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# 检查 DATABASE_URL
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "DATABASE_URL") {
    Write-Host "❌ 错误: .env 文件中未找到 DATABASE_URL" -ForegroundColor Red
    Write-Host "请添加: DATABASE_URL=你的数据库连接字符串" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 环境配置检查通过" -ForegroundColor Green
Write-Host ""

# 执行迁移
Write-Host "🚀 开始执行数据库迁移..." -ForegroundColor Cyan
Write-Host ""

try {
    node scripts/update-users-table.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ 数据库更新成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "已添加的字段:" -ForegroundColor Yellow
        Write-Host "  • session_key  - 微信会话密钥" -ForegroundColor Gray
        Write-Host "  • union_id     - 微信 unionid" -ForegroundColor Gray
        Write-Host "  • phone        - 手机号" -ForegroundColor Gray
        Write-Host "  • email        - 邮箱" -ForegroundColor Gray
        Write-Host "  • gender       - 性别 (0-未知, 1-男, 2-女)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "已创建的索引:" -ForegroundColor Yellow
        Write-Host "  • idx_users_phone" -ForegroundColor Gray
        Write-Host "  • idx_users_email" -ForegroundColor Gray
        Write-Host ""
        Write-Host "✅ users 表现在已完全符合接口文档设计！" -ForegroundColor Green
    } else {
        Write-Host "`n❌ 数据库更新失败，请检查错误信息" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`n❌ 执行失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

