@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   生成 JWT_SECRET 密钥
echo ========================================
echo.

echo 方法1: 使用 PowerShell 生成（推荐）
echo ----------------------------------------
echo.
powershell -Command "[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))"
echo.
echo.

echo 方法2: 使用时间戳+随机数
echo ----------------------------------------
echo.
echo jwt-secret-%RANDOM%%RANDOM%%RANDOM%%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
echo.
echo.

echo ========================================
echo   使用说明
echo ========================================
echo.
echo 1. 复制上面任一个生成的密钥
echo 2. 在 Vercel Dashboard 中添加环境变量:
echo    - Key: JWT_SECRET
echo    - Value: [粘贴刚才复制的密钥]
echo    - Environment: Production, Preview, Development
echo 3. 保存并重新部署
echo.
echo 提示: 方法1生成的密钥更安全（32字节Base64编码）
echo.

pause

