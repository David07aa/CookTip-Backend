# 前端开发者集成文档 - 微信小程序登录与API

<div align="center">
  <h2>🎯 CookTip 美食菜谱小程序 - 前端完整接入指南</h2>
  <p>微信原生小程序框架 + 云函数API网关</p>
</div>

---

## 📦 需要的文件清单

### ✅ 必需文件（核心功能）

以下文件需要复制到您的小程序项目的 `utils` 目录：

| 序号 | 文件名 | 说明 | 必需性 |
|------|--------|------|--------|
| 1 | **wechat-login.js** | 微信登录核心工具 | ⭐ 必需 |
| 2 | **cloudRequest.js** | 云函数请求工具 | ⭐ 必需 |
| 3 | **api.js** | API接口封装 | ⭐ 必需 |
| 4 | **cdn.js** | CDN/图片配置工具 | ⭐ 必需 |

### 📄 示例文件（参考代码）

以下文件提供完整的登录页面示例，可根据需要修改：

| 序号 | 文件名 | 说明 | 用途 |
|------|--------|------|------|
| 5 | wechat-login-page-example.js | 登录页面JS示例 | 参考 |
| 6 | wechat-login-page-example.wxml | 登录页面结构示例 | 参考 |
| 7 | wechat-login-page-example.wxss | 登录页面样式示例 | 参考 |

---

## 📁 项目结构

将文件放置在以下位置：

```
your-miniprogram/
├── utils/                      # 工具目录
│   ├── wechat-login.js        ← 复制这个（必需）
│   ├── cloudRequest.js        ← 复制这个（必需）
│   ├── api.js                 ← 复制这个（必需）
│   └── cdn.js                 ← 复制这个（必需）
├── pages/
│   ├── login/                 # 登录页面
│   │   ├── login.js          ← 参考 wechat-login-page-example.js
│   │   ├── login.wxml        ← 参考 wechat-login-page-example.wxml
│   │   └── login.wxss        ← 参考 wechat-login-page-example.wxss
│   ├── index/                 # 首页
│   └── ...
└── app.js
```

---

## 🚀 快速集成（5步完成）

### 第一步：复制核心文件

将以下4个文件复制到 `utils` 目录：

```bash
# 复制这4个文件到小程序项目的 utils/ 目录
- wechat-login.js
- cloudRequest.js  
- api.js
- cdn.js
```

### 第二步：创建登录页面

创建 `pages/login/login.js`，参考 `wechat-login-page-example.js`：

```javascript
// pages/login/login.js
const wechatAuth = require('../../utils/wechat-login.js');

Page({
  data: {
    isLoading: false
  },

  /**
   * 处理微信登录按钮点击
   * 注意：必须绑定到按钮的 bindtap 事件
   */
  handleWechatLogin() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: '登录中...', mask: true });

    // 调用登录方法
    wechatAuth.wechatLogin()
      .then(result => {
        console.log('✅ 登录成功:', result);
        wx.hideLoading();
        wx.showToast({ title: '登录成功', icon: 'success' });
        
        // 跳转到首页
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 1500);
      })
      .catch(error => {
        console.error('❌ 登录失败:', error);
        this.setData({ isLoading: false });
        wx.hideLoading();
        
        let errorMsg = '登录失败，请重试';
        if (error.message.includes('取消授权')) {
          errorMsg = '您取消了授权';
        }
        
        wx.showToast({ title: errorMsg, icon: 'none' });
      });
  }
});
```

### 第三步：创建登录页面视图

创建 `pages/login/login.wxml`：

```xml
<!-- pages/login/login.wxml -->
<view class="container">
  <view class="login-container">
    <!-- Logo -->
    <view class="logo">
      <image src="/images/logo.png" mode="aspectFit"></image>
    </view>
    
    <view class="app-name">美食菜谱</view>
    <view class="app-desc">发现美食，分享快乐</view>
    
    <!-- 登录按钮 -->
    <button 
      class="login-btn"
      type="primary"
      bindtap="handleWechatLogin"
      disabled="{{isLoading}}"
    >
      {{isLoading ? '登录中...' : '微信一键登录'}}
    </button>
    
    <view class="login-tips">
      <text>登录即表示同意</text>
      <text class="link">《用户协议》</text>
      <text>和</text>
      <text class="link">《隐私政策》</text>
    </view>
  </view>
</view>
```

### 第四步：添加登录页面路由

在 `app.json` 中添加登录页面：

```json
{
  "pages": [
    "pages/index/index",
    "pages/login/login"
  ]
}
```

### 第五步：在其他页面中使用API

在需要调用API的页面中引入工具：

