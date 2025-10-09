@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 CookTip 对象存储迁移工具
echo ========================================
echo.
echo 对象存储信息：
echo   存储桶：796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091
echo   地域：ap-shanghai
echo.
echo ========================================
echo.

:MENU
echo 请选择操作：
echo.
echo   1. 更新数据库（将图片URL迁移到对象存储）
echo   2. 验证迁移结果
echo   3. 执行完整迁移（1+2）
echo   0. 退出
echo.
set /p choice=请输入选项 (0-3): 

if "%choice%"=="1" goto UPDATE
if "%choice%"=="2" goto VERIFY
if "%choice%"=="3" goto FULL
if "%choice%"=="0" goto EXIT
echo 无效选项，请重新选择！
echo.
goto MENU

:UPDATE
echo.
echo ========================================
echo 📝 步骤1：更新数据库
echo ========================================
echo.
node update-to-storage.js
if errorlevel 1 (
    echo.
    echo ❌ 更新失败！请检查错误信息
    pause
    goto MENU
)
echo.
echo ✅ 数据库更新完成！
echo.
pause
goto MENU

:VERIFY
echo.
echo ========================================
echo 🔍 步骤2：验证迁移结果
echo ========================================
echo.
node verify-storage-urls.js
echo.
pause
goto MENU

:FULL
echo.
echo ========================================
echo 🚀 执行完整迁移流程
echo ========================================
echo.
echo 📝 步骤1/2：更新数据库...
echo.
node update-to-storage.js
if errorlevel 1 (
    echo.
    echo ❌ 更新失败！迁移终止
    pause
    goto MENU
)
echo.
echo ✅ 数据库更新完成！
echo.
echo 🔍 步骤2/2：验证迁移结果...
echo.
node verify-storage-urls.js
echo.
echo ========================================
echo ✅ 完整迁移流程执行完毕！
echo ========================================
echo.
echo 📌 后续步骤：
echo.
echo   1. 在浏览器中测试上面输出的示例URL
echo   2. 配置小程序域名白名单：
echo      https://mp.weixin.qq.com
echo      路径：开发 → 开发管理 → 开发设置 → 服务器域名
echo      添加 downloadFile 合法域名：
echo      https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com
echo   3. 重新编译小程序并测试图片显示
echo.
pause
goto MENU

:EXIT
echo.
echo 👋 感谢使用，再见！
echo.
exit


