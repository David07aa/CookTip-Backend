# 🚀 部署指南

## 前置要求

✅ Node.js 18+ 已安装  
✅ 拥有 Vercel 账号  
✅ 拥有 SQLPub MySQL 数据库  
✅ 拥有微信小程序 AppID 和 AppSecret  

---

## 步骤 1：初始化数据库

### 1.1 确认数据库连接信息

```
数据库地址: mysql3.sqlpub.com:3308
数据库名称: onefoodlibrary
用户名: david_x
密码: NVRvnX3rP88UyUET
```

### 1.2 安装依赖

```bash
npm install
```

### 1.3 运行初始化脚本

```bash
npm run db:init
```

**输出示例：**
```
============================================================
🚀 一家食谱 - 数据库初始化脚本
============================================================

🔄 正在连接数据库...
✅ 数据库连接成功！

🗑️  正在清除表...
   ✓ 已删除表: users
   ✓ 已删除表: recipes
   ...

📝 正在创建数据表...
   ✓ 已创建表: users
   ✓ 已创建表: recipes
   ✓ 已创建表: comments
   ✓ 已创建表: favorites
   ✓ 已创建表: likes
   ✓ 已创建表: shopping_lists
   ✓ 已创建表: follows

✅ 数据库初始化成功！
```

---

## 步骤 2：本地测试

### 2.1 配置环境变量

确保 `.env.example` 文件存在，内容如下：

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

### 2.2 启动本地开发服务器

```bash
# 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 启动开发服务器
vercel dev
```

### 2.3 测试 API

访问 http://localhost:3000/api/recipes

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

## 步骤 3：部署到 Vercel

### 方法 A：通过 GitHub（推荐）

#### 3.1 推送代码到 GitHub

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: CookTip Backend API"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/cooktip-api.git

# 推送到 GitHub
git push -u origin main
```

#### 3.2 导入到 Vercel

1. 访问 https://vercel.com/
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 选择你的 GitHub 仓库
5. 点击 "Import"

#### 3.3 配置环境变量

在 Vercel 项目设置中：

1. 进入 "Settings" → "Environment Variables"
2. 添加以下变量（对应 .env.example 的内容）：

| 变量名 | 值 |
|-------|-----|
| `DB_HOST` | `mysql3.sqlpub.com` |
| `DB_PORT` | `3308` |
| `DB_NAME` | `onefoodlibrary` |
| `DB_USER` | `david_x` |
| `DB_PASSWORD` | `NVRvnX3rP88UyUET` |
| `WECHAT_APPID` | `wx8486e57500ac0a55` |
| `WECHAT_SECRET` | `你的微信小程序密钥` |
| `JWT_SECRET` | `一个强随机字符串` |

**注意：** 所有环境变量都要选择 "All Environments"

#### 3.4 重新部署

配置完环境变量后，点击 "Deployments" → 最新部署旁边的三个点 → "Redeploy"

---

### 方法 B：使用 Vercel CLI

```bash
# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

按照提示操作，然后在 Vercel Dashboard 配置环境变量。

---

## 步骤 4：验证部署

### 4.1 获取部署URL

部署成功后，Vercel 会提供一个 URL，例如：
```
https://cooktip-api.vercel.app
```

### 4.2 测试 API

访问：
```
https://cooktip-api.vercel.app/api/recipes
```

应该返回食谱列表（即使是空的）

### 4.3 测试数据库连接

可以尝试创建一个测试用户（需要通过微信登录接口）

---

## 步骤 5：配置微信小程序

### 5.1 添加服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入 "开发" → "开发管理" → "开发设置"
3. 在 "服务器域名" 中点击 "修改"
4. 添加你的 Vercel 域名：

```
request合法域名：
https://cooktip-api.vercel.app
https://api.weixin.qq.com
```

### 5.2 修改小程序配置

在小程序的 `app.js` 中：

```javascript
App({
  globalData: {
    baseURL: 'https://cooktip-api.vercel.app/api'
  }
});
```

---

## 步骤 6：插入测试数据（可选）

可以手动插入一些测试数据，或者等待用户通过小程序创建。

### 手动插入测试用户

```sql
INSERT INTO users (id, openid, nick_name, avatar, bio, created_at, updated_at) 
VALUES (
  UUID(), 
  'test_openid_123', 
  '测试用户', 
  'https://i.pravatar.cc/300', 
  '这是一个测试用户',
  NOW(), 
  NOW()
);
```

### 手动插入测试食谱

```sql
INSERT INTO recipes (
  id, title, cover_image, introduction, author_id, 
  cook_time, difficulty, servings, category, 
  ingredients, steps, status, created_at, updated_at
) VALUES (
  UUID(),
  '番茄炒蛋',
  'https://picsum.photos/800/600',
  '经典家常菜，简单易做，营养丰富',
  (SELECT id FROM users LIMIT 1),
  15,
  '简单',
  2,
  '中餐',
  '[{"name":"鸡蛋","amount":"3个"},{"name":"番茄","amount":"2个"}]',
  '[{"step":1,"description":"打散鸡蛋","image":""},{"step":2,"description":"番茄切块","image":""}]',
  'published',
  NOW(),
  NOW()
);
```

---

## 步骤 7：监控和维护

### 7.1 查看日志

Vercel Dashboard → 你的项目 → "Deployments" → 点击最新部署 → "Functions"

### 7.2 性能监控

查看函数执行时间、错误率等指标

### 7.3 数据库备份

定期备份 SQLPub 数据库数据

---

## 🎉 完成！

现在你的后端 API 已经成功部署到 Vercel，可以：

✅ 微信小程序可以调用 API  
✅ 数据持久化到 MySQL  
✅ 自动 HTTPS 加密  
✅ 全球 CDN 加速  
✅ 自动扩容  

---

## 🔧 故障排除

### 问题 1：Vercel 部署失败

**检查：**
- package.json 的 dependencies 是否完整
- vercel.json 配置是否正确
- 环境变量是否都已配置

### 问题 2：API 返回 500 错误

**检查：**
- Vercel 日志中的错误信息
- 数据库连接是否正常
- 环境变量是否正确配置

### 问题 3：微信登录失败

**检查：**
- WECHAT_APPID 和 WECHAT_SECRET 是否正确
- 微信小程序服务器域名是否已配置
- code 是否有效（5分钟过期）

### 问题 4：数据库连接超时

**检查：**
- SQLPub 数据库是否在线
- 防火墙规则是否正确
- 连接池配置是否合理

---

## 📞 获取帮助

- 查看 [README.md](./README.md)
- 查看 [Vercel 文档](https://vercel.com/docs)
- 查看 [部署方案文档](./Vercel后端部署方案.md)
