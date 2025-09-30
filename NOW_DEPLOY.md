# 🚀 立即部署 - 3步完成

由于命令行字符编码问题，推荐使用 **网页部署** 方式。

---

## ⚡ 快速部署（3步）

### 第1步：准备代码（本地）

```bash
# 1. 确认所有文件
git status

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "feat: 完成所有21个核心API接口"
```

---

### 第2步：推送到 GitHub

如果还没有 GitHub 仓库：

1. **访问 GitHub**  
   https://github.com/new

2. **创建新仓库**  
   - Repository name: `cooktip-backend`
   - 选择 Public 或 Private
   - **不要**勾选任何初始化选项
   - 点击 "Create repository"

3. **关联并推送**
   ```bash
   # 添加远程仓库（替换为你的用户名）
   git remote add origin https://github.com/你的用户名/cooktip-backend.git
   
   # 推送代码
   git branch -M main
   git push -u origin main
   ```

如果已有仓库，直接推送：
```bash
git push origin main
```

---

### 第3步：在 Vercel 网站部署

#### 3.1 访问 Vercel
打开：https://vercel.com/new

#### 3.2 登录/注册
使用 GitHub 账号登录

#### 3.3 导入项目
1. 点击 "Import Git Repository"
2. 找到 `cooktip-backend` 仓库
3. 点击 "Import"

#### 3.4 配置项目

**Project Name**: `cooktip-api` （或自定义）

**Environment Variables**（重要！点击添加）:

```env
DB_HOST = mysql3.sqlpub.com
DB_PORT = 3308
DB_NAME = onefoodlibrary
DB_USER = david_x
DB_PASSWORD = NVRvnX3rP88UyUET
WECHAT_APPID = wx8486e57500ac0a55
WECHAT_SECRET = 你的微信小程序密钥
JWT_SECRET = your_super_secret_jwt_key_2024
```

**重要**：每个变量都要选择 **All Environments**！

#### 3.5 点击 Deploy

等待 1-2 分钟...

---

## ✅ 部署成功！

### 获取 API 地址

部署成功后，你会看到类似：
```
https://cooktip-api-xxxxx.vercel.app
```

### 测试 API

在浏览器访问：
```
https://你的域名.vercel.app/api/recipes
https://你的域名.vercel.app/api/categories  
https://你的域名.vercel.app/api/search?keyword=番茄
```

如果返回 JSON 数据，说明部署成功！✅

---

## 🔧 配置微信小程序

### 1. 添加服务器域名

登录：https://mp.weixin.qq.com/

路径：开发 → 开发管理 → 开发设置 → 服务器域名

添加：
```
request合法域名：
https://你的域名.vercel.app
https://api.weixin.qq.com
```

### 2. 更新小程序代码

在 `app.js` 中：
```javascript
App({
  globalData: {
    baseURL: 'https://你的域名.vercel.app/api'
  }
});
```

---

## 🎉 完成！

现在你的后端 API 已经：
- ✅ 部署到 Vercel 云端
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 可以被小程序调用

---

## 📊 查看部署状态

**Vercel Dashboard**: https://vercel.com/dashboard

可以查看：
- 部署历史
- 函数日志
- 访问统计
- 错误监控

---

## 🔄 更新代码

以后更新代码只需：
```bash
git add .
git commit -m "更新说明"
git push origin main
```

Vercel 会**自动重新部署**！

---

## ⚠️ 如果部署失败

### 查看错误日志
1. 进入 Vercel Dashboard
2. 点击你的项目
3. 点击 "Deployments"
4. 点击失败的部署
5. 查看 "Function Logs"

### 常见问题
1. **环境变量未配置** → 补充环境变量
2. **数据库连接失败** → 检查数据库信息
3. **代码错误** → 查看错误日志

---

## 📞 需要帮助？

查看详细文档：
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南
- [README.md](./README.md) - API 文档

---

*快速部署指南 - 2025年9月30日*
