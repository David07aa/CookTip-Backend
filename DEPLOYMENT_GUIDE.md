# 🚀 Vercel 部署指南

## 方法1：通过 Vercel 网站部署（推荐）⭐

这是最简单的方法，避免命令行字符编码问题。

### 步骤1：准备 GitHub 仓库

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "feat: 完成所有核心API接口，ready for production"

# 4. 创建 GitHub 仓库后，添加远程地址
git remote add origin https://github.com/你的用户名/cooktip-backend.git

# 5. 推送到 GitHub
git push -u origin main
```

### 步骤2：在 Vercel 导入项目

1. **访问 Vercel**  
   打开 https://vercel.com/

2. **登录账号**  
   使用 GitHub 账号登录

3. **导入项目**  
   - 点击 "Add New..." → "Project"
   - 选择 "Import Git Repository"
   - 找到你的 `cooktip-backend` 仓库
   - 点击 "Import"

4. **配置项目**  
   - Project Name: `cooktip-api` （或其他名称）
   - Framework Preset: `Other` （保持默认）
   - Root Directory: `./` （保持默认）

5. **配置环境变量（重要！）**  
   点击 "Environment Variables"，添加以下变量：

   ```
   DB_HOST=mysql3.sqlpub.com
   DB_PORT=3308
   DB_NAME=onefoodlibrary
   DB_USER=david_x
   DB_PASSWORD=your-database-password
   WECHAT_APPID=wx8486e57500ac0a55
   WECHAT_SECRET=你的微信小程序密钥
   JWT_SECRET=your_super_secret_jwt_key_2024
   ```

   **注意**：每个变量都要选择 **"All Environments"**！

6. **部署**  
   点击 "Deploy" 按钮

7. **等待部署完成**  
   大约需要 1-2 分钟

---

## 方法2：通过命令行部署（备选）

如果上面的方法遇到字符编码问题，可以尝试：

### 选项 A：使用浏览器登录

```bash
# 这会打开浏览器进行登录
vercel login --github
```

### 选项 B：直接部署（会自动引导登录）

```bash
# 直接运行部署命令
vercel
```

按照提示操作：
1. 登录 Vercel（通过浏览器）
2. Set up and deploy: **Y**
3. Which scope: 选择你的账号
4. Link to existing project: **N**
5. What's your project's name: `cooktip-api`
6. In which directory: `./`
7. Want to override the settings: **N**

---

## 方法3：手动配置（最可靠）

### 步骤1：创建 Vercel 项目配置

在项目根目录创建 `.vercel` 目录（如果不存在）

### 步骤2：上传到 GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 步骤3：在 Vercel 网站手动创建

1. 访问 https://vercel.com/new
2. 选择 GitHub 仓库
3. 配置环境变量
4. 点击 Deploy

---

## 📝 环境变量配置清单

**必需的环境变量**：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DB_HOST` | `mysql3.sqlpub.com` | 数据库地址 |
| `DB_PORT` | `3308` | 数据库端口 |
| `DB_NAME` | `onefoodlibrary` | 数据库名称 |
| `DB_USER` | `david_x` | 数据库用户 |
| `DB_PASSWORD` | `NVRvnX3rP88UyUET` | 数据库密码 |
| `WECHAT_APPID` | `wx8486e57500ac0a55` | 微信AppID |
| `WECHAT_SECRET` | `你的密钥` | 微信Secret |
| `JWT_SECRET` | `随机字符串` | JWT密钥 |

**重要**：所有变量都选择 **Production**, **Preview**, **Development**（All Environments）

---

## ✅ 部署后验证

### 1. 获取部署URL

部署成功后，Vercel 会提供一个 URL，例如：
```
https://cooktip-api.vercel.app
```

### 2. 测试 API

在浏览器访问：
```
https://cooktip-api.vercel.app/api/recipes
https://cooktip-api.vercel.app/api/categories
```

应该返回 JSON 数据。

### 3. 测试数据库连接

```
https://cooktip-api.vercel.app/api/search?keyword=番茄
```

如果返回搜索结果，说明数据库连接正常。

---

## 🔧 配置微信小程序

### 步骤1：添加服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 开发 → 开发管理 → 开发设置 → 服务器域名
3. 点击"修改"，添加：

```
request合法域名：
https://cooktip-api.vercel.app
https://api.weixin.qq.com
```

### 步骤2：更新小程序配置

在小程序的 `app.js` 中：

```javascript
App({
  globalData: {
    baseURL: 'https://cooktip-api.vercel.app/api'
  }
});
```

---

## 🐛 常见问题

### 问题1：部署失败

**检查**：
- package.json 是否正确
- vercel.json 配置是否正确
- 环境变量是否都已配置

**解决**：
查看 Vercel 部署日志，找到具体错误信息

### 问题2：API 返回 500 错误

**检查**：
- 环境变量是否全部配置
- 数据库连接信息是否正确
- 查看 Vercel 函数日志

**解决**：
1. 进入 Vercel Dashboard
2. 点击项目 → Deployments → 最新部署
3. 点击 "Functions" 标签查看日志

### 问题3：数据库连接失败

**检查**：
- DB_HOST, DB_PORT, DB_NAME 是否正确
- DB_USER, DB_PASSWORD 是否正确
- SQLPub 数据库是否在线

**解决**：
在 Vercel 函数日志中查看具体错误信息

### 问题4：CORS 跨域错误

**检查**：
所有 API 文件都应该包含：
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

**解决**：
已在所有接口中配置，如仍有问题，检查浏览器控制台错误。

---

## 📊 部署检查清单

### 部署前

- [ ] 代码已提交到 Git
- [ ] package.json 依赖完整
- [ ] vercel.json 配置正确
- [ ] 环境变量准备好

### 部署中

- [ ] Vercel 账号已登录
- [ ] 项目已导入
- [ ] 环境变量已配置
- [ ] 选择了 All Environments
- [ ] 点击 Deploy

### 部署后

- [ ] 获取部署 URL
- [ ] 测试 API 接口
- [ ] 测试数据库连接
- [ ] 配置微信小程序域名
- [ ] 更新小程序 API 地址

---

## 🚀 自动部署

### 配置 GitHub 自动部署

Vercel 会自动监听 GitHub 仓库的变化：

1. **自动部署**  
   - 推送到 main 分支 → 自动部署到生产环境
   - 推送到其他分支 → 自动部署到预览环境

2. **手动触发**  
   - 在 Vercel Dashboard 点击 "Redeploy"

---

## 💡 优化建议

### 1. 自定义域名（可选）

在 Vercel Dashboard：
1. 进入项目设置
2. Domains → Add Domain
3. 添加你的域名（如 api.yourdomain.com）
4. 按照提示配置 DNS

### 2. 查看分析数据

Vercel Dashboard → Analytics：
- 查看访问量
- 函数执行时间
- 错误率统计

### 3. 设置告警

Settings → Notifications：
- 部署失败通知
- 错误率告警

---

## 📞 需要帮助？

- **Vercel 文档**：https://vercel.com/docs
- **支持论坛**：https://github.com/vercel/vercel/discussions
- **项目文档**：查看本项目的其他文档

---

## ✅ 部署成功标志

当你看到：
1. ✅ Vercel 显示 "Ready"
2. ✅ 访问 API 返回 JSON 数据
3. ✅ 搜索接口返回结果
4. ✅ 微信小程序可以调用

**恭喜！部署成功！** 🎉

---

*部署指南更新时间：2025年9月30日*  
*适用版本：Vercel CLI 48.x*  
*项目状态：Ready for Production* ✅
