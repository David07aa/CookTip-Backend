# 🚀 一家食谱 - Vercel Serverless 后端部署方案

> 使用 Vercel Serverless Functions + 外部数据库的完整解决方案

## 📅 文档版本
- **创建日期**：2025年9月30日
- **部署平台**：Vercel
- **数据库**：外部数据库（SQLPub / Supabase / PlanetScale）
- **适用项目**：一家食谱微信小程序

---

## 🎯 方案架构

### 整体架构图

```
┌─────────────────────────────────────┐
│      微信小程序（前端）              │
│      AppID: wx8486e57500ac0a55      │
└──────────────┬──────────────────────┘
               │ HTTPS API
               ↓
┌─────────────────────────────────────┐
│       Vercel（Serverless 后端）      │
│  ├─ API Routes (Serverless Functions)│
│  ├─ 自动HTTPS                        │
│  ├─ 全球CDN加速                      │
│  └─ 自动扩容                         │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│      外部数据库服务                  │
│  ├─ SQLPub / Supabase / PlanetScale │
│  ├─ PostgreSQL / MySQL               │
│  └─ 自动备份                         │
└─────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│      云存储服务（图片）              │
│  ├─ Cloudinary（推荐）               │
│  └─ 或 Vercel Blob Storage          │
└─────────────────────────────────────┘
```

---

## ✨ Vercel 方案优势

### 为什么选择 Vercel？

1. ✅ **零服务器运维** - 完全 Serverless，无需管理服务器
2. ✅ **免费额度充足** - 个人项目完全够用
3. ✅ **自动HTTPS** - 自动配置SSL证书
4. ✅ **全球CDN** - 自动边缘节点部署，访问速度快
5. ✅ **Git集成** - 推送代码自动部署
6. ✅ **环境变量** - 安全管理敏感信息
7. ✅ **零配置部署** - 几分钟完成部署

### 费用对比

| 项目 | Vercel免费版 | 传统云服务器 |
|-----|------------|------------|
| **服务器** | ￥0 | ￥60-200/月 |
| **带宽** | 100GB/月免费 | 按流量计费 |
| **函数调用** | 100万次/月 | 无限制 |
| **部署** | 无限次 | 需手动部署 |
| **SSL证书** | 免费自动 | 需手动配置 |
| **总成本** | **￥0-20/月** | **￥150-500/月** |

---

## 🗄️ 数据库选择

### 推荐方案对比

| 数据库服务 | 类型 | 免费额度 | 推荐度 | 特点 |
|-----------|------|---------|--------|------|
| **Supabase** | PostgreSQL | 500MB + 50K 行 | ⭐⭐⭐⭐⭐ | 开源、功能强大、自带后台 |
| **PlanetScale** | MySQL | 5GB | ⭐⭐⭐⭐⭐ | 无服务器MySQL，性能好 |
| **Railway** | PostgreSQL/MySQL | 500小时运行时间 | ⭐⭐⭐⭐ | 简单易用 |
| **Neon** | PostgreSQL | 0.5GB | ⭐⭐⭐⭐ | Serverless PostgreSQL |
| **SQLPub** | PostgreSQL/MySQL | 根据套餐 | ⭐⭐⭐ | 国内服务，速度快 |

### 🏆 推荐：Supabase（最佳选择）

**为什么推荐 Supabase？**

1. ✅ **免费额度充足** - 500MB数据库 + 1GB文件存储
2. ✅ **功能完整** - 数据库 + 存储 + 认证 + 实时订阅
3. ✅ **自带后台** - 可视化管理界面
4. ✅ **RESTful API** - 自动生成API
5. ✅ **行级安全** - 内置权限系统
6. ✅ **开源** - 可自己部署

**官网**：https://supabase.com/

---

## 🏗️ Vercel 项目结构

```
cooktip-api/
├── api/                     # Vercel Serverless Functions
│   ├── auth/
│   │   └── login.js         # 微信登录
│   ├── recipes/
│   │   ├── index.js         # 获取食谱列表
│   │   ├── [id].js          # 食谱详情
│   │   └── create.js        # 创建食谱
│   ├── users/
│   │   └── [id].js          # 用户信息
│   ├── comments/
│   │   └── index.js         # 评论
│   ├── favorites/
│   │   └── index.js         # 收藏
│   └── upload/
│       └── image.js         # 图片上传
│
├── lib/                     # 工具库
│   ├── db.js                # 数据库连接
│   ├── auth.js              # 认证工具
│   ├── storage.js           # 存储工具
│   └── wechat.js            # 微信API
│
├── middleware/              # 中间件
│   └── auth.js              # 认证中间件
│
├── .env.local               # 本地环境变量
├── .env.production          # 生产环境变量
├── package.json
├── vercel.json              # Vercel配置
└── README.md
```

