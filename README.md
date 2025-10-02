# 🍳 CookTip Backend - 一家食谱小程序后端

基于 Vercel Serverless Functions 和 Neon PostgreSQL 的微信小程序后端 API。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)

---

## 📊 项目状态

**完成度：100%** 🎉✅

- ✅ Vercel Serverless Functions 部署
- ✅ Neon PostgreSQL 数据库（7张表）
- ✅ GitHub 代码托管（私有仓库）
- ✅ JWT 认证系统
- ✅ API 完全适配 PostgreSQL
- ✅ 导入 198 个老乡鸡官方菜谱

---

## 🌐 在线地址

- **生产 API：** https://cooktip-backend.vercel.app/api
- **健康检查：** https://cooktip-backend.vercel.app/api/recipes?health=check
- **GitHub：** https://github.com/David07aa/CookTip-Backend
- **Vercel：** https://vercel.com/davids-projects-688aeefc/cooktip-backend

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Vercel CLI
- Git

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/David07aa/CookTip-Backend.git
cd CookTip-Backend

# 2. 安装依赖
npm install

# 3. 拉取环境变量
vercel env pull .env.local

# 4. 验证数据库连接
node -r dotenv/config scripts/verify-db.js dotenv_config_path=.env.local

# 5. 本地开发
vercel dev
```

### 📦 部署流程

**重要规则：所有代码更改后，必须提交 GitHub 并部署到 Vercel**

#### 方式一：使用一键部署脚本（推荐）

```powershell
.\deploy.ps1 "你的提交信息"
```

#### 方式二：手动部署

```bash
# 1. 提交到 GitHub
git add -A
git commit -m "你的提交信息"
git push origin main

# 2. 部署到 Vercel
vercel --prod --token <YOUR_TOKEN> --yes
```

详细部署规则请查看：[部署规则.md](./部署规则.md)

---

## 🍗 数据内容

### 老乡鸡官方菜谱（198个）

**来源**: [CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC) - 老乡鸡菜品溯源报告

| 分类 | 数量 | 代表菜品 |
|------|------|---------|
| 🥘 炒菜 | 49 | 西红柿炒鸡蛋、宫保鸡丁、鱼香肉丝 |
| 🍲 蒸菜 | 29 | 梅菜扣肉、粉蒸肉、白切鸡 |
| 🥐 早餐 | 21 | 包子、油条、豆浆、小米南瓜粥 |
| 🍜 主食 | 17 | 肥西老母鸡汤面、番茄鸡蛋面 |
| 🍗 炸物 | 12 | 炸鸡腿、炸鸡排、香酥鸡米花 |
| 🫕 砂锅 | 11 | 砂锅酸菜鱼、砂锅盐焗鸡 |
| 🔥 烫菜 | 9 | 特色热干面、鸡汤娃娃菜 |
| 🍛 炖菜 | 7 | 麻婆豆腐、土豆牛腩 |
| 其他 | 43 | 汤羹、卤味、凉菜、饮品等 |

**特点**:
- ✅ 权威配方：来自老乡鸡官方菜品溯源报告
- ✅ 精确用量：克数级别的精准配方
- ✅ 详细步骤：专业的制作流程说明
- ✅ 分类齐全：15个分类覆盖全场景

**导入脚本**: `npm run import:lxj`

---

## 📁 项目结构

```
CookTip-Backend/
├── api/                      # Serverless Functions
│   ├── auth/                 # 认证相关
│   ├── recipes/              # 食谱相关
│   ├── user/                 # 用户相关
│   ├── comments/             # 评论相关
│   ├── likes/                # 点赞相关
│   ├── favorites/            # 收藏相关
│   ├── categories/           # 分类相关
│   └── search/               # 搜索相关
├── lib/                      # 核心库
│   ├── db.js                 # 数据库连接
│   ├── auth.js               # JWT 认证
│   └── response.js           # 响应工具
├── middleware/               # 中间件
│   └── auth.js               # 认证中间件
├── scripts/                  # 脚本工具
│   ├── schema-postgres.sql   # 数据库结构
│   ├── init-db-postgres.js   # 初始化脚本
│   └── verify-db.js          # 验证脚本
├── 项目当前状态.md           # 详细状态说明
├── 下一步工作清单.md         # 待办清单
└── API接口文档.md            # 接口文档
```

---

## 🗄️ 数据库

### 技术栈
- **数据库：** Neon PostgreSQL 17.5
- **连接：** @vercel/postgres SDK
- **特性：** UUID主键、JSONB字段、自动时间戳

### 数据表（7张）

| 表名 | 说明 | 字段数 |
|------|------|--------|
| `users` | 用户表 | 12 |
| `recipes` | 食谱表 | 24 |
| `comments` | 评论表 | 8 |
| `favorites` | 收藏表 | 4 |
| `likes` | 点赞表 | 4 |
| `shopping_lists` | 购物清单表 | 8 |
| `follows` | 关注表 | 4 |

### 验证数据库

```bash
npm run verify-db
# 或
node -r dotenv/config scripts/verify-db.js dotenv_config_path=.env.local
```

---

## 🔌 API 端点

### 认证
- `POST /api/auth/login` - 微信登录

### 用户
- `GET /api/user/info` - 获取当前用户信息
- `PUT /api/user/info` - 更新用户信息
- `GET /api/user/recipes` - 获取用户食谱
- `GET /api/users/:id` - 获取用户详情

### 食谱
- `GET /api/recipes` - 食谱列表（支持分页、筛选、排序）
- `POST /api/recipes` - 创建食谱
- `GET /api/recipes/:id` - 食谱详情
- `PUT /api/recipes/:id` - 更新食谱
- `DELETE /api/recipes/:id` - 删除食谱

### 分类和搜索
- `GET /api/categories` - 分类列表
- `GET /api/search` - 搜索食谱

### 互动
- `GET /api/comments` - 评论列表
- `POST /api/comments` - 发表评论
- `DELETE /api/comments/:id` - 删除评论
- `GET /api/likes` - 检查点赞状态
- `POST /api/likes` - 点赞
- `DELETE /api/likes` - 取消点赞
- `GET /api/favorites` - 收藏列表
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites` - 取消收藏