```javascript
// 引入API工具
const api = require('../../utils/api.js');
const wechatAuth = require('../../utils/wechat-login.js');

Page({
  onLoad() {
    // 检查登录状态
    if (!wechatAuth.checkLoginStatus()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    
    // 加载数据
    this.loadRecipeList();
  },
  
  // 加载食谱列表
  loadRecipeList() {
    api.getRecipeList({ page: 1, limit: 10 })
      .then(res => {
        console.log('食谱列表:', res.data);
        this.setData({ recipes: res.data });
      })
      .catch(error => {
        console.error('加载失败:', error);
      });
  }
});
```

---

## 🔑 核心功能说明

### 1. wechat-login.js - 微信登录工具

#### 主要方法：

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `wechatLogin()` | 执行完整登录流程 | Promise\<{success, token, userInfo}> |
| `checkLoginStatus()` | 检查是否已登录 | boolean |
| `getLocalUserInfo()` | 获取本地用户信息 | Object \| null |
| `getLocalToken()` | 获取本地token | string \| null |
| `logout()` | 退出登录 | void |
| `refreshToken()` | 刷新token | Promise\<string> |

#### 使用示例：

```javascript
const wechatAuth = require('../../utils/wechat-login.js');

// 1. 执行登录
wechatAuth.wechatLogin()
  .then(result => {
    console.log('登录成功:', result);
    // result = { success: true, token: '...', userInfo: {...} }
  })
  .catch(error => {
    console.error('登录失败:', error);
  });

// 2. 检查登录状态
const isLogin = wechatAuth.checkLoginStatus();
if (!isLogin) {
  wx.navigateTo({ url: '/pages/login/login' });
}

// 3. 获取用户信息
const userInfo = wechatAuth.getLocalUserInfo();
console.log('当前用户:', userInfo.nickname);

// 4. 退出登录
wechatAuth.logout();
```

---

### 2. cloudRequest.js - 云函数请求工具

#### 主要方法：

| 方法 | 说明 |
|------|------|
| `get(url, query, options)` | GET请求 |
| `post(url, data, options)` | POST请求 |
| `put(url, data, options)` | PUT请求 |
| `patch(url, data, options)` | PATCH请求 |
| `delete(url, options)` | DELETE请求 |
| `authRequest(options)` | 带Token的请求 |

#### 使用示例：

```javascript
const { get, post, authRequest } = require('../../utils/cloudRequest.js');

// 1. GET请求（无需登录）
get('/api/v1/categories')
  .then(res => {
    console.log('分类列表:', res.data);
  });

// 2. POST请求（无需登录）
post('/api/v1/recipes/123/view')
  .then(res => {
    console.log('浏览量+1');
  });

// 3. 带Token的请求（需要登录）
authRequest({
  url: '/api/v1/recipes',
  method: 'POST',
  data: { title: '宫保鸡丁', ... }
})
  .then(res => {
    console.log('食谱发布成功:', res.data);
  });
```

---

### 3. api.js - API接口封装

所有后端API都已封装好，直接调用即可！

#### 认证相关：

```javascript
const api = require('../../utils/api.js');

// 微信登录
api.wxLogin(code).then(res => {...});

// 刷新Token
api.refreshToken().then(res => {...});

// 退出登录
api.logout().then(res => {...});
```

#### 食谱相关：

```javascript
// 获取食谱列表
api.getRecipeList({ page: 1, limit: 10, sort: 'hot' })
  .then(res => {
    console.log('食谱列表:', res.data);
  });

// 获取食谱详情
api.getRecipeDetail(123)
  .then(res => {
    console.log('食谱详情:', res.data);
  });

// 创建食谱（需要登录）
api.createRecipe({
  title: '宫保鸡丁',
  description: '经典川菜',
  difficulty: 'medium',
  cook_time: 30,
  ingredients: [
    { name: '鸡胸肉', amount: '300', unit: 'g' },
    { name: '花生米', amount: '100', unit: 'g' }
  ],
  steps: [
    { order: 1, description: '鸡肉切丁', image: '' }
  ]
})
  .then(res => {
    console.log('发布成功:', res.data);
  });

// 点赞食谱
api.toggleLikeRecipe(123).then(res => {...});

// 收藏食谱
api.toggleFavoriteRecipe(123).then(res => {...});
```

#### 分类相关：

```javascript
// 获取所有分类
api.getCategoryList()
  .then(res => {
    console.log('分类:', res.data);
  });

// 获取分类详情
api.getCategoryDetail(1)
  .then(res => {
    console.log('分类详情:', res.data);
  });
```

#### 评论相关：