---

## 📝 完整实施步骤

### 第1步：创建 Vercel 项目

```bash
# 1. 创建项目目录
mkdir cooktip-api
cd cooktip-api

# 2. 初始化项目
npm init -y

# 3. 安装依赖
npm install @supabase/supabase-js
npm install jsonwebtoken
npm install axios
npm install cors

# 4. 安装 Vercel CLI
npm install -g vercel

# 5. 登录 Vercel
vercel login
```

### 第2步：配置 Supabase 数据库

#### 2.1 注册并创建项目
1. 访问 https://supabase.com/
2. 创建账号并新建项目
3. 记录以下信息：
   - Project URL: `https://xxxxx.supabase.co`
   - API Key (anon, public): `eyJhbGc...`
   - API Key (service_role, secret): `eyJhbGc...`

#### 2.2 创建数据表

在 Supabase Dashboard 的 SQL Editor 中运行：

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  openid VARCHAR(100) UNIQUE NOT NULL,
  nick_name VARCHAR(100),
  avatar TEXT,
  bio TEXT,
  is_vip BOOLEAN DEFAULT false,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  recipe_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 食谱表
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  cover_image TEXT NOT NULL,
  introduction TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  cook_time INTEGER NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  servings INTEGER NOT NULL,
  taste VARCHAR(50),
  category VARCHAR(50) NOT NULL,
  tags TEXT[],
  ingredients JSONB NOT NULL,
  steps JSONB NOT NULL,
  tips TEXT,
  nutrition JSONB,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  collects INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  images TEXT[],
  likes INTEGER DEFAULT 0,
  reply_to UUID REFERENCES comments(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 收藏表
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- 点赞表
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- 购物清单表
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  items JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 关注表
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 创建索引
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_author ON recipes(author_id);
CREATE INDEX idx_recipes_created ON recipes(created_at DESC);
CREATE INDEX idx_comments_recipe ON comments(recipe_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_recipe ON favorites(recipe_id);
```

### 第3步：创建 Vercel API

#### `vercel.json`（Vercel 配置）
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_KEY": "@supabase-key",
    "WECHAT_APPID": "@wechat-appid",
    "WECHAT_SECRET": "@wechat-secret",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

#### `lib/db.js`（数据库连接）
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
```

#### `lib/auth.js`（认证工具）
```javascript
const jwt = require('jsonwebtoken');

// 生成JWT Token
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 验证JWT Token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 从请求中获取用户ID
function getUserFromRequest(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  const decoded = verifyToken(token);
  return decoded ? decoded.id : null;
}

module.exports = {
  generateToken,
  verifyToken,
  getUserFromRequest
};
```

#### `middleware/auth.js`（认证中间件）
```javascript
const { getUserFromRequest } = require('../lib/auth');
const supabase = require('../lib/db');

async function requireAuth(req, res) {
  const userId = getUserFromRequest(req);
  
  if (!userId) {
    return res.status(401).json({
      error: '未授权',
      message: '请先登录'
    });
  }
  
  // 查询用户信息
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !user) {
    return res.status(401).json({
      error: '用户不存在'
    });
  }
  
  req.user = user;
  return null; // 认证成功
}

module.exports = { requireAuth };
```

#### `api/auth/login.js`（微信登录）
```javascript
const axios = require('axios');
const supabase = require('../../lib/db');
const { generateToken } = require('../../lib/auth');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST请求' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: '缺少code参数' });
    }

    // 1. 调用微信API获取openid
    const wxResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = wxResponse.data;

    if (errcode) {
      return res.status(400).json({
        error: '微信登录失败',
        message: errmsg
      });
    }

    // 2. 查找或创建用户
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('openid', openid)
      .single();

    if (error || !user) {
      // 创建新用户
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          openid,
          nick_name: '美食爱好者',
          avatar: 'https://i.pravatar.cc/300'
        }])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ error: '创建用户失败' });
      }

      user = newUser;
    }

    // 3. 生成JWT token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        nickName: user.nick_name,
        avatar: user.avatar,
        isVip: user.is_vip
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      error: '服务器错误',
      message: error.message
    });
  }
};
```

#### `api/recipes/index.js`（获取食谱列表）
```javascript
const supabase = require('../../lib/db');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      sort = 'created_at'
    } = req.query;

    let query = supabase
      .from('recipes')
      .select(`
        *,
        author:users(id, nick_name, avatar)
      `)
      .eq('status', 'published');

    // 筛选条件
    if (category) {
      query = query.eq('category', category);
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    // 排序
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // 分页
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    const { data: recipes, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: '查询失败', message: error.message });
    }

    res.json({
      recipes,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });

  } catch (error) {
    console.error('获取食谱列表错误:', error);
    res.status(500).json({
      error: '服务器错误',
      message: error.message
    });
  }
};
```

#### `api/recipes/[id].js`（食谱详情）
```javascript
const supabase = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    // 获取食谱详情
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(`
        *,
        author:users(id, nick_name, avatar, followers)
      `)
      .eq('id', id)
      .single();

    if (error || !recipe) {
      return res.status(404).json({ error: '食谱不存在' });
    }

    // 增加浏览量
    await supabase
      .from('recipes')
      .update({ views: recipe.views + 1 })
      .eq('id', id);

    recipe.views += 1;

    res.json(recipe);

  } catch (error) {
    console.error('获取食谱详情错误:', error);
    res.status(500).json({
      error: '服务器错误',
      message: error.message
    });
  }
};
```

#### `api/recipes/create.js`（创建食谱）
```javascript
const supabase = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST请求' });
  }

  // 验证认证
  const authError = await requireAuth(req, res);
  if (authError) return;

  try {
    const recipeData = {
      ...req.body,
      author_id: req.user.id,
      status: 'published'
    };

    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert([recipeData])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: '创建失败', message: error.message });
    }

    // 更新用户食谱数
    await supabase
      .from('users')
      .update({ recipe_count: req.user.recipe_count + 1 })
      .eq('id', req.user.id);

    res.status(201).json({
      message: '食谱创建成功',
      recipe
    });

  } catch (error) {
    console.error('创建食谱错误:', error);
    res.status(500).json({
      error: '服务器错误',
      message: error.message
    });
  }
};
```

#### `api/favorites/index.js`（收藏功能）
```javascript
const supabase = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authError = await requireAuth(req, res);
  if (authError) return;

  try {
    // GET - 获取收藏列表
    if (req.method === 'GET') {
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select(`
          *,
          recipe:recipes(*)
        `)
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json(favorites);
    }

    // POST - 添加收藏
    if (req.method === 'POST') {
      const { recipeId } = req.body;

      const { data, error } = await supabase
        .from('favorites')
        .insert([{
          user_id: req.user.id,
          recipe_id: recipeId
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: '已经收藏过了' });
        }
        return res.status(500).json({ error: error.message });
      }

      // 更新食谱收藏数
      await supabase.rpc('increment_collect', { recipe_id: recipeId });

      return res.json({ message: '收藏成功', data });
    }

    // DELETE - 取消收藏
    if (req.method === 'DELETE') {
      const { recipeId } = req.query;

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', req.user.id)
        .eq('recipe_id', recipeId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // 更新食谱收藏数
      await supabase.rpc('decrement_collect', { recipe_id: recipeId });

      return res.json({ message: '取消收藏成功' });
    }

  } catch (error) {
    console.error('收藏操作错误:', error);
    res.status(500).json({
      error: '服务器错误',
      message: error.message
    });
  }
};
```

#### `api/upload/image.js`（图片上传 - 使用 Cloudinary）
```javascript
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const config = {
  api: {
    bodyParser: false, // 禁用默认的body解析
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST请求' });
  }

  try {
    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: '文件解析失败' });
      }

      const file = files.file;
      
      // 上传到 Cloudinary
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'cooktip',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      res.json({
        url: result.secure_url,
        publicId: result.public_id
      });
    });

  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({
      error: '上传失败',
      message: error.message
    });
  }
};
```

### 第4步：部署到 Vercel

```bash
# 1. 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 2. 推送到 GitHub
git remote add origin https://github.com/yourusername/cooktip-api.git
git push -u origin main

# 3. 部署到 Vercel
vercel

# 或者通过 Vercel 网站导入 GitHub 仓库
# https://vercel.com/new
```

### 第5步：配置环境变量

在 Vercel Dashboard 中配置：

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
WECHAT_APPID=wx8486e57500ac0a55
WECHAT_SECRET=your_wechat_secret
JWT_SECRET=your_random_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📱 小程序端对接

### 修改 `app.js`

```javascript
App({
  onLaunch() {
    // 获取token
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  },
  
  globalData: {
    userInfo: null,
    token: null,
    baseURL: 'https://your-project.vercel.app/api' // Vercel域名
  }
});
```

### 创建 `utils/request.js`（统一请求）

```javascript
const app = getApp();

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseURL}${url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token失效，重新登录
          wx.removeStorageSync('token');
          app.globalData.token = null;
          
          // 跳转登录
          wx.showToast({
            title: '请重新登录',
            icon: 'none'
          });
          
          reject(new Error('未授权'));
        } else {
          reject(new Error(res.data.message || res.data.error || '请求失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

module.exports = {
  // 登录
  login: (code) => request('/auth/login', {
    method: 'POST',
    data: { code }
  }),

  // 食谱列表
  getRecipes: (params) => request('/recipes', {
    method: 'GET',
    data: params
  }),

  // 食谱详情
  getRecipeDetail: (id) => request(`/recipes/${id}`),

  // 创建食谱
  createRecipe: (data) => request('/recipes/create', {
    method: 'POST',
    data
  }),

  // 收藏
  getFavorites: () => request('/favorites'),
  
  addFavorite: (recipeId) => request('/favorites', {
    method: 'POST',
    data: { recipeId }
  }),
  
  removeFavorite: (recipeId) => request(`/favorites?recipeId=${recipeId}`, {
    method: 'DELETE'
  }),

  // 点赞
  likeRecipe: (recipeId) => request(`/likes`, {
    method: 'POST',
    data: { recipeId }
  }),

  // 上传图片
  uploadImage: (filePath) => {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${app.globalData.baseURL}/upload/image`,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : ''
        },
        success: (res) => {
          const data = JSON.parse(res.data);
          resolve(data);
        },
        fail: reject
      });
    });
  }
};
```

### 在页面中使用

```javascript
// pages/index/index.js
const api = require('../../utils/request');

