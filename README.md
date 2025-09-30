# 🍳 一家食谱 - Vercel Serverless 后端 API

> 基于 Vercel Serverless Functions + SQLPub MySQL 的完整后端解决方案

## 📋 项目信息

- **项目名称**：一家食谱小程序后端 API
- **技术栈**：Node.js + Vercel Serverless + MySQL
- **数据库**：SQLPub MySQL
- **认证方式**：JWT + 微信小程序登录
- **部署平台**：Vercel

## 🚀 快速开始

### 1. 安装依赖

确保已安装 Node.js (v18+)，然后运行：

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 并重命名为 `.env.local`，填入实际配置：

```env
# SQLPub MySQL 数据库配置
DB_HOST=mysql3.sqlpub.com
DB_PORT=3308
DB_NAME=onefoodlibrary
DB_USER=david_x
DB_PASSWORD=your-database-password

# 微信小程序配置
WECHAT_APPID=wx8486e57500ac0a55
WECHAT_SECRET=your_wechat_secret_here

# JWT密钥
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 3. 初始化数据库

运行数据库初始化脚本（会清空所有表并重新创建）：

```bash
npm run db:init
```

### 4. 本地开发

```bash
# 使用 Vercel CLI 本地开发
npm run dev

# 或者安装 Vercel CLI
npm install -g vercel
vercel dev
```

访问：http://localhost:3000

## 📁 项目结构

```
cooktip-api/
├── api/                          # Vercel Serverless Functions
│   ├── auth/
│   │   └── login.js             # 微信登录
│   ├── recipes/
│   │   ├── index.js             # 获取食谱列表
│   │   ├── [id].js              # 食谱详情
│   │   └── create.js            # 创建食谱
│   ├── users/
│   │   └── [id].js              # 用户信息
│   ├── comments/
│   │   └── index.js             # 评论
│   ├── favorites/
│   │   └── index.js             # 收藏
│   └── likes/
│       └── index.js             # 点赞
│
├── lib/                          # 工具库
│   ├── db.js                    # 数据库连接
│   ├── auth.js                  # 认证工具
│   └── wechat.js                # 微信API
│
├── middleware/                   # 中间件
│   └── auth.js                  # 认证中间件
│
├── scripts/                      # 脚本
│   ├── init-db.js               # 数据库初始化
│   └── schema.sql               # 数据库表结构
│
├── .env.example                 # 环境变量示例
├── .gitignore
├── package.json
├── vercel.json                  # Vercel配置
└── README.md
```

## 🔌 API 接口文档

### 基础信息

- **Base URL（本地）**：`http://localhost:3000/api`
- **Base URL（生产）**：`https://your-project.vercel.app/api`
- **认证方式**：Bearer Token（JWT）

### 认证相关

#### 1. 微信登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "code": "微信小程序登录code",
  "nickName": "用户昵称（可选）",
  "avatar": "头像URL（可选）"
}
```

**响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "nickName": "用户昵称",
      "avatar": "头像URL",
      "isVip": false
    }
  }
}
```

### 食谱相关

#### 2. 获取食谱列表
```http
GET /api/recipes?page=1&limit=10&category=中餐&difficulty=简单&sort=-created_at
```

**参数：**
- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）
- `category`: 分类筛选（可选）
- `difficulty`: 难度筛选（可选）
- `taste`: 口味筛选（可选）
- `keyword`: 关键词搜索（可选）
- `sort`: 排序字段（默认-created_at，加-表示降序）

#### 3. 获取食谱详情
```http
GET /api/recipes/[id]
```

#### 4. 创建食谱（需要登录）
```http
POST /api/recipes/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "食谱标题",
  "coverImage": "封面图片URL",
  "introduction": "食谱简介",
  "cookTime": 30,
  "difficulty": "简单",
  "servings": 2,
  "taste": "香辣",
  "category": "中餐",
  "tags": ["家常菜", "快手菜"],
  "ingredients": [
    { "name": "鸡蛋", "amount": "2个" }
  ],
  "steps": [
    { "step": 1, "description": "步骤描述", "image": "图片URL" }
  ],
  "tips": "小贴士",
  "nutrition": {
    "calories": "300kcal"
  }
}
```