```javascript
// 获取评论列表
api.getRecipeComments(123, { page: 1, limit: 20 })
  .then(res => {
    console.log('评论:', res.data);
  });

// 发表评论
api.createComment(123, {
  content: '味道不错！',
  images: ['https://...']
})
  .then(res => {
    console.log('评论成功');
  });

// 删除评论
api.deleteComment(456).then(res => {...});
```

#### 搜索相关：

```javascript
// 搜索食谱
api.searchRecipes('宫保鸡丁', { page: 1, limit: 10 })
  .then(res => {
    console.log('搜索结果:', res.data);
  });

// 获取热门搜索词
api.getHotKeywords().then(res => {...});
```

#### 用户相关：

```javascript
// 获取当前用户信息
api.getUserInfo()
  .then(res => {
    console.log('用户信息:', res.data);
  });

// 更新用户信息
api.updateUserInfo({
  nickname: '美食达人',
  bio: '热爱烹饪'
})
  .then(res => {
    console.log('更新成功');
  });

// 获取我的收藏
api.getMyFavorites({ page: 1, limit: 10 })
  .then(res => {
    console.log('我的收藏:', res.data);
  });
```

---

### 4. cdn.js - CDN/图片配置工具

处理所有图片URL，支持占位图和默认图。

#### 主要方法：

| 方法 | 说明 |
|------|------|
| `getCdnUrl(path)` | 获取完整CDN URL |
| `getCdnUrls(urls)` | 批量处理URL数组 |
| `getPlaceholder(type)` | 获取占位图 |
| `getDefaultImage(type)` | 获取默认图 |
| `processRecipeImages(recipe)` | 处理食谱图片 |
| `processUserImages(user)` | 处理用户头像 |

#### 使用示例：

```javascript
const cdn = require('../../utils/cdn.js');

// 1. 获取完整图片URL
const imageUrl = cdn.getCdnUrl('/uploads/images/recipe1.jpg');
// 返回: https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/uploads/images/recipe1.jpg

// 2. 处理食谱数据中的图片
const recipe = {
  cover: '/uploads/recipe-cover.jpg',
  steps: [
    { image: '/uploads/step1.jpg' },
    { image: '/uploads/step2.jpg' }
  ],
  author: {
    avatar: '/uploads/avatar.jpg'
  }
};

const processedRecipe = cdn.processRecipeImages(recipe);
// 所有相对路径都会转换为完整CDN URL

// 3. 获取占位图
<image 
  src="{{cdn.getPlaceholder('noSearch')}}" 
  wx:if="{{searchResults.length === 0}}"
/>

// 4. 获取默认图
<image 
  src="{{recipe.cover || cdn.getDefaultImage('recipeCover')}}" 
/>
```

#### 在页面中使用：

```javascript
// pages/recipe/detail.js
const cdn = require('../../utils/cdn.js');
const api = require('../../utils/api.js');

Page({
  data: {
    recipe: null,
    cdn: cdn // 导出cdn到data中，供wxml使用
  },

  onLoad(options) {
    this.loadRecipe(options.id);
  },

  loadRecipe(id) {
    api.getRecipeDetail(id)
      .then(res => {
        // 处理图片URL
        const recipe = cdn.processRecipeImages(res.data);
        this.setData({ recipe });
      });
  }
});
```

```xml
<!-- pages/recipe/detail.wxml -->
<view class="recipe-detail">
  <!-- 封面图，自动处理URL -->
  <image src="{{recipe.cover}}" mode="aspectFill" />
  
  <!-- 步骤图片 -->
  <block wx:for="{{recipe.steps}}" wx:key="order">
    <image src="{{item.image}}" mode="widthFix" />
  </block>
  
  <!-- 作者头像 -->
  <image src="{{recipe.author.avatar}}" class="avatar" />
</view>
```

---

## 📡 后端API接口文档

### 接口规范

#### 基础URL

```
https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com/api/v1
```

#### 请求方式

所有请求通过**云函数 api-proxy** 转发：

```javascript
wx.cloud.callFunction({
  name: 'api-proxy',
  data: {
    method: 'GET',
    path: '/api/v1/recipes',
    query: { page: 1, limit: 10 },
    headers: {
      'Authorization': 'Bearer <token>'
    }
  }
});
```