Page({
  data: {
    recipes: []
  },

  async onLoad() {
    await this.loadRecipes();
  },

  async loadRecipes() {
    try {
      wx.showLoading({ title: '加载中...' });

      const result = await api.getRecipes({
        page: 1,
        limit: 10,
        category: '中餐'
      });

      this.setData({
        recommendRecipes: result.recipes
      });

      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  }
});
```

---

## 🔧 图片存储方案

### 推荐：Cloudinary（最简单）

#### 优势
- ✅ 免费额度：25GB存储 + 25GB流量/月
- ✅ 自动图片优化和CDN
- ✅ 实时图片转换
- ✅ 简单易用的API

#### 注册和配置
1. 访问 https://cloudinary.com/
2. 注册免费账号
3. 获取配置信息（Dashboard 中）

```javascript
// 环境变量
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret
```

### 备选：Vercel Blob Storage

```bash
npm install @vercel/blob
```

```javascript
// api/upload/blob.js
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');

  const blob = await put(filename, req.body, {
    access: 'public',
  });

  return res.json(blob);
}
```

---

## 🚀 部署清单

### ✅ 部署前检查

- [ ] Vercel 账号已注册
- [ ] Supabase 项目已创建
- [ ] 数据表已创建
- [ ] 微信小程序 AppSecret 已获取
- [ ] Cloudinary 账号已配置（可选）
- [ ] GitHub 仓库已创建

### ✅ 部署步骤

1. [ ] 创建后端项目代码
2. [ ] 配置 `vercel.json`
3. [ ] 推送到 GitHub
4. [ ] Vercel 导入项目
5. [ ] 配置环境变量
6. [ ] 部署成功
7. [ ] 获取API域名
8. [ ] 小程序配置服务器域名
9. [ ] 测试API接口
10. [ ] 小程序对接API

---

## 💰 成本预估

### 免费方案（推荐入门）

| 服务 | 套餐 | 月成本 |
|-----|------|--------|
| Vercel | Hobby（免费） | ￥0 |
| Supabase | Free Tier | ￥0 |
| Cloudinary | Free | ￥0 |
| **总计** | | **￥0/月** |

**限制**：
- Vercel：100GB流量/月，100万次函数调用
- Supabase：500MB数据库，1GB存储
- Cloudinary：25GB流量/月

**适用场景**：
- 日活 < 1000
- 月请求量 < 50万
- 数据量 < 500MB

### 付费方案（生产环境）

| 服务 | 套餐 | 月成本 |
|-----|------|--------|
| Vercel | Pro | ￥140 |
| Supabase | Pro | ￥170 |
| Cloudinary | Plus | ￥300 |
| **总计** | | **￥610/月** |

**扩展能力**：
- 无限流量
- 8GB数据库
- 190GB文件存储
- 更快的函数执行

---

## 🎯 Vercel 特别注意事项

### 限制和解决方案

#### 1. 函数执行时间限制
**问题**：免费版10秒，Pro版60秒

**解决**：
- 优化查询，使用索引
- 复杂任务使用后台任务队列
- 大文件上传直接上传到云存储

#### 2. 无状态函数
**问题**：每次请求都是新的函数实例

**解决**：
- 使用外部数据库（Supabase）
- 使用 Redis（Upstash）做缓存
- WebSocket 使用第三方服务（Pusher）

#### 3. 冷启动
**问题**：函数长时间不用会冷启动，首次请求慢

**解决**：
- 使用定时任务保持活跃
- 优化依赖包大小
- 使用 Edge Functions（更快）

---

## 📚 完整部署教程

### 快速部署（20分钟）

#### 步骤1：创建 Supabase 项目（5分钟）
```bash
1. 访问 https://supabase.com/
2. 点击 "Start your project"
3. 创建组织和项目
4. 等待数据库初始化
5. 复制 Project URL 和 API Key
```

#### 步骤2：创建数据表（3分钟）
```bash
1. 进入 Supabase Dashboard
2. 点击 "SQL Editor"
3. 粘贴上面的建表SQL
4. 点击 "Run" 执行
```

#### 步骤3：创建 Vercel 项目（5分钟）
```bash
# 本地操作
mkdir cooktip-api
cd cooktip-api
npm init -y
npm install @supabase/supabase-js jsonwebtoken axios

