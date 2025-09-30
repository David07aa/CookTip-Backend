# 🚀 部署到 GitHub 和 Vercel 完整指南

## 📋 准备工作

### 确认 Git 已安装

打开 **命令提示符（CMD）** 或 **PowerShell**，运行：
```bash
git --version
```

如果显示版本号，说明 Git 已安装。如果提示找不到命令，需要：
1. 重启 Cursor
2. 或重启电脑
3. 或检查 Git 是否已添加到 PATH

---

## 第一部分：部署到 GitHub

### 步骤1：在 GitHub 创建仓库

1. **访问 GitHub**  
   打开：https://github.com/new

2. **创建新仓库**  
   - Repository name: `CookTip-Backend`
   - Description: `一家食谱小程序后端API - Vercel Serverless`
   - 选择 **Public** 或 **Private**
   - **不要**勾选任何初始化选项（README, .gitignore, license）
   - 点击 **"Create repository"**

3. **记录仓库地址**  
   创建后会看到类似：
   ```
   https://github.com/你的用户名/CookTip-Backend.git
   ```

---

### 步骤2：初始化本地仓库

在项目目录 `E:\前端项目文档\项目文件夹\CookTip-Backend` 打开终端：

#### 方法1：使用 Cursor 的终端

在 Cursor 中按 `` Ctrl + ` `` 打开终端，运行：

```bash
# 1. 初始化 Git 仓库
git init

# 2. 添加所有文件
git add .

# 3. 查看状态
git status
```

#### 方法2：使用 Windows 终端

右键项目文件夹 → **"在终端中打开"** → 运行上面的命令

---

### 步骤3：提交代码

```bash
# 1. 提交到本地仓库
git commit -m "feat: 完成21个核心API接口，包含用户、食谱、收藏、点赞、评论等功能"

# 2. 设置主分支名称
git branch -M main
```

---

### 步骤4：关联远程仓库

**替换为你自己的仓库地址：**

```bash
git remote add origin https://github.com/你的用户名/CookTip-Backend.git
```

例如：
```bash
git remote add origin https://github.com/zhangsan/CookTip-Backend.git
```

---

### 步骤5：推送到 GitHub

```bash
git push -u origin main
```

**如果提示需要登录：**
- 输入 GitHub 用户名
- 输入密码（现在需要使用 Personal Access Token，不是账号密码）

**创建 Personal Access Token**：
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成后复制 token
5. 在推送时使用 token 作为密码

---

### ✅ 验证 GitHub 部署

访问：`https://github.com/你的用户名/CookTip-Backend`

应该能看到所有代码文件已上传。

---

## 第二部分：部署到 Vercel

### 步骤1：访问 Vercel

打开：https://vercel.com/

### 步骤2：登录 Vercel

点击 **"Sign Up"** 或 **"Login"**

选择 **"Continue with GitHub"** 使用 GitHub 账号登录

### 步骤3：导入项目

1. 点击 **"Add New..."** → **"Project"**

2. 找到 `CookTip-Backend` 仓库，点击 **"Import"**

3. **配置项目**：
   - Project Name: `cooktip-api` (或其他名称)
   - Framework Preset: **Other** (保持默认)
   - Root Directory: `./` (保持默认)
   - Build Command: (留空)
   - Output Directory: (留空)

### 步骤4：配置环境变量（重要！）

点击 **"Environment Variables"**，逐个添加以下8个变量：

| Name | Value |
|------|-------|
| `DB_HOST` | `mysql3.sqlpub.com` |
| `DB_PORT` | `3308` |
| `DB_NAME` | `onefoodlibrary` |
| `DB_USER` | `david_x` |
| `DB_PASSWORD` | `your-database-password` |
| `WECHAT_APPID` | `wx8486e57500ac0a55` |
| `WECHAT_SECRET` | `你的微信小程序Secret` |
| `JWT_SECRET` | `your_super_secret_jwt_key_2024` |

**重要提示**：
- 每个变量都要选择 **"Production"**, **"Preview"**, **"Development"**（All）
- 点击 **"Add"** 添加每个变量

### 步骤5：开始部署

1. 确认所有环境变量已添加
2. 点击 **"Deploy"** 按钮
3. 等待 1-2 分钟...

---

## ✅ 部署成功！

### 获取 API 地址

部署完成后，Vercel 会显示：
```
https://cooktip-api-xxxx.vercel.app
```

或者类似的域名。

### 测试 API

在浏览器访问以下地址：

1. **测试食谱列表**  
   ```
   https://你的域名.vercel.app/api/recipes
   ```

2. **测试分类**  
   ```
   https://你的域名.vercel.app/api/categories
   ```

3. **测试搜索**  
   ```
   https://你的域名.vercel.app/api/search?keyword=番茄
   ```

如果都返回 JSON 数据，说明**部署成功**！🎉