### 收藏相关

#### 5. 获取收藏列表（需要登录）
```http
GET /api/favorites?page=1&limit=10
Authorization: Bearer {token}
```

#### 6. 添加收藏（需要登录）
```http
POST /api/favorites
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipeId": "食谱ID"
}
```

#### 7. 取消收藏（需要登录）
```http
DELETE /api/favorites?recipeId={recipeId}
Authorization: Bearer {token}
```

### 点赞相关

#### 8. 点赞食谱（需要登录）
```http
POST /api/likes
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipeId": "食谱ID"
}
```

#### 9. 取消点赞（需要登录）
```http
DELETE /api/likes?recipeId={recipeId}
Authorization: Bearer {token}
```

#### 10. 检查是否已点赞（需要登录）
```http
GET /api/likes/check?recipeId={recipeId}
Authorization: Bearer {token}
```

### 评论相关

#### 11. 获取评论列表
```http
GET /api/comments?recipeId={recipeId}&page=1&limit=20
```

#### 12. 发表评论（需要登录）
```http
POST /api/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipeId": "食谱ID",
  "content": "评论内容",
  "images": ["图片URL"],
  "replyTo": "回复的评论ID（可选）"
}
```

### 用户相关

#### 13. 获取用户信息
```http
GET /api/users/[id]
```

## 🗄️ 数据库表结构

### 核心表

1. **users** - 用户表
2. **recipes** - 食谱表
3. **comments** - 评论表
4. **favorites** - 收藏表
5. **likes** - 点赞表
6. **shopping_lists** - 购物清单表
7. **follows** - 关注表

详细表结构请参考 `scripts/schema.sql`

## 🚀 部署到 Vercel

### 方法1：通过 GitHub（推荐）

1. 推送代码到 GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/cooktip-api.git
git push -u origin main
```

2. 访问 [Vercel Dashboard](https://vercel.com/)
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. 配置环境变量（与 .env.local 相同）
6. 点击 "Deploy"

### 方法2：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 环境变量配置

在 Vercel Dashboard 的 Settings → Environment Variables 中添加：

```
DB_HOST=mysql3.sqlpub.com
DB_PORT=3308
DB_NAME=onefoodlibrary
DB_USER=david_x
DB_PASSWORD=your-database-password
WECHAT_APPID=wx8486e57500ac0a55
WECHAT_SECRET=your_wechat_secret
JWT_SECRET=your_jwt_secret
```

## 📱 小程序端对接

### 配置API地址

在小程序的 `app.js` 中配置：

```javascript
App({
  globalData: {
    baseURL: 'https://your-project.vercel.app/api'
  }
});
```

### 配置服务器域名

在微信公众平台配置：

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 开发 → 开发管理 → 开发设置 → 服务器域名
3. 添加 `https://your-project.vercel.app`

## 🔧 常见问题

### 1. 数据库连接失败

检查：
- 数据库地址、端口是否正确
- 用户名密码是否正确
- 防火墙是否允许连接

### 2. Vercel 函数超时

Vercel 免费版函数执行时间限制为 10 秒，优化建议：
- 使用数据库索引
- 减少不必要的查询
- 考虑升级到 Pro 版本（60秒）

### 3. CORS 跨域问题

已在所有 API 中配置 CORS 头，如仍有问题，检查：
- 请求方法是否支持
- Authorization 头是否正确

## 📊 性能优化建议

1. **数据库索引**：已在关键字段创建索引
2. **查询优化**：避免 N+1 查询，使用 JOIN
3. **缓存**：可考虑使用 Upstash Redis 缓存热点数据
4. **图片优化**：使用 CDN 和图片压缩服务

## 📝 开发规范

- 所有 API 返回格式统一：`{ success: boolean, data?: any, error?: string, message?: string }`
- 使用 HTTP 状态码表示请求结果
- 敏感操作需要认证
- 参数验证要完整
- 错误信息要友好

## 📄 许可证

MIT License

## 👨‍💻 作者

一家食谱团队

---

**需要帮助？** 请查看 [部署文档](./Vercel后端部署方案.md) 或提交 Issue。