# 创建必要文件（使用上面的代码）
# - vercel.json
# - lib/db.js
# - api/recipes/index.js
# 等...

git init
git add .
git commit -m "Initial commit"
```

#### 步骤4：部署到 Vercel（5分钟）
```bash
1. 推送到 GitHub
2. 访问 https://vercel.com/
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. 配置环境变量
6. 点击 "Deploy"
```

#### 步骤5：小程序配置（2分钟）
```bash
1. 获取 Vercel 域名（如：your-project.vercel.app）
2. 修改小程序 app.js 中的 baseURL
3. 在微信公众平台配置服务器域名
4. 重新编译测试
```

---

## 🔥 推荐的完整技术栈

```
前端：微信小程序（原生）
├─ AppID: wx8486e57500ac0a55
└─ UI框架：WeUI（可选）

后端：Vercel Serverless Functions
├─ 运行时：Node.js 18
├─ 框架：Next.js API Routes / 纯Node.js
└─ 部署：自动CI/CD

数据库：Supabase（PostgreSQL）
├─ ORM：Supabase Client
├─ 认证：JWT
└─ 存储：Supabase Storage（或Cloudinary）

图片：Cloudinary
├─ CDN：全球加速
├─ 优化：自动压缩、格式转换
└─ 转换：实时缩放、裁剪

