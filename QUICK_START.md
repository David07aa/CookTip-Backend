# ⚡ 快速开始指南

## 🎯 目标

20分钟内完成后端部署！

---

## 📋 检查清单

在开始之前，确保你有：

- [ ] Windows 10/11 或 macOS 或 Linux
- [ ] SQLPub 数据库已创建
- [ ] 微信小程序 AppID 和 AppSecret
- [ ] GitHub 账号（推荐）
- [ ] Vercel 账号（免费）

---

## 步骤 1：安装 Node.js

### Windows 用户

1. 访问 https://nodejs.org/
2. 下载 LTS 版本（推荐 v18 或 v20）
3. 运行安装程序，一路 Next
4. 验证安装：

```powershell
node --version
npm --version
```

应该显示版本号，例如：
```
v20.10.0
10.2.3
```

### macOS 用户

```bash
# 使用 Homebrew 安装
brew install node@20

# 验证安装
node --version
npm --version
```

---

## 步骤 2：安装项目依赖

在项目目录下打开终端（PowerShell 或 CMD），运行：

```bash
npm install
```

等待安装完成（可能需要几分钟）...

---

## 步骤 3：配置环境变量

项目已经包含了 `.env.example` 文件，内容如下：

```env
DB_HOST=mysql3.sqlpub.com
DB_PORT=3308
DB_NAME=onefoodlibrary
DB_USER=david_x
DB_PASSWORD=NVRvnX3rP88UyUET

WECHAT_APPID=wx8486e57500ac0a55
WECHAT_SECRET=your_wechat_secret_here

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
```

**❗重要：** 将 `WECHAT_SECRET` 替换为你的真实微信小程序密钥！

---

## 步骤 4：初始化数据库

运行数据库初始化脚本：

```bash
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
   ✓ 已删除表: xxx
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

如果看到 ✅ 说明数据库初始化成功！

---

## 步骤 5：本地测试（可选）

### 5.1 安装 Vercel CLI

```bash
npm install -g vercel
```

### 5.2 启动开发服务器

```bash
vercel dev
```

首次运行会询问一些问题，按提示操作即可。

### 5.3 测试 API

浏览器访问：http://localhost:3000/api/recipes

应该返回：
```json
{
  "success": true,
  "data": {
    "recipes": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

---

## 步骤 6：部署到 Vercel

### 6.1 推送到 GitHub

```bash
# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 创建 GitHub 仓库后，添加远程地址
git remote add origin https://github.com/你的用户名/cooktip-api.git

# 推送
git push -u origin main
```

### 6.2 导入到 Vercel

1. 访问 https://vercel.com/ 并登录
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 选择你的 `cooktip-api` 仓库
5. 点击 "Import"

### 6.3 配置环境变量

在 Vercel 项目页面：

1. 进入 "Settings" → "Environment Variables"
2. 逐个添加以下变量：

```
DB_HOST = mysql3.sqlpub.com
DB_PORT = 3308
DB_NAME = onefoodlibrary
DB_USER = david_x
DB_PASSWORD = NVRvnX3rP88UyUET
WECHAT_APPID = wx8486e57500ac0a55
WECHAT_SECRET = （你的微信密钥）
JWT_SECRET = （一个强随机字符串）
```

**注意：** 每个变量都要选择 "All Environments"！

### 6.4 触发重新部署

配置完环境变量后：

1. 进入 "Deployments"
2. 点击最新部署旁边的 "..." 
3. 选择 "Redeploy"

---

## 步骤 7：获取 API 地址

部署成功后，Vercel 会提供一个 URL，例如：

```
https://cooktip-api-xxx.vercel.app
```

你的 API Base URL 就是：

```
https://cooktip-api-xxx.vercel.app/api
```

---

## 步骤 8：配置微信小程序

### 8.1 添加服务器域名

1. 登录 https://mp.weixin.qq.com/
2. 开发 → 开发管理 → 开发设置 → 服务器域名
3. 点击"修改"，添加：

```
request合法域名：
https://cooktip-api-xxx.vercel.app
https://api.weixin.qq.com
```

### 8.2 修改小程序代码

在小程序的 `app.js` 中：

```javascript
App({
  globalData: {
    baseURL: 'https://cooktip-api-xxx.vercel.app/api'
  }
});
```

---

## 🎉 完成！

恭喜！你的后端 API 已经成功部署！

### 测试一下

浏览器访问：
```
https://cooktip-api-xxx.vercel.app/api/recipes
```

如果返回 JSON 数据，说明部署成功！

---

## 🐛 遇到问题？

### Node.js 命令找不到

**问题：** `'node' 不是内部或外部命令`

**解决：** 
1. 重新安装 Node.js
2. 重启终端或电脑
3. 检查环境变量是否配置

### npm install 失败

**问题：** 网络超时或安装失败

**解决：** 
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 数据库连接失败

**问题：** `ECONNREFUSED` 或超时

**解决：** 
1. 检查数据库地址、端口是否正确
2. 检查用户名密码
3. 确认 SQLPub 数据库在线

### Vercel 部署后 500 错误

**问题：** API 返回 500

**解决：** 
1. 检查 Vercel 日志（Functions 标签）
2. 确认环境变量已全部配置
3. 重新部署

---

## 📚 下一步

- [ ] 阅读 [API 文档](./README.md#-api-接口文档)
- [ ] 插入测试数据
- [ ] 对接小程序前端
- [ ] 监控 API 性能

---

**需要更多帮助？** 查看 [详细部署指南](./DEPLOYMENT.md)
