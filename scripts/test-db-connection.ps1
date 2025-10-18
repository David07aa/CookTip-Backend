# 数据库连接诊断脚本

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔍 数据库连接诊断工具" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$dbHost = "sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com"
$dbPort = 23831
$internalHost = "10.32.104.73"
$internalPort = 3306

# 测试1: DNS解析
Write-Host "📡 测试1: DNS解析" -ForegroundColor Yellow
Write-Host "主机: $dbHost"
try {
    $dnsResult = Resolve-DnsName -Name $dbHost -ErrorAction Stop
    Write-Host "✅ DNS解析成功" -ForegroundColor Green
    Write-Host "   IP地址:" $dnsResult.IPAddress -ForegroundColor Green
} catch {
    Write-Host "❌ DNS解析失败: $_" -ForegroundColor Red
    Write-Host "   可能原因: 网络问题或域名不存在" -ForegroundColor Yellow
}
Write-Host ""

# 测试2: Ping测试
Write-Host "📡 测试2: Ping测试" -ForegroundColor Yellow
Write-Host "主机: $dbHost"
try {
    $pingResult = Test-Connection -ComputerName $dbHost -Count 2 -ErrorAction Stop
    Write-Host "✅ Ping成功" -ForegroundColor Green
    Write-Host "   响应时间:" $pingResult[0].ResponseTime "ms" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Ping失败或被禁用" -ForegroundColor Yellow
    Write-Host "   注意: 有些服务器禁止Ping，这不一定表示有问题" -ForegroundColor Yellow
}
Write-Host ""

# 测试3: 端口连通性测试（外网）
Write-Host "📡 测试3: 外网端口连通性测试" -ForegroundColor Yellow
Write-Host "主机: $dbHost"
Write-Host "端口: $dbPort"
try {
    $tcpResult = Test-NetConnection -ComputerName $dbHost -Port $dbPort -WarningAction SilentlyContinue
    
    if ($tcpResult.TcpTestSucceeded) {
        Write-Host "✅ 端口 $dbPort 可以访问！" -ForegroundColor Green
        Write-Host "   这说明网络连通性正常" -ForegroundColor Green
        Write-Host "   如果Navicat还连不上，检查：" -ForegroundColor Yellow
        Write-Host "   1. 用户名密码是否正确" -ForegroundColor Yellow
        Write-Host "   2. IP是否在白名单中" -ForegroundColor Yellow
    } else {
        Write-Host "❌ 端口 $dbPort 无法访问！" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 可能的原因和解决方案：" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. 数据库外网访问未开启（最常见）" -ForegroundColor Yellow
        Write-Host "   解决方案：" -ForegroundColor White
        Write-Host "   - 登录腾讯云控制台" -ForegroundColor White
        Write-Host "   - 进入云数据库 → 实例列表" -ForegroundColor White
        Write-Host "   - 找到你的数据库实例" -ForegroundColor White
        Write-Host "   - 点击'开启外网地址'" -ForegroundColor White
        Write-Host ""
        Write-Host "2. IP白名单限制" -ForegroundColor Yellow
        Write-Host "   解决方案：" -ForegroundColor White
        Write-Host "   - 获取你的公网IP（访问 https://ip.cn/）" -ForegroundColor White
        Write-Host "   - 在腾讯云控制台添加你的IP到白名单" -ForegroundColor White
        Write-Host ""
        Write-Host "3. 本地防火墙阻止" -ForegroundColor Yellow
        Write-Host "   解决方案：" -ForegroundColor White
        Write-Host "   - 临时关闭防火墙测试" -ForegroundColor White
        Write-Host "   - 或添加允许规则（端口$dbPort）" -ForegroundColor White
        Write-Host ""
        Write-Host "4. 公司网络限制" -ForegroundColor Yellow
        Write-Host "   解决方案：" -ForegroundColor White
        Write-Host "   - 尝试使用手机热点" -ForegroundColor White
        Write-Host "   - 或换家庭网络测试" -ForegroundColor White
    }
} catch {
    Write-Host "❌ 测试失败: $_" -ForegroundColor Red
}
Write-Host ""

# 测试4: 获取本机公网IP
Write-Host "📡 测试4: 获取你的公网IP" -ForegroundColor Yellow
try {
    $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
    Write-Host "✅ 你的公网IP: $publicIP" -ForegroundColor Green
    Write-Host "   如果需要配置IP白名单，使用这个IP地址" -ForegroundColor Yellow
} catch {
    Write-Host "⚠️  无法获取公网IP" -ForegroundColor Yellow
    Write-Host "   请访问 https://ip.cn/ 查看你的IP" -ForegroundColor Yellow
}
Write-Host ""

# 测试5: 检查本地防火墙状态
Write-Host "📡 测试5: 检查Windows防火墙状态" -ForegroundColor Yellow
try {
    $firewallStatus = Get-NetFirewallProfile -ErrorAction Stop | Select-Object Name, Enabled
    Write-Host "防火墙状态:" -ForegroundColor White
    foreach ($profile in $firewallStatus) {
        $status = if ($profile.Enabled) { "开启" } else { "关闭" }
        $color = if ($profile.Enabled) { "Yellow" } else { "Green" }
        Write-Host "  $($profile.Name): $status" -ForegroundColor $color
    }
} catch {
    Write-Host "⚠️  无法检查防火墙状态" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📋 诊断总结" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "数据库连接信息:" -ForegroundColor White
Write-Host "  外网地址: $dbHost" -ForegroundColor White
Write-Host "  外网端口: $dbPort" -ForegroundColor White
Write-Host "  内网地址: $internalHost (仅云内部可访问)" -ForegroundColor White
Write-Host "  内网端口: $internalPort" -ForegroundColor White
Write-Host "  用户名: root" -ForegroundColor White
Write-Host "  数据库: cooktip" -ForegroundColor White
Write-Host ""

Write-Host "下一步操作建议:" -ForegroundColor Cyan
Write-Host "1. 如果端口测试失败 → 检查数据库外网访问是否开启" -ForegroundColor White
Write-Host "2. 如果端口测试成功 → 检查Navicat配置和账号密码" -ForegroundColor White
Write-Host "3. 查看详细解决方案 → 数据库连接超时解决方案.md" -ForegroundColor White
Write-Host ""

Write-Host "需要帮助？请提供以上测试结果！" -ForegroundColor Green
Write-Host ""