缓存：Upstash Redis（可选）
└─ 用途：热点数据、限流
```

---

## 📋 完整的 package.json

```json
{
  "name": "cooktip-api",
  "version": "1.0.0",
  "description": "一家食谱小程序 Vercel Serverless API",
  "main": "index.js",
  "scripts": {
    "dev": "vercel dev",
    "deploy": "vercel --prod"
  },
  "keywords": ["recipe", "wechat", "serverless", "vercel"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "jsonwebtoken": "^9.0.2",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "formidable": "^3.5.1",
    "cloudinary": "^1.41.0"
  },
  "devDependencies": {
    "vercel": "^33.0.0"
  }
}
```

---

## 🎯 使用 SQLPub 的配置

如果您使用 [SQLPub](https://sqlpub.com/) 作为数据库：

### 连接配置

```javascript
// lib/db.js（使用原生 PostgreSQL 客户端）
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,        // SQLPub 提供的主机地址
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  // Vercel Serverless 优化
  max: 1,                   // 每个函数最多1个连接
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 查询封装
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

module.exports = { query, pool };
```

### 环境变量（Vercel）

```env
# SQLPub 数据库配置
DB_HOST=your-sqlpub-host.com
DB_PORT=5432
DB_NAME=cooktip
DB_USER=your_username
DB_PASSWORD=your_password
```

### API 示例（使用原生SQL）

```javascript
// api/recipes/index.js
const { query } = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT r.*, 
             json_build_object(
               'id', u.id, 
               'nick_name', u.nick_name, 
               'avatar', u.avatar
             ) as author
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE r.status = 'published'
    `;

    const params = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND r.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    res.json({
      recipes: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('查询错误:', error);
    res.status(500).json({ error: error.message });
  }
};
```