#### 响应格式

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": { /* 实际数据 */ },
  "timestamp": "2024-10-16T12:00:00.000Z"
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "错误信息",
  "error": "BadRequest",
  "timestamp": "2024-10-16T12:00:00.000Z"
}
```

#### 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或token过期） |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

---

### 核心接口列表

#### 🔐 认证接口

| 接口 | 方法 | 说明 | 需要登录 |
|------|------|------|----------|
| `/auth/wx-login` | POST | 微信登录 | ❌ |
| `/auth/refresh` | POST | 刷新Token | ✅ |
| `/auth/logout` | POST | 退出登录 | ✅ |

#### 👤 用户接口

| 接口 | 方法 | 说明 | 需要登录 |
|------|------|------|----------|
| `/users/me` | GET | 获取当前用户信息 | ✅ |
| `/users/me` | PATCH | 更新用户信息 | ✅ |
| `/users/me/favorites` | GET | 获取我的收藏 | ✅ |
| `/users/:id/recipes` | GET | 获取用户的食谱 | ❌ |
| `/users/:id/stats` | GET | 获取用户统计 | ❌ |

#### 🍳 食谱接口

| 接口 | 方法 | 说明 | 需要登录 |
|------|------|------|----------|
| `/recipes` | GET | 获取食谱列表 | ❌ |
| `/recipes/:id` | GET | 获取食谱详情 | ❌ |
| `/recipes` | POST | 创建食谱 | ✅ |
| `/recipes/:id` | PATCH | 更新食谱 | ✅ |
| `/recipes/:id` | DELETE | 删除食谱 | ✅ |
| `/recipes/:id/like` | POST | 点赞/取消点赞 | ✅ |
| `/recipes/:id/favorite` | POST | 收藏/取消收藏 | ✅ |
| `/recipes/:id/view` | POST | 增加浏览量 | ❌ |

#### 📂 分类接口

| 接口 | 方法 | 说明 | 需要登录 |
|------|------|------|----------|
| `/categories` | GET | 获取所有分类 | ❌ |
| `/categories/:id` | GET | 获取分类详情 | ❌ |

#### 💬 评论接口

| 接口 | 方法 | 说明 | 需要登录 |
|------|------|------|----------|
| `/recipes/:id/comments` | GET | 获取食谱评论 | ❌ |
| `/recipes/:id/comments` | POST | 发表评论 | ✅ |
| `/comments/:id` | DELETE | 删除评论 | ✅ |
| `/comments/:id/like` | POST | 点赞评论 | ✅ |

#### 🔍 搜索接口

| 接口 | 方法 | 说明 | 需要登录 |
|------|------|------|----------|
| `/search/recipes` | GET | 搜索食谱 | ❌ |
| `/search/hot-keywords` | GET | 获取热门搜索词 | ❌ |
| `/search/suggestions` | GET | 获取搜索建议 | ❌ |

#### 🛒 购物清单接口

| 接口 | 方法 | 说明 | 需要登录 |
|------|------|------|----------|
| `/shopping-list` | GET | 获取购物清单 | ✅ |
| `/shopping-list` | POST | 添加清单项 | ✅ |
| `/shopping-list/:id` | PATCH | 更新清单项 | ✅ |
| `/shopping-list/:id` | DELETE | 删除清单项 | ✅ |

---

## ⚠️ 重要注意事项

### 1. wx.getUserProfile 必须由用户主动触发

❌ **错误做法**：
```javascript
// 在 onLoad 中自动调用
onLoad() {
  wechatAuth.wechatLogin(); // 会失败！
}
```

✅ **正确做法**：
```javascript
// 绑定到按钮点击事件
<button bindtap="handleLogin">登录</button>

handleLogin() {
  wechatAuth.wechatLogin(); // OK
}
```

### 2. Token 存储

- Token 存储在 `wx.storage` 中
- Key: `access_token`
- 有效期: 7天
- 过期后需要重新登录或刷新token

### 3. 图片域名配置

需要在**微信公众平台**配置以下域名：

**downloadFile合法域名**：
```
https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com
```

**uploadFile合法域名**：
```
https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com
https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com
```

### 4. 云函数配置

确保已部署云函数 `api-proxy`，配置位于：
```
cloudfunctions/api-proxy/
```

---

## 🐛 常见问题

### Q1: 登录时报错 "fail auth deny"

**原因**：wx.getUserProfile 没有在用户主动操作中调用

**解决**：确保登录方法绑定到按钮的 `bindtap` 事件

---

### Q2: 图片无法显示

**原因**：
1. 未配置 downloadFile 合法域名
2. 图片URL格式错误

**解决**：
1. 在微信公众平台配置合法域名
2. 使用 `cdn.js` 工具处理图片URL

---

### Q3: API请求返回401

**原因**：
1. 未登录
2. Token过期

**解决**：
```javascript
// 方法1：检查登录状态
if (!wechatAuth.checkLoginStatus()) {
  wx.navigateTo({ url: '/pages/login/login' });
  return;
}