---

## 第三部分：配置微信小程序

### 步骤1：配置服务器域名

1. 登录 **微信公众平台**  
   https://mp.weixin.qq.com/

2. 进入路径  
   **开发** → **开发管理** → **开发设置** → **服务器域名**

3. 点击 **"修改"**，添加：
   ```
   request合法域名：
   https://你的Vercel域名.vercel.app
   https://api.weixin.qq.com
   ```

4. 保存配置

### 步骤2：更新小程序代码

在小程序项目的 `app.js` 中：

```javascript
App({
  globalData: {
    baseURL: 'https://你的Vercel域名.vercel.app/api'
  }
});
```

### 步骤3：重新编译小程序

在微信开发者工具中点击 **"编译"**

---

## 🎉 完整部署完成！

现在你的项目已经：
- ✅ 代码托管在 GitHub
- ✅ 后端部署在 Vercel
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 微信小程序可以调用

---

## 🔄 后续更新流程

以后修改代码后，只需：

```bash
# 1. 添加修改的文件
git add .

# 2. 提交
git commit -m "更新说明"

# 3. 推送到 GitHub
git push origin main
```

Vercel 会**自动检测并重新部署**！

---

## 📊 项目管理

### GitHub 仓库
访问：`https://github.com/你的用户名/CookTip-Backend`

可以：
- 查看代码历史
- 管理分支
- 查看提交记录

### Vercel Dashboard
访问：`https://vercel.com/dashboard`

可以：
- 查看部署历史
- 查看函数日志
- 查看访问统计
- 管理环境变量
- 查看错误监控

---

## 🐛 常见问题

### 1. Git 推送失败：403 错误

**原因**：GitHub 密码认证已废弃

**解决**：使用 Personal Access Token
1. 访问：https://github.com/settings/tokens
2. 生成新 token（勾选 `repo` 权限）
3. 使用 token 作为密码

### 2. Vercel 部署后 API 返回 500

**原因**：环境变量未配置或配置错误

**解决**：
1. 进入 Vercel Dashboard
2. 点击项目 → Settings → Environment Variables
3. 检查所有8个变量是否正确
4. 重新部署：Deployments → Redeploy

### 3. 微信小程序调用失败

**原因**：服务器域名未配置

**解决**：
1. 检查微信公众平台的服务器域名配置
2. 确保域名以 `https://` 开头
3. 小程序中的 `baseURL` 要正确

### 4. Git 命令找不到

**原因**：Git 未添加到系统 PATH

**解决**：
1. 重启 Cursor 或终端
2. 或重启电脑
3. 或使用 Git Bash 终端

---

## 📝 项目文件说明

| 文件 | 说明 | 是否部署 |
|-----|------|---------|
| `api/*` | API接口文件 | ✅ 是 |
| `lib/*` | 工具库 | ✅ 是 |
| `middleware/*` | 中间件 | ✅ 是 |
| `scripts/*` | 数据库脚本 | ✅ 是 |
| `package.json` | 依赖配置 | ✅ 是 |
| `vercel.json` | Vercel配置 | ✅ 是 |
| `*.md` | 文档文件 | ❌ 否（已忽略）|
| `test-*.js` | 测试文件 | ❌ 否（已忽略）|
| `.env.local` | 本地环境变量 | ❌ 否（已忽略）|

---

## 📞 需要帮助？

### 相关文档
- [README.md](./README.md) - 项目说明
- [API_IMPLEMENTATION.md](./API_IMPLEMENTATION.md) - 接口文档
- [COMPLETION_REPORT.md](./COMPLETION_REPORT.md) - 完成报告

### 在线资源
- **GitHub 文档**：https://docs.github.com/
- **Vercel 文档**：https://vercel.com/docs
- **Git 教程**：https://git-scm.com/book/zh/v2

---

## ✅ 部署检查清单

### GitHub 部署
- [ ] Git 已安装
- [ ] GitHub 账号已创建
- [ ] 仓库已创建
- [ ] 代码已提交
- [ ] 代码已推送
- [ ] GitHub 可以看到代码

### Vercel 部署
- [ ] Vercel 账号已创建
- [ ] 项目已导入
- [ ] 环境变量已配置（8个）
- [ ] 部署成功
- [ ] API 可以访问
- [ ] 返回正确的 JSON 数据

### 微信小程序
- [ ] 服务器域名已配置
- [ ] baseURL 已更新
- [ ] 小程序可以调用 API

---

## 🎯 快速命令参考

```bash
# Git 基础命令
git status          # 查看状态
git add .           # 添加所有文件
git commit -m "msg" # 提交
git push            # 推送

# Git 配置
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 查看远程仓库
git remote -v

# 查看提交历史
git log --oneline
```

---

**祝部署顺利！** 🎉

*部署指南更新时间：2025年9月30日*