---

## ⚡ 性能优化建议

### 1. 数据库优化
```sql
-- 创建必要的索引
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_status ON recipes(status);
CREATE INDEX idx_recipes_created ON recipes(created_at DESC);
CREATE INDEX idx_recipes_author ON recipes(author_id);

-- 全文搜索索引
CREATE INDEX idx_recipes_search ON recipes USING GIN(to_tsvector('chinese', title || ' ' || introduction));
```

### 2. API 缓存
```javascript
// 使用 Vercel Edge Config 或 Upstash Redis
const { get, set } = require('@upstash/redis');

// 缓存热门食谱
const cacheKey = `recipes:hot:${category}`;
const cached = await get(cacheKey);

if (cached) {
  return res.json(cached);
}

// 查询数据库...
await set(cacheKey, result, { ex: 300 }); // 缓存5分钟
```

### 3. 图片优化
```javascript
// Cloudinary 自动优化
const optimizedUrl = cloudinary.url('sample.jpg', {
  fetch_format: 'auto',
  quality: 'auto',
  width: 800
});
```

---

## 🐛 常见问题解决

### 问题1：Vercel函数超时
**解决**：
- 优化数据库查询
- 使用索引
- 减少JOIN操作
- 升级到 Pro 版本（60秒）

### 问题2：数据库连接池耗尽
**解决**：
```javascript
// 使用连接池，每个函数最多1个连接
const pool = new Pool({ max: 1 });
```

### 问题3：CORS 跨域问题
**解决**：
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### 问题4：图片上传失败
**解决**：
- 检查文件大小限制（Vercel: 4.5MB）
- 使用前端直传到云存储
- 或使用 Vercel Blob

---

## 📊 完整对比：Vercel vs 传统服务器

| 特性 | Vercel Serverless | 传统云服务器 |
|-----|------------------|------------|
| **部署时间** | 2分钟 | 30-60分钟 |
| **月成本** | ￥0-140 | ￥150-500 |
| **运维难度** | 零运维 | 需要运维 |
| **扩展性** | 自动扩容 | 手动扩容 |
| **HTTPS** | 自动配置 | 需手动配置 |
| **全球访问** | 全球CDN | 单地域 |
| **可靠性** | 99.99% | 取决于配置 |

---

## 🎉 总结

### Vercel + Supabase 方案的优势

1. **🚀 超快部署** - 20分钟从零到上线
2. **💰 成本极低** - 免费额度充足，个人项目完全够用
3. **🔧 零运维** - 无需管理服务器，专注业务逻辑
4. **🌍 全球加速** - 自动CDN，访问速度快
5. **📈 自动扩容** - 无需担心并发问题
6. **🔒 安全可靠** - 自动HTTPS，Supabase行级安全

### 适用场景

✅ 个人项目
✅ MVP快速验证
✅ 中小规模应用（日活 < 5000）
✅ 预算有限的项目
✅ 前端开发者独立开发

---

## 📝 下一步行动

我可以帮您：

1. **生成完整的 Vercel API 代码**
   - 所有API接口
   - 认证中间件
   - 数据库操作
   
2. **提供详细的部署教程**
   - 图文步骤
   - 配置清单
   - 测试方法

3. **创建小程序端对接代码**
   - API工具类
   - 请求封装
   - 错误处理

**您想让我帮您实施哪一步？** 🚀

---

*基于 Vercel Serverless 的现代化后端方案，让您的小程序后端部署变得简单！*
