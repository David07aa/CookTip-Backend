# 📦 安装指南

## 当前状态

✅ 所有代码已创建完成  
⏳ 等待安装 Node.js  
⏳ 等待初始化数据库  

---

## 第一步：安装 Node.js

### Windows 用户（推荐）

1. 访问 **https://nodejs.org/**
2. 点击下载 **LTS 版本**（如 v20.10.0）
3. 运行安装程序 `node-v20.x.x-x64.msi`
4. 一路点击 "Next"，保持默认设置
5. 完成安装

### 验证安装

打开 **PowerShell** 或 **命令提示符**，运行：

```powershell
node --version
npm --version
```

应该看到：
```
v20.10.0
10.2.3
```

如果显示版本号，说明安装成功！

---

## 第二步：安装项目依赖

在项目目录打开 PowerShell：

```powershell
cd E:\前端项目文档\项目文件夹\CookTip-Backend
npm install
```

**预计时间：** 2-3 分钟

**预期输出：**
```
added 50 packages in 2m
```

---

## 第三步：初始化数据库

运行初始化脚本：

```powershell
npm run db:init
```

**预期输出：**
```
============================================================
🚀 一家食谱 - 数据库初始化脚本
============================================================

🔄 正在连接数据库...
   主机: mysql3.sqlpub.com:3308
   数据库: onefoodlibrary
✅ 数据库连接成功！

🗑️  正在清除表...
   ✓ 已删除表: (如果有旧表)
✅ 表清除完成！

📝 正在创建数据表...
   ✓ 已创建表: users
   ✓ 已创建表: recipes
   ✓ 已创建表: comments
   ✓ 已创建表: favorites
   ✓ 已创建表: likes
   ✓ 已创建表: shopping_lists
   ✓ 已创建表: follows
✅ 数据表创建完成！

🔍 验证表结构...
   ✓ users (13 列)
   ✓ recipes (21 列)
   ✓ comments (8 列)
   ✓ favorites (4 列)
   ✓ likes (4 列)
   ✓ shopping_lists (3 列)
   ✓ follows (4 列)

✅ 数据库初始化成功！

📊 数据库统计:
   - 数据库名称: onefoodlibrary
   - 表数量: 7
   - 状态: 就绪

🔌 数据库连接已关闭
```

---

## 第四步：插入测试数据（可选）

```powershell
npm run db:seed
```

会创建：
- 2 个测试用户
- 5 个测试食谱（番茄炒蛋、宫保鸡丁、戚风蛋糕等）

---

## 第五步：本地测试（可选）

### 安装 Vercel CLI

```powershell
npm install -g vercel
```

### 启动开发服务器

```powershell
vercel dev
```

首次运行会问几个问题：
- Set up and deploy "xxx"? **Y**
- Which scope? 选择你的账号
- Link to existing project? **N**
- What's your project's name? **cooktip-api**
- In which directory? **./** (直接回车)

### 测试 API

浏览器访问：
```
http://localhost:3000/api/recipes
```

应该返回：
```json
{
  "success": true,
  "data": {
    "recipes": [...],
    "pagination": {...}
  }
}
```

---

## 🎉 完成！

现在你可以：

### 1. 继续本地开发
```powershell
vercel dev
```

### 2. 部署到 Vercel

参考 [QUICK_START.md](./QUICK_START.md) 的步骤 6-8

---

## 🐛 常见问题

### 问题1：npm 命令找不到

**原因：** Node.js 未正确安装

**解决：**
1. 重新安装 Node.js
2. 重启 PowerShell
3. 重启电脑

### 问题2：npm install 很慢

**解决：** 使用国内镜像

```powershell
npm config set registry https://registry.npmmirror.com
npm install
```

### 问题3：数据库连接失败

**检查：**
- 网络连接是否正常
- 数据库地址、端口是否正确
- 用户名密码是否正确

**测试连接：**
使用 MySQL 客户端测试：
```
主机: mysql3.sqlpub.com
端口: 3308
用户: david_x
密码: your-database-password
数据库: onefoodlibrary
```

### 问题4：vercel dev 启动失败

**解决：**
```powershell
# 先登录
vercel login

# 再启动
vercel dev
```

---

## 📞 需要更多帮助？

- 查看 [README.md](./README.md) - 项目说明
- 查看 [QUICK_START.md](./QUICK_START.md) - 快速开始
- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
- 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目总结

---

**祝你好运！** 🚀
