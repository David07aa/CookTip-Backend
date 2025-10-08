# CookTip 前端对接 API 文档

> 📅 更新时间：2025-10-08  
> 🌐 API 基础地址：`https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/api/v1`  
> 📚 在线文档：`https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/api/docs`

---

## 📋 目录

- [1. 基础配置](#1-基础配置)
- [2. 认证模块](#2-认证模块)
- [3. 用户模块](#3-用户模块)
- [4. 食谱模块](#4-食谱模块)
- [5. 评论模块](#5-评论模块)
- [6. 收藏模块](#6-收藏模块)
- [7. 搜索模块](#7-搜索模块)
- [8. 购物清单模块](#8-购物清单模块)
- [9. 分类模块](#9-分类模块)
- [10. 文件上传模块](#10-文件上传模块)
- [11. 统计模块](#11-统计模块)
- [12. 错误码说明](#12-错误码说明)

---

## 1. 基础配置

### 1.1 配置文件 (`config.js`)

```javascript
// config.js
const config = {
  // API 基础地址（生产环境）
  apiBaseUrl: 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/api/v1',
  
  // 上传地址
  uploadUrl: 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/api/v1/upload/image',
  
  // 请求超时时间
  timeout: 10000,
  
  // Token 存储 key
  tokenKey: 'cooktip_token',
};

module.exports = config;
```

### 1.2 请求封装 (`utils/request.js`)

```javascript
// utils/request.js
const config = require('../config');

/**
 * 封装的请求方法
 * @param {Object} options - 请求配置
 * @param {String} options.url - 接口路径（不包含基础地址）
 * @param {String} options.method - 请求方法
 * @param {Object} options.data - 请求数据
 * @param {Boolean} options.auth - 是否需要认证（默认 true）
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取 token
    const token = wx.getStorageSync(config.tokenKey);
    
    // 构建请求头
    const header = {
      'Content-Type': 'application/json',
    };
    
    // 如果需要认证且有 token，添加到请求头
    if (options.auth !== false && token) {
      header['Authorization'] = `Bearer ${token}`;
    }
    
    // 发起请求
    wx.request({
      url: config.apiBaseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      timeout: config.timeout,
      success: (res) => {
        // 请求成功
        if (res.statusCode === 200) {
          // 业务成功
          if (res.data.code === 200) {
            resolve(res.data.data);
          } else {
            // 业务失败
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none',
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // Token 过期，跳转登录
          wx.removeStorageSync(config.tokenKey);
          wx.navigateTo({
            url: '/pages/login/login',
          });
          reject({ message: '请先登录' });
        } else {
          // HTTP 错误
          wx.showToast({
            title: `请求失败 (${res.statusCode})`,
            icon: 'none',
          });
          reject(res);
        }
      },
      fail: (err) => {
        // 网络错误
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        });
        reject(err);
      },
    });
  });
}

module.exports = request;
```

### 1.3 通用响应格式

所有接口响应格式统一为：

```json
{
  "code": 200,
  "message": "success",
  "data": { /* 具体数据 */ }
}
```

---

## 2. 认证模块

### 2.1 微信登录

**接口地址**：`POST /auth/wx-login`

**请求参数**：
```json
{
  "code": "微信登录凭证"
}
```

**响应数据**：
```json
{
  "token": "JWT Token",
  "user": {
    "id": 1,
    "openid": "oxxxxxx",
    "nickname": "用户昵称",
    "avatar": "头像URL"
  }
}
```

**小程序示例**：
```javascript
// pages/login/login.js
const request = require('../../utils/request');
const config = require('../../config');

Page({
  // 微信登录
  wxLogin() {
    wx.showLoading({ title: '登录中...' });
    
    wx.login({
      success: async (res) => {
        if (res.code) {
          try {
            const data = await request({
              url: '/auth/wx-login',
              method: 'POST',
              data: { code: res.code },
              auth: false, // 不需要 token
            });
            
            // 保存 token
            wx.setStorageSync(config.tokenKey, data.token);
            
            // 保存用户信息
            wx.setStorageSync('userInfo', data.user);
            
            wx.hideLoading();
            wx.showToast({
              title: '登录成功',
              icon: 'success',
            });
            
            // 跳转到首页
            wx.switchTab({
              url: '/pages/index/index',
            });
          } catch (error) {
            wx.hideLoading();
            console.error('登录失败:', error);
          }
        }
      },
      fail: (error) => {
        wx.hideLoading();
        wx.showToast({
          title: '登录失败',
          icon: 'none',
        });
      }
    });
  },
});
```

### 2.2 刷新 Token

**接口地址**：`POST /auth/refresh`

**请求头**：需要携带当前 Token

**响应数据**：
```json
{
  "token": "新的 JWT Token"
}
```

### 2.3 退出登录

**接口地址**：`POST /auth/logout`

**小程序示例**：
```javascript
// 退出登录
async logout() {
  try {
    await request({
      url: '/auth/logout',
      method: 'POST',
    });
    
    // 清除本地数据
    wx.removeStorageSync(config.tokenKey);
    wx.removeStorageSync('userInfo');
    
    // 跳转登录页
    wx.reLaunch({
      url: '/pages/login/login',
    });
  } catch (error) {
    console.error('退出失败:', error);
  }
}
```

---

## 3. 用户模块

### 3.1 获取用户信息

**接口地址**：`GET /user/profile`

**响应数据**：
```json
{
  "id": 1,
  "openid": "oxxxxxx",
  "nickname": "用户昵称",
  "avatar": "https://xxx.com/avatar.jpg",
  "bio": "个人简介",
  "recipeCount": 10,
  "followerCount": 100,
  "followingCount": 50,
  "favoriteCount": 30,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**小程序示例**：
```javascript
// pages/profile/profile.js
const request = require('../../utils/request');

Page({
  data: {
    userInfo: null,
  },
  
  onLoad() {
    this.getUserInfo();
  },
  
  async getUserInfo() {
    try {
      const userInfo = await request({
        url: '/user/profile',
        method: 'GET',
      });
      
      this.setData({ userInfo });
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },
});
```

### 3.2 更新用户信息

**接口地址**：`PUT /user/profile`

**请求参数**：
```json
{
  "nickname": "新昵称",
  "avatar": "新头像URL",
  "bio": "新的个人简介"
}
```

**小程序示例**：
```javascript
// 更新用户信息
async updateProfile() {
  try {
    await request({
      url: '/user/profile',
      method: 'PUT',
      data: {
        nickname: this.data.nickname,
        avatar: this.data.avatar,
        bio: this.data.bio,
      },
    });
    
    wx.showToast({
      title: '更新成功',
      icon: 'success',
    });
  } catch (error) {
    console.error('更新失败:', error);
  }
}
```

### 3.3 获取用户发布的食谱

**接口地址**：`GET /user/recipes`

**查询参数**：
- `page`：页码（默认 1）
- `limit`：每页数量（默认 10）

**响应数据**：
```json
{
  "items": [
    {
      "id": 1,
      "title": "红烧肉",
      "coverImage": "https://xxx.com/image.jpg",
      "likeCount": 100,
      "commentCount": 20,
      "viewCount": 500
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

### 3.4 获取用户收藏的食谱

**接口地址**：`GET /user/favorites`

**查询参数**：同上

---

## 4. 食谱模块

### 4.1 获取食谱列表

**接口地址**：`GET /recipes`

**查询参数**：
- `page`：页码（默认 1）
- `limit`：每页数量（默认 10）
- `categoryId`：分类ID（可选）
- `sort`：排序方式（可选）
  - `latest`：最新
  - `hot`：最热
  - `recommended`：推荐

**响应数据**：
```json
{
  "items": [
    {
      "id": 1,
      "title": "红烧肉",
      "description": "美味的红烧肉",
      "coverImage": "https://xxx.com/image.jpg",
      "cookingTime": 60,
      "difficulty": "简单",
      "likeCount": 100,
      "commentCount": 20,
      "viewCount": 500,
      "category": {
        "id": 1,
        "name": "家常菜"
      },
      "author": {
        "id": 1,
        "nickname": "美食家",
        "avatar": "https://xxx.com/avatar.jpg"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

**小程序示例**：
```javascript
// pages/recipe-list/recipe-list.js
const request = require('../../utils/request');

Page({
  data: {
    recipes: [],
    page: 1,
    limit: 10,
    hasMore: true,
  },
  
  onLoad(options) {
    this.loadRecipes();
  },
  
  async loadRecipes() {
    if (!this.data.hasMore) return;
    
    try {
      const result = await request({
        url: '/recipes',
        method: 'GET',
        data: {
          page: this.data.page,
          limit: this.data.limit,
          categoryId: this.data.categoryId,
          sort: 'latest',
        },
      });
      
      this.setData({
        recipes: [...this.data.recipes, ...result.items],
        page: this.data.page + 1,
        hasMore: result.items.length === this.data.limit,
      });
    } catch (error) {
      console.error('加载食谱失败:', error);
    }
  },
  
  // 触底加载更多
  onReachBottom() {
    this.loadRecipes();
  },
});
```

### 4.2 获取食谱详情

**接口地址**：`GET /recipes/:id`

**响应数据**：
```json
{
  "id": 1,
  "title": "红烧肉",
  "description": "美味的红烧肉，肥而不腻",
  "coverImage": "https://xxx.com/cover.jpg",
  "images": ["https://xxx.com/1.jpg", "https://xxx.com/2.jpg"],
  "cookingTime": 60,
  "servings": 4,
  "difficulty": "简单",
  "ingredients": [
    { "name": "五花肉", "amount": "500g" },
    { "name": "冰糖", "amount": "30g" }
  ],
  "steps": [
    { "order": 1, "content": "将五花肉切块", "image": "https://xxx.com/step1.jpg" },
    { "order": 2, "content": "焯水去腥", "image": null }
  ],
  "tips": "注意火候控制",
  "likeCount": 100,
  "commentCount": 20,
  "viewCount": 500,
  "isLiked": false,
  "isFavorited": false,
  "category": {
    "id": 1,
    "name": "家常菜"
  },
  "author": {
    "id": 1,
    "nickname": "美食家",
    "avatar": "https://xxx.com/avatar.jpg"
  },
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**小程序示例**：
```javascript
// pages/recipe-detail/recipe-detail.js
const request = require('../../utils/request');

Page({
  data: {
    recipe: null,
    recipeId: 0,
  },
  
  onLoad(options) {
    this.setData({ recipeId: options.id });
    this.getRecipeDetail();
  },
  
  async getRecipeDetail() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const recipe = await request({
        url: `/recipes/${this.data.recipeId}`,
        method: 'GET',
      });
      
      this.setData({ recipe });
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      console.error('获取食谱详情失败:', error);
    }
  },
});
```

### 4.3 创建食谱

**接口地址**：`POST /recipes`

**请求参数**：
```json
{
  "title": "红烧肉",
  "description": "美味的红烧肉",
  "coverImage": "https://xxx.com/cover.jpg",
  "images": ["https://xxx.com/1.jpg"],
  "categoryId": 1,
  "cookingTime": 60,
  "servings": 4,
  "difficulty": "简单",
  "ingredients": [
    { "name": "五花肉", "amount": "500g" }
  ],
  "steps": [
    { "order": 1, "content": "将五花肉切块", "image": "https://xxx.com/step1.jpg" }
  ],
  "tips": "注意火候"
}
```

**小程序示例**：
```javascript
// pages/publish/publish.js
async publishRecipe() {
  wx.showLoading({ title: '发布中...' });
  
  try {
    const recipe = await request({
      url: '/recipes',
      method: 'POST',
      data: {
        title: this.data.title,
        description: this.data.description,
        coverImage: this.data.coverImage,
        images: this.data.images,
        categoryId: this.data.categoryId,
        cookingTime: this.data.cookingTime,
        servings: this.data.servings,
        difficulty: this.data.difficulty,
        ingredients: this.data.ingredients,
        steps: this.data.steps,
        tips: this.data.tips,
      },
    });
    
    wx.hideLoading();
    wx.showToast({
      title: '发布成功',
      icon: 'success',
    });
    
    // 跳转到详情页
    wx.redirectTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipe.id}`,
    });
  } catch (error) {
    wx.hideLoading();
    console.error('发布失败:', error);
  }
}
```

### 4.4 更新食谱

**接口地址**：`PUT /recipes/:id`

**请求参数**：同创建食谱

### 4.5 删除食谱

**接口地址**：`DELETE /recipes/:id`

### 4.6 点赞食谱

**接口地址**：`POST /recipes/:id/like`

**小程序示例**：
```javascript
// 点赞/取消点赞
async toggleLike() {
  try {
    if (this.data.recipe.isLiked) {
      // 取消点赞
      await request({
        url: `/recipes/${this.data.recipeId}/like`,
        method: 'DELETE',
      });
    } else {
      // 点赞
      await request({
        url: `/recipes/${this.data.recipeId}/like`,
        method: 'POST',
      });
    }
    
    // 更新状态
    this.setData({
      'recipe.isLiked': !this.data.recipe.isLiked,
      'recipe.likeCount': this.data.recipe.likeCount + (this.data.recipe.isLiked ? -1 : 1),
    });
  } catch (error) {
    console.error('操作失败:', error);
  }
}
```

### 4.7 取消点赞

**接口地址**：`DELETE /recipes/:id/like`

---

## 5. 评论模块

### 5.1 获取评论列表

**接口地址**：`GET /comments/recipe/:recipeId`

**查询参数**：
- `page`：页码（默认 1）
- `limit`：每页数量（默认 10）

**响应数据**：
```json
{
  "items": [
    {
      "id": 1,
      "content": "太好吃了！",
      "likeCount": 10,
      "isLiked": false,
      "user": {
        "id": 1,
        "nickname": "美食爱好者",
        "avatar": "https://xxx.com/avatar.jpg"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

**小程序示例**：
```javascript
// 获取评论列表
async loadComments() {
  try {
    const result = await request({
      url: `/comments/recipe/${this.data.recipeId}`,
      method: 'GET',
      data: {
        page: this.data.commentPage,
        limit: 10,
      },
    });
    
    this.setData({
      comments: [...this.data.comments, ...result.items],
      commentTotal: result.total,
    });
  } catch (error) {
    console.error('加载评论失败:', error);
  }
}
```

### 5.2 发表评论

**接口地址**：`POST /comments`

**请求参数**：
```json
{
  "recipeId": 1,
  "content": "太好吃了！"
}
```

**小程序示例**：
```javascript
// 发表评论
async postComment() {
  if (!this.data.commentContent.trim()) {
    wx.showToast({
      title: '请输入评论内容',
      icon: 'none',
    });
    return;
  }
  
  try {
    const comment = await request({
      url: '/comments',
      method: 'POST',
      data: {
        recipeId: this.data.recipeId,
        content: this.data.commentContent,
      },
    });
    
    // 添加到评论列表头部
    this.setData({
      comments: [comment, ...this.data.comments],
      commentContent: '',
      'recipe.commentCount': this.data.recipe.commentCount + 1,
    });
    
    wx.showToast({
      title: '评论成功',
      icon: 'success',
    });
  } catch (error) {
    console.error('评论失败:', error);
  }
}
```

### 5.3 删除评论

**接口地址**：`DELETE /comments/:id`

---

## 6. 收藏模块

### 6.1 收藏食谱

**接口地址**：`POST /favorites`

**请求参数**：
```json
{
  "recipeId": 1
}
```

### 6.2 取消收藏

**接口地址**：`DELETE /favorites/:recipeId`

### 6.3 我的收藏列表

**接口地址**：`GET /favorites`

**查询参数**：
- `page`：页码（默认 1）
- `limit`：每页数量（默认 10）

**小程序示例**：
```javascript
// 收藏/取消收藏
async toggleFavorite() {
  try {
    if (this.data.recipe.isFavorited) {
      // 取消收藏
      await request({
        url: `/favorites/${this.data.recipeId}`,
        method: 'DELETE',
      });
    } else {
      // 收藏
      await request({
        url: '/favorites',
        method: 'POST',
        data: { recipeId: this.data.recipeId },
      });
    }
    
    // 更新状态
    this.setData({
      'recipe.isFavorited': !this.data.recipe.isFavorited,
    });
    
    wx.showToast({
      title: this.data.recipe.isFavorited ? '已收藏' : '已取消',
      icon: 'success',
    });
  } catch (error) {
    console.error('操作失败:', error);
  }
}
```

---

## 7. 搜索模块

### 7.1 搜索食谱

**接口地址**：`GET /search`

**查询参数**：
- `keyword`：搜索关键词（必填）
- `page`：页码（默认 1）
- `limit`：每页数量（默认 10）

**响应数据**：同食谱列表

**小程序示例**：
```javascript
// pages/search/search.js
const request = require('../../utils/request');

Page({
  data: {
    keyword: '',
    recipes: [],
  },
  
  // 搜索
  async search() {
    if (!this.data.keyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none',
      });
      return;
    }
    
    wx.showLoading({ title: '搜索中...' });
    
    try {
      const result = await request({
        url: '/search',
        method: 'GET',
        data: {
          keyword: this.data.keyword,
          page: 1,
          limit: 20,
        },
      });
      
      this.setData({ recipes: result.items });
      wx.hideLoading();
      
      if (result.items.length === 0) {
        wx.showToast({
          title: '未找到相关食谱',
          icon: 'none',
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('搜索失败:', error);
    }
  },
});
```

### 7.2 热门搜索词

**接口地址**：`GET /search/hot`

**响应数据**：
```json
["红烧肉", "西红柿炒蛋", "糖醋排骨"]
```

---

## 8. 购物清单模块

### 8.1 获取购物清单

**接口地址**：`GET /shopping-list`

**响应数据**：
```json
[
  {
    "id": 1,
    "name": "五花肉",
    "amount": "500g",
    "category": "肉类",
    "purchased": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### 8.2 添加购物项

**接口地址**：`POST /shopping-list`

**请求参数**：
```json
{
  "name": "五花肉",
  "amount": "500g",
  "category": "肉类"
}
```

### 8.3 更新购物项

**接口地址**：`PUT /shopping-list/:id`

**请求参数**：
```json
{
  "name": "五花肉",
  "amount": "600g",
  "purchased": true
}
```

### 8.4 删除购物项

**接口地址**：`DELETE /shopping-list/:id`

**小程序示例**：
```javascript
// pages/shopping-list/shopping-list.js
const request = require('../../utils/request');

Page({
  data: {
    items: [],
  },
  
  onLoad() {
    this.loadList();
  },
  
  // 加载购物清单
  async loadList() {
    try {
      const items = await request({
        url: '/shopping-list',
        method: 'GET',
      });
      
      this.setData({ items });
    } catch (error) {
      console.error('加载失败:', error);
    }
  },
  
  // 添加购物项
  async addItem() {
    try {
      const item = await request({
        url: '/shopping-list',
        method: 'POST',
        data: {
          name: this.data.itemName,
          amount: this.data.itemAmount,
          category: this.data.itemCategory,
        },
      });
      
      this.setData({
        items: [item, ...this.data.items],
        itemName: '',
        itemAmount: '',
      });
      
      wx.showToast({
        title: '添加成功',
        icon: 'success',
      });
    } catch (error) {
      console.error('添加失败:', error);
    }
  },
  
  // 切换购买状态
  async togglePurchased(e) {
    const { id, purchased } = e.currentTarget.dataset;
    
    try {
      await request({
        url: `/shopping-list/${id}`,
        method: 'PUT',
        data: { purchased: !purchased },
      });
      
      // 更新列表
      this.loadList();
    } catch (error) {
      console.error('更新失败:', error);
    }
  },
  
  // 删除购物项
  async deleteItem(e) {
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '提示',
      content: '确定删除该项吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request({
              url: `/shopping-list/${id}`,
              method: 'DELETE',
            });
            
            // 更新列表
            this.loadList();
            
            wx.showToast({
              title: '删除成功',
              icon: 'success',
            });
          } catch (error) {
            console.error('删除失败:', error);
          }
        }
      },
    });
  },
});
```

---

## 9. 分类模块

### 9.1 获取分类列表

**接口地址**：`GET /categories`

**响应数据**：
```json
[
  {
    "id": 1,
    "name": "家常菜",
    "icon": "https://xxx.com/icon.png",
    "description": "日常家常菜",
    "recipeCount": 100
  }
]
```

**小程序示例**：
```javascript
// 获取分类列表
async loadCategories() {
  try {
    const categories = await request({
      url: '/categories',
      method: 'GET',
      auth: false, // 不需要登录
    });
    
    this.setData({ categories });
  } catch (error) {
    console.error('加载分类失败:', error);
  }
}
```

### 9.2 获取分类下的食谱

**接口地址**：`GET /categories/:id/recipes`

**查询参数**：
- `page`：页码（默认 1）
- `limit`：每页数量（默认 10）

---

## 10. 文件上传模块

### 10.1 上传图片

**接口地址**：`POST /upload/image`

**请求方式**：`multipart/form-data`

**参数**：
- `file`：图片文件

**响应数据**：
```json
{
  "url": "https://xxx.com/uploads/xxx.jpg",
  "filename": "xxx.jpg",
  "size": 102400
}
```

**小程序示例**：
```javascript
// 上传图片
async uploadImage() {
  wx.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      
      wx.showLoading({ title: '上传中...' });
      
      wx.uploadFile({
        url: config.uploadUrl,
        filePath: tempFilePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync(config.tokenKey)}`,
        },
        success: (uploadRes) => {
          wx.hideLoading();
          
          const data = JSON.parse(uploadRes.data);
          
          if (data.code === 200) {
            // 上传成功，获取图片 URL
            const imageUrl = data.data.url;
            
            this.setData({
              coverImage: imageUrl,
            });
            
            wx.showToast({
              title: '上传成功',
              icon: 'success',
            });
          } else {
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'none',
            });
          }
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({
            title: '上传失败',
            icon: 'none',
          });
        },
      });
    },
  });
}
```

**批量上传示例**：
```javascript
// 批量上传图片
async uploadMultipleImages(filePaths) {
  const uploadPromises = filePaths.map((filePath) => {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: config.uploadUrl,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync(config.tokenKey)}`,
        },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data.data.url);
          } else {
            reject(data.message);
          }
        },
        fail: reject,
      });
    });
  });
  
  try {
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    console.error('批量上传失败:', error);
    throw error;
  }
}
```

---

## 11. 统计模块

### 11.1 首页统计数据

**接口地址**：`GET /stats/overview`

**响应数据**：
```json
{
  "totalRecipes": 1000,
  "totalUsers": 5000,
  "todayNewRecipes": 10,
  "todayNewUsers": 50
}
```

### 11.2 推荐食谱

**接口地址**：`GET /stats/recommended`

**查询参数**：
- `limit`：数量（默认 10）

**响应数据**：同食谱列表

**小程序示例**：
```javascript
// pages/index/index.js
const request = require('../../utils/request');

Page({
  data: {
    recommendedRecipes: [],
  },
  
  onLoad() {
    this.loadRecommended();
  },
  
  async loadRecommended() {
    try {
      const result = await request({
        url: '/stats/recommended',
        method: 'GET',
        data: { limit: 6 },
        auth: false,
      });
      
      this.setData({ recommendedRecipes: result.items });
    } catch (error) {
      console.error('加载推荐失败:', error);
    }
  },
});
```

---

## 12. 错误码说明

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 业务错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | Token 无效或过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 10001 | 微信登录失败 |
| 10002 | 用户不存在 |
| 20001 | 食谱不存在 |
| 20002 | 食谱已删除 |
| 30001 | 评论不存在 |
| 40001 | 文件上传失败 |
| 40002 | 文件格式不支持 |
| 40003 | 文件大小超限 |

### 错误处理示例

```javascript
// utils/request.js 中的错误处理
success: (res) => {
  if (res.statusCode === 200) {
    if (res.data.code === 200) {
      resolve(res.data.data);
    } else {
      // 根据错误码显示不同提示
      const errorMessages = {
        10001: '微信登录失败，请重试',
        10002: '用户信息不存在',
        20001: '食谱不存在',
        40001: '文件上传失败',
        40002: '不支持的文件格式',
        40003: '文件大小不能超过 5MB',
      };
      
      const message = errorMessages[res.data.code] || res.data.message || '请求失败';
      
      wx.showToast({
        title: message,
        icon: 'none',
      });
      
      reject(res.data);
    }
  } else if (res.statusCode === 401) {
    // Token 过期，清除本地数据并跳转登录
    wx.removeStorageSync(config.tokenKey);
    wx.removeStorageSync('userInfo');
    wx.reLaunch({
      url: '/pages/login/login',
    });
    reject({ message: '登录已过期，请重新登录' });
  }
}
```

---

## 📝 注意事项

### 1. 认证说明

- 大部分接口需要在请求头中携带 Token：`Authorization: Bearer <token>`
- Token 在登录成功后获取，保存在本地存储中
- Token 有效期为 7 天，过期后需要重新登录
- 公开接口（如分类列表、食谱列表）可以不携带 Token

### 2. 分页说明

- 所有列表接口都支持分页
- 默认每页 10 条数据
- 响应数据包含 `total`（总数）、`page`（当前页）、`limit`（每页数量）

### 3. 图片上传

- 支持的格式：JPG、PNG、GIF、WebP
- 单个文件大小限制：5MB
- 建议上传前进行图片压缩
- 上传成功后返回图片 URL，可直接使用

### 4. 小程序服务器域名配置

请在微信公众平台配置以下域名：

**request 合法域名：**
```
https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com
```

**uploadFile 合法域名：**
```
https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com
```

**downloadFile 合法域名：**
```
https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com
```

### 5. 调试建议

- 开发阶段可以在微信开发者工具中勾选"不校验合法域名"
- 生产环境必须配置合法域名
- 使用 Swagger 文档进行接口测试：https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/api/docs

### 6. 性能优化建议

- 使用图片懒加载
- 列表数据使用虚拟列表
- 图片使用 CDN 加速
- 合理使用缓存
- 避免频繁请求

---

## 🔗 相关链接

- **在线 API 文档（Swagger）**：https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/api/docs
- **GitHub 仓库**：https://github.com/David07aa/CookTip-Backend
- **技术支持**：3509204288@qq.com

---

**更新时间**：2025-10-08  
**文档版本**：v1.0.0