// 方法2：刷新Token
wechatAuth.refreshToken()
  .then(() => {
    // 刷新成功，重试请求
  })
  .catch(() => {
    // 刷新失败，跳转登录页
    wx.reLaunch({ url: '/pages/login/login' });
  });
```

---

### Q4: 云函数调用失败

**原因**：
1. 云函数未部署
2. 云函数名称错误
3. 小程序未初始化云开发

**解决**：
```javascript
// 在 app.js 中初始化云开发
App({
  onLaunch() {
    wx.cloud.init({
      env: 'your-env-id', // 替换为您的环境ID
      traceUser: true
    });
  }
});
```

---

## 📋 开发检查清单

### 环境配置

- [ ] 复制4个核心文件到 `utils` 目录
- [ ] 在 `app.js` 中初始化云开发
- [ ] 部署云函数 `api-proxy`
- [ ] 配置小程序合法域名

### 登录功能

- [ ] 创建登录页面
- [ ] 登录按钮绑定到 `bindtap` 事件
- [ ] 测试登录流程
- [ ] 测试退出登录

### API调用

- [ ] 使用 `api.js` 调用接口
- [ ] 处理401错误（未登录）
- [ ] 处理网络错误
- [ ] 添加loading提示

### 图片处理

- [ ] 使用 `cdn.js` 处理图片URL
- [ ] 添加占位图
- [ ] 添加默认图
- [ ] 测试图片加载

---

## 💡 最佳实践

### 1. 统一错误处理

创建 `utils/error-handler.js`：

```javascript
function handleApiError(error) {
  if (error.message.includes('未登录')) {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/login/login' });
        }
      }
    });
  } else if (error.message.includes('网络')) {
    wx.showToast({ title: '网络错误', icon: 'none' });
  } else {
    wx.showToast({ title: error.message, icon: 'none' });
  }
}

module.exports = { handleApiError };
```

### 2. 页面加载模板

```javascript
const api = require('../../utils/api.js');
const wechatAuth = require('../../utils/wechat-login.js');
const { handleApiError } = require('../../utils/error-handler.js');

Page({
  data: {
    isLoading: true,
    dataList: []
  },

  onLoad() {
    this.checkLoginAndLoad();
  },

  // 检查登录并加载数据
  checkLoginAndLoad() {
    if (!wechatAuth.checkLoginStatus()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    
    this.loadData();
  },

  // 加载数据
  loadData() {
    this.setData({ isLoading: true });
    
    api.getRecipeList({ page: 1, limit: 10 })
      .then(res => {
        this.setData({
          dataList: res.data,
          isLoading: false
        });
      })
      .catch(error => {
        this.setData({ isLoading: false });
        handleApiError(error);
      });
  }
});
```

### 3. 下拉刷新和上拉加载

```javascript
Page({
  data: {
    page: 1,
    hasMore: true,
    dataList: []
  },

  onLoad() {
    this.loadData();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1, dataList: [] });
    this.loadData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.loadData();
    }
  },

  loadData() {
    return api.getRecipeList({
      page: this.data.page,
      limit: 10
    })
      .then(res => {
        const newList = this.data.dataList.concat(res.data);
        this.setData({
          dataList: newList,
          hasMore: res.data.length >= 10
        });
      });
  }
});
```

---

## 📞 技术支持

如有问题，请联系后端开发团队或查看完整文档：

- **后端API文档**：`后端API开发文档.md`
- **项目架构文档**：`项目架构文档.md`
- **微信登录详细指南**：`微信原生小程序登录集成指南.md`

---

## ✅ 总结

### 需要交付给前端的文件

**必需文件（4个）**：
1. ✅ `wechat-login.js` - 微信登录核心
2. ✅ `cloudRequest.js` - 云函数请求
3. ✅ `api.js` - API封装
4. ✅ `cdn.js` - CDN配置

**示例文件（3个）**：
5. `wechat-login-page-example.js` - 登录页面示例
6. `wechat-login-page-example.wxml` - 登录页面结构
7. `wechat-login-page-example.wxss` - 登录页面样式

### 核心功能

✅ **微信登录**：一键登录，自动注册
✅ **Token管理**：自动保存，自动刷新
✅ **API调用**：所有接口已封装
✅ **图片处理**：自动处理CDN URL
✅ **错误处理**：统一错误提示

### 快速开始

1. 复制4个核心文件到 `utils` 目录
2. 创建登录页面
3. 在其他页面中使用 `api.js` 调用接口
4. 使用 `cdn.js` 处理图片
5. 开始开发！

---

**文档版本**: v1.0.0  
**最后更新**: 2024-10-16  
**作者**: CookTip 后端团队