**详细接口文档：** 查看 `API接口文档.md`

---

## 🔐 环境变量

在 Vercel 项目中配置以下环境变量：

```env
# 数据库（Vercel 自动注入）
POSTGRES_URL=
POSTGRES_PRISMA_URL=

# JWT
JWT_SECRET=your_jwt_secret

# 微信小程序
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret
```

---

## 🧪 测试

### 健康检查

```bash
curl https://cooktip-backend.vercel.app/api/recipes?health=check
```

期望响应：
```json
{
  "connection": "connected",
  "success": true,
  "postgresVersion": "PostgreSQL 17.5"
}
```

---

## 📝 开发指南

### 当前任务

项目已完成 95%，剩余任务：

1. **更新 API 代码** - 将 12 个 API 从 MySQL 语法更新为 PostgreSQL 语法
   - 详细指南：查看 `下一步工作清单.md`
   - 预计时间：2-3 小时

2. **测试验证** - 测试所有 API 端点
   - 测试清单：查看 `下一步工作清单.md`

### 代码规范

```javascript
// PostgreSQL 查询示例
const { sql } = require('@vercel/postgres');

// 插入数据
const result = await sql`
  INSERT INTO users (openid, nick_name)
  VALUES (${openid}, ${nickName})
  RETURNING id, openid, nick_name
`;
const user = result.rows[0];

// 查询数据
const result = await sql`
  SELECT * FROM recipes 
  WHERE category = ${category}
  LIMIT ${limit}
`;
const recipes = result.rows;
```

---

## 📚 文档

- **项目当前状态：** `项目当前状态.md` - 详细的完成度和技术说明
- **待办清单：** `下一步工作清单.md` - 详细的 API 更新指南
- **接口文档：** `API接口文档.md` - 完整的 API 设计规范

---

## 🛠️ 技术栈

- **运行时：** Node.js 22.x
- **框架：** Vercel Serverless Functions
- **数据库：** Neon PostgreSQL 17.5
- **认证：** JWT + 微信登录
- **部署：** Vercel + GitHub

### 依赖

```json
{
  "@vercel/postgres": "^0.10.0",
  "jsonwebtoken": "^9.0.2",
  "axios": "^1.6.2",
  "cors": "^2.8.5",
  "dotenv": "^1.0.0"
}
```

---

## 📄 License

MIT

---

## 👥 作者

**CookTip Team**

- GitHub: [@David07aa](https://github.com/David07aa)

---

**项目进展顺利！只差最后 5% 了！** 🎉