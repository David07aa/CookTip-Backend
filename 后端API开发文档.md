# CookTip 后端 API 开发文档

## 文档信息

- **项目名称**：CookTip 美食菜谱小程序
- **后端框架**：Nest.js (Node.js + TypeScript)
- **数据库**：SQLPub MySQL
- **API 版本**：v1.0
- **Base URL**：`https://your-domain.com/api/v1`
- **认证方式**：JWT Token

---

## 目录

- [1. 认证模块](#1-认证模块)
- [2. 用户模块](#2-用户模块)
- [3. 食谱模块](#3-食谱模块)
- [4. 评论模块](#4-评论模块)
- [5. 收藏模块](#5-收藏模块)
- [6. 搜索模块](#6-搜索模块)
- [7. 购物清单模块](#7-购物清单模块)
- [8. 分类模块](#8-分类模块)
- [9. 文件上传模块](#9-文件上传模块)
- [10. 统计模块](#10-统计模块)

---

## API 接口总览

### 接口列表汇总

| 模块 | 接口数量 | 是否需要认证 |
|------|---------|-------------|
| 认证模块 | 3个 | 部分需要 |
| 用户模块 | 5个 | 需要 |
| 食谱模块 | 8个 | 部分需要 |
| 评论模块 | 5个 | 部分需要 |
| 收藏模块 | 4个 | 需要 |
| 搜索模块 | 3个 | 不需要 |
| 购物清单模块 | 5个 | 需要 |
| 分类模块 | 2个 | 不需要 |
| 文件上传模块 | 2个 | 需要 |
| 统计模块 | 3个 | 部分需要 |
| **总计** | **40个** | - |

---

## 通用说明

### 请求头（Headers）

```http
Content-Type: application/json
Authorization: Bearer {access_token}  # 需要认证的接口
```

### 统一响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 具体数据
  }
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "error": "详细错误描述"
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或过期） |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 1. 认证模块

### 1.1 微信登录

**接口描述**：使用微信小程序 code 换取用户信息和 Token

**请求方式**：`POST`

**接口路径**：`/auth/wechat-login`

**请求参数**：

```json
{
  "code": "string",        // 微信登录凭证
  "nickname": "string",    // 用户昵称（可选）
  "avatar": "string"       // 用户头像 URL（可选）
}
```

**返回数据**：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 604800,
    "user": {
      "id": 1,
      "openid": "o6_bmjrPTlm6_2sgVt7hMZOPfL2M",
      "nickname": "美食爱好者",
      "avatar": "https://example.com/avatar.jpg",
      "created_at": "2025-01-08T10:00:00Z"
    }
  }
}
```

---

### 1.2 刷新 Token

**接口描述**：刷新过期的访问令牌

**请求方式**：`POST`

**接口路径**：`/auth/refresh`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "Token 刷新成功",
  "data": {
    "access_token": "new_token_here",
    "expires_in": 604800
  }
}
```

---

### 1.3 退出登录

**接口描述**：用户退出登录，清除 Token

**请求方式**：`POST`

**接口路径**：`/auth/logout`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "退出成功"
}
```

---

## 2. 用户模块

### 2.1 获取当前用户信息

**接口描述**：获取当前登录用户的详细信息

**请求方式**：`GET`

**接口路径**：`/users/me`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "o6_bmjrPTlm6_2sgVt7hMZOPfL2M",
    "nickname": "美食爱好者",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "热爱烹饪，分享美食",
    "recipe_count": 15,
    "follower_count": 120,
    "following_count": 80,
    "favorite_count": 45,
    "created_at": "2025-01-08T10:00:00Z"
  }
}
```

---

### 2.2 更新用户信息

**接口描述**：更新用户个人资料

**请求方式**：`PATCH`

**接口路径**：`/users/me`

**请求头**：需要 Authorization

**请求参数**：

```json
{
  "nickname": "新昵称",
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "个人简介"
}
```

**返回数据**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "nickname": "新昵称",
    "avatar": "https://example.com/new-avatar.jpg",
    "bio": "个人简介"
  }
}
```

---

### 2.3 获取用户食谱列表

**接口描述**：获取指定用户发布的食谱列表

**请求方式**：`GET`

**接口路径**：`/users/:userId/recipes`

**请求头**：可选 Authorization

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 10 |
| status | string | 否 | 状态：published/draft |

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "红烧肉",
        "cover_image": "https://example.com/cover.jpg",
        "description": "经典家常菜",
        "difficulty": "简单",
        "cook_time": 60,
        "likes": 120,
        "favorites": 45,
        "created_at": "2025-01-08T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10,
    "total_pages": 2
  }
}
```

---

### 2.4 获取用户收藏列表

**接口描述**：获取用户收藏的食谱列表

**请求方式**：`GET`

**接口路径**：`/users/me/favorites`

**请求头**：需要 Authorization

**查询参数**：同食谱列表

**返回数据**：同食谱列表格式

---

### 2.5 获取用户统计数据

**接口描述**：获取用户的统计信息

**请求方式**：`GET`

**接口路径**：`/users/:userId/stats`

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "recipe_count": 15,
    "total_likes": 1200,
    "total_favorites": 450,
    "total_views": 5000,
    "follower_count": 120,
    "following_count": 80
  }
}
```

---

## 3. 食谱模块

### 3.1 获取食谱列表

**接口描述**：获取食谱列表（支持筛选和排序）

**请求方式**：`GET`

**接口路径**：`/recipes`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 10 |
| category_id | number | 否 | 分类 ID |
| difficulty | string | 否 | 难度：超简单/简单/中等/困难 |
| cook_time | number | 否 | 烹饪时间（分钟） |
| sort | string | 否 | 排序：latest/hot/popular |
| tag | string | 否 | 标签筛选 |

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "nickname": "美食爱好者",
          "avatar": "https://example.com/avatar.jpg"
        },
        "title": "红烧肉",
        "cover_image": "https://example.com/cover.jpg",
        "description": "经典家常菜，肥而不腻",
        "difficulty": "简单",
        "cook_time": 60,
        "servings": 4,
        "tags": ["中餐", "家常菜", "下饭菜"],
        "likes": 120,
        "favorites": 45,
        "comments": 23,
        "views": 1500,
        "created_at": "2025-01-08T10:00:00Z",
        "is_liked": false,
        "is_favorited": false
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 10,
    "total_pages": 15
  }
}
```

---

### 3.2 获取食谱详情

**接口描述**：获取食谱的详细信息

**请求方式**：`GET`

**接口路径**：`/recipes/:id`

**请求头**：可选 Authorization（用于判断是否已点赞/收藏）

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "user": {
      "id": 1,
      "nickname": "美食爱好者",
      "avatar": "https://example.com/avatar.jpg"
    },
    "title": "红烧肉",
    "cover_image": "https://example.com/cover.jpg",
    "description": "经典家常菜，肥而不腻",
    "difficulty": "简单",
    "cook_time": 60,
    "servings": 4,
    "taste": "咸鲜",
    "tags": ["中餐", "家常菜", "下饭菜"],
    "ingredients": [
      {
        "name": "五花肉",
        "amount": "500克"
      },
      {
        "name": "冰糖",
        "amount": "30克"
      }
    ],
    "steps": [
      {
        "step": 1,
        "description": "五花肉切块，冷水下锅焯水",
        "image": "https://example.com/step1.jpg",
        "tips": "焯水时加入料酒和姜片去腥"
      }
    ],
    "tips": "烹饪小贴士...",
    "nutrition": {
      "calories": 450,
      "protein": 25,
      "fat": 35,
      "carbs": 10
    },
    "likes": 120,
    "favorites": 45,
    "comments": 23,
    "views": 1500,
    "is_liked": false,
    "is_favorited": false,
    "created_at": "2025-01-08T10:00:00Z",
    "updated_at": "2025-01-08T10:00:00Z"
  }
}
```

---

### 3.3 创建食谱

**接口描述**：发布新食谱

**请求方式**：`POST`

**接口路径**：`/recipes`

**请求头**：需要 Authorization

**请求参数**：

```json
{
  "title": "红烧肉",
  "cover_image": "https://example.com/cover.jpg",
  "description": "经典家常菜",
  "difficulty": "简单",
  "cook_time": 60,
  "servings": 4,
  "taste": "咸鲜",
  "tags": ["中餐", "家常菜"],
  "ingredients": [
    {
      "name": "五花肉",
      "amount": "500克"
    }
  ],
  "steps": [
    {
      "step": 1,
      "description": "五花肉切块",
      "image": "https://example.com/step1.jpg",
      "tips": "焯水时加入料酒"
    }
  ],
  "tips": "烹饪小贴士",
  "status": "published"  // published 或 draft
}
```

**返回数据**：

```json
{
  "code": 201,
  "message": "食谱创建成功",
  "data": {
    "id": 1,
    "title": "红烧肉",
    "status": "published",
    "created_at": "2025-01-08T10:00:00Z"
  }
}
```

---

### 3.4 更新食谱

**接口描述**：更新已发布的食谱

**请求方式**：`PATCH`

**接口路径**：`/recipes/:id`

**请求头**：需要 Authorization

**请求参数**：同创建食谱（可部分更新）

**返回数据**：

```json
{
  "code": 200,
  "message": "食谱更新成功",
  "data": {
    "id": 1,
    "title": "红烧肉（改进版）",
    "updated_at": "2025-01-08T12:00:00Z"
  }
}
```

---

### 3.5 删除食谱

**接口描述**：删除自己发布的食谱

**请求方式**：`DELETE`

**接口路径**：`/recipes/:id`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "食谱删除成功"
}
```

---

### 3.6 点赞/取消点赞食谱

**接口描述**：对食谱进行点赞或取消点赞

**请求方式**：`POST`

**接口路径**：`/recipes/:id/like`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "is_liked": true,
    "likes": 121
  }
}
```

---

### 3.7 收藏/取消收藏食谱

**接口描述**：收藏或取消收藏食谱

**请求方式**：`POST`

**接口路径**：`/recipes/:id/favorite`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "is_favorited": true,
    "favorites": 46
  }
}
```

---

### 3.8 增加食谱浏览量

**接口描述**：记录食谱浏览（用于统计）

**请求方式**：`POST`

**接口路径**：`/recipes/:id/view`

**请求头**：可选 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "浏览记录成功",
  "data": {
    "views": 1501
  }
}
```

---

## 4. 评论模块

### 4.1 获取食谱评论列表

**接口描述**：获取指定食谱的评论列表

**请求方式**：`GET`

**接口路径**：`/recipes/:recipeId/comments`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 10 |
| sort | string | 否 | 排序：latest/hot |

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "user": {
          "id": 2,
          "nickname": "美食评论家",
          "avatar": "https://example.com/avatar2.jpg"
        },
        "content": "做得很成功，味道很棒！",
        "images": [
          "https://example.com/comment1.jpg"
        ],
        "likes": 15,
        "is_liked": false,
        "created_at": "2025-01-08T11:00:00Z"
      }
    ],
    "total": 23,
    "page": 1,
    "limit": 10,
    "total_pages": 3
  }
}
```

---

### 4.2 发表评论

**接口描述**：对食谱发表评论

**请求方式**：`POST`

**接口路径**：`/recipes/:recipeId/comments`

**请求头**：需要 Authorization

**请求参数**：

```json
{
  "content": "做得很成功，味道很棒！",
  "images": [
    "https://example.com/comment1.jpg"
  ]
}
```

**返回数据**：

```json
{
  "code": 201,
  "message": "评论成功",
  "data": {
    "id": 1,
    "content": "做得很成功，味道很棒！",
    "created_at": "2025-01-08T11:00:00Z"
  }
}
```

---

### 4.3 删除评论

**接口描述**：删除自己的评论

**请求方式**：`DELETE`

**接口路径**：`/comments/:id`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "评论删除成功"
}
```

---

### 4.4 点赞/取消点赞评论

**接口描述**：对评论进行点赞或取消点赞

**请求方式**：`POST`

**接口路径**：`/comments/:id/like`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "is_liked": true,
    "likes": 16
  }
}
```

---

### 4.5 回复评论

**接口描述**：回复某条评论

**请求方式**：`POST`

**接口路径**：`/comments/:id/reply`

**请求头**：需要 Authorization

**请求参数**：

```json
{
  "content": "谢谢你的点评！"
}
```

**返回数据**：

```json
{
  "code": 201,
  "message": "回复成功",
  "data": {
    "id": 2,
    "parent_id": 1,
    "content": "谢谢你的点评！",
    "created_at": "2025-01-08T11:30:00Z"
  }
}
```

---

## 5. 收藏模块

### 5.1 获取收藏列表

**接口描述**：获取用户的收藏食谱列表

**请求方式**：`GET`

**接口路径**：`/favorites`

**请求头**：需要 Authorization

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 10 |
| folder_id | number | 否 | 收藏夹 ID（未来扩展） |

**返回数据**：同食谱列表格式

---

### 5.2 添加收藏

**接口描述**：收藏一个食谱

**请求方式**：`POST`

**接口路径**：`/favorites`

**请求头**：需要 Authorization

**请求参数**：

```json
{
  "recipe_id": 1
}
```

**返回数据**：

```json
{
  "code": 201,
  "message": "收藏成功",
  "data": {
    "id": 1,
    "recipe_id": 1,
    "created_at": "2025-01-08T12:00:00Z"
  }
}
```

---

### 5.3 取消收藏

**接口描述**：取消收藏某个食谱

**请求方式**：`DELETE`

**接口路径**：`/favorites/:recipeId`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "取消收藏成功"
}
```

---

### 5.4 检查收藏状态

**接口描述**：批量检查食谱的收藏状态

**请求方式**：`POST`

**接口路径**：`/favorites/check`

**请求头**：需要 Authorization

**请求参数**：

```json
{
  "recipe_ids": [1, 2, 3, 4, 5]
}
```

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "1": true,
    "2": false,
    "3": true,
    "4": false,
    "5": true
  }
}
```

---

## 6. 搜索模块

### 6.1 搜索食谱

**接口描述**：根据关键词搜索食谱

**请求方式**：`GET`

**接口路径**：`/search/recipes`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 10 |
| category_id | number | 否 | 分类筛选 |
| difficulty | string | 否 | 难度筛选 |
| sort | string | 否 | 排序方式 |

**返回数据**：同食谱列表格式

---

### 6.2 获取热门搜索词

**接口描述**：获取热门搜索关键词列表

**请求方式**：`GET`

**接口路径**：`/search/hot-keywords`

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "keyword": "红烧肉",
      "count": 1500
    },
    {
      "keyword": "蛋糕",
      "count": 1200
    }
  ]
}
```

---

### 6.3 获取搜索建议

**接口描述**：根据输入获取搜索建议

**请求方式**：`GET`

**接口路径**：`/search/suggestions`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 输入的关键词 |
| limit | number | 否 | 返回数量，默认 10 |

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    "红烧肉",
    "红烧排骨",
    "红烧鱼"
  ]
}
```

---

## 7. 购物清单模块

### 7.1 获取购物清单

**接口描述**：获取用户的购物清单

**请求方式**：`GET`

**接口路径**：`/shopping-list`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "五花肉",
        "amount": "500克",
        "checked": false,
        "category": "肉类",
        "recipe_id": 1,
        "recipe_title": "红烧肉",
        "created_at": "2025-01-08T10:00:00Z"
      }
    ],
    "total": 10,
    "checked_count": 3
  }
}
```

---

### 7.2 添加购物清单项

**接口描述**：添加一个或多个购物清单项

**请求方式**：`POST`

**接口路径**：`/shopping-list`

**请求头**：需要 Authorization

**请求参数**：

```json
{
  "items": [
    {
      "name": "五花肉",
      "amount": "500克",
      "category": "肉类",
      "recipe_id": 1
    }
  ]
}
```

**返回数据**：

```json
{
  "code": 201,
  "message": "添加成功",
  "data": {
    "added_count": 1
  }
}
```

---

### 7.3 更新购物清单项

**接口描述**：更新购物清单项（勾选/取消勾选）

**请求方式**：`PATCH`

**接口路径**：`/shopping-list/:id`

**请求头**：需要 Authorization

**请求参数**：

```json
{
  "checked": true,
  "amount": "600克"
}
```

**返回数据**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "checked": true
  }
}
```

---

### 7.4 删除购物清单项

**接口描述**：删除一个或多个购物清单项

**请求方式**：`DELETE`

**接口路径**：`/shopping-list`

**请求头**：需要 Authorization

**请求参数**：

```json
{
  "ids": [1, 2, 3]
}
```

**返回数据**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "deleted_count": 3
  }
}
```

---

### 7.5 清空已勾选项

**接口描述**：清空所有已勾选的购物清单项

**请求方式**：`DELETE`

**接口路径**：`/shopping-list/checked`

**请求头**：需要 Authorization

**返回数据**：

```json
{
  "code": 200,
  "message": "清空成功",
  "data": {
    "deleted_count": 5
  }
}
```

---

## 8. 分类模块

### 8.1 获取分类列表

**接口描述**：获取所有食谱分类

**请求方式**：`GET`

**接口路径**：`/categories`

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "中餐",
      "icon": "https://example.com/icon-chinese.png",
      "recipe_count": 150,
      "sort_order": 1
    },
    {
      "id": 2,
      "name": "西餐",
      "icon": "https://example.com/icon-western.png",
      "recipe_count": 80,
      "sort_order": 2
    }
  ]
}
```

---

### 8.2 获取分类详情

**接口描述**：获取指定分类的详细信息和食谱

**请求方式**：`GET`

**接口路径**：`/categories/:id`

**查询参数**：同食谱列表

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "中餐",
    "icon": "https://example.com/icon-chinese.png",
    "description": "传统中式美食",
    "recipe_count": 150,
    "recipes": {
      "items": [],
      "total": 150,
      "page": 1,
      "limit": 10
    }
  }
}
```

---

## 9. 文件上传模块

### 9.1 上传图片

**接口描述**：上传单张图片（食谱封面、步骤图等）

**请求方式**：`POST`

**接口路径**：`/upload/image`

**请求头**：需要 Authorization

**请求参数**：

```http
Content-Type: multipart/form-data

file: (binary)
type: cover | step | comment | avatar
```

**返回数据**：

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/images/abc123.jpg",
    "thumbnail": "https://cdn.example.com/images/abc123_thumb.jpg",
    "size": 245678,
    "width": 1920,
    "height": 1080
  }
}
```

---

### 9.2 批量上传图片

**接口描述**：批量上传多张图片

**请求方式**：`POST`

**接口路径**：`/upload/images`

**请求头**：需要 Authorization

**请求参数**：

```http
Content-Type: multipart/form-data

files: (binary[])
type: step | comment
```

**返回数据**：

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "images": [
      {
        "url": "https://cdn.example.com/images/abc123.jpg",
        "thumbnail": "https://cdn.example.com/images/abc123_thumb.jpg"
      },
      {
        "url": "https://cdn.example.com/images/def456.jpg",
        "thumbnail": "https://cdn.example.com/images/def456_thumb.jpg"
      }
    ],
    "total": 2
  }
}
```

---

## 10. 统计模块

### 10.1 获取首页推荐数据

**接口描述**：获取首页展示的推荐食谱和分类

**请求方式**：`GET`

**接口路径**：`/home/feed`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 10 |

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "banners": [
      {
        "id": 1,
        "image": "https://example.com/banner1.jpg",
        "link": "/recipes/1"
      }
    ],
    "categories": [],
    "hot_recipes": [],
    "latest_recipes": [],
    "recommended_recipes": []
  }
}
```

---

### 10.2 获取热门食谱

**接口描述**：获取热门食谱列表

**请求方式**：`GET`

**接口路径**：`/stats/hot-recipes`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 数量，默认 10 |
| period | string | 否 | 时间段：today/week/month |

**返回数据**：同食谱列表格式

---

### 10.3 获取平台统计数据

**接口描述**：获取平台整体统计数据（管理员用）

**请求方式**：`GET`

**接口路径**：`/stats/overview`

**请求头**：需要 Authorization（管理员）

**返回数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total_users": 5000,
    "total_recipes": 1500,
    "total_comments": 8000,
    "daily_active_users": 500,
    "new_users_today": 50,
    "new_recipes_today": 20
  }
}
```

---

## 数据库表结构设计

### users（用户表）

```sql
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `openid` VARCHAR(100) UNIQUE NOT NULL COMMENT '微信OpenID',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `bio` VARCHAR(200) COMMENT '个人简介',
  `recipe_count` INT DEFAULT 0 COMMENT '发布食谱数',
  `follower_count` INT DEFAULT 0 COMMENT '粉丝数',
  `following_count` INT DEFAULT 0 COMMENT '关注数',
  `favorite_count` INT DEFAULT 0 COMMENT '收藏数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### recipes（食谱表）

```sql
CREATE TABLE `recipes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '作者ID',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `cover_image` VARCHAR(255) COMMENT '封面图',
  `description` TEXT COMMENT '简介',
  `difficulty` VARCHAR(20) COMMENT '难度',
  `cook_time` INT COMMENT '烹饪时间（分钟）',
  `servings` INT COMMENT '份量',
  `taste` VARCHAR(20) COMMENT '口味',
  `ingredients` JSON COMMENT '食材列表',
  `steps` JSON COMMENT '步骤列表',
  `tips` TEXT COMMENT '小贴士',
  `tags` JSON COMMENT '标签',
  `nutrition` JSON COMMENT '营养信息',
  `likes` INT DEFAULT 0 COMMENT '点赞数',
  `favorites` INT DEFAULT 0 COMMENT '收藏数',
  `comments` INT DEFAULT 0 COMMENT '评论数',
  `views` INT DEFAULT 0 COMMENT '浏览量',
  `status` VARCHAR(20) DEFAULT 'published' COMMENT '状态：published/draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_status (`status`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食谱表';
```

### comments（评论表）

```sql
CREATE TABLE `comments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `recipe_id` INT NOT NULL COMMENT '食谱ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `parent_id` INT DEFAULT NULL COMMENT '父评论ID（回复）',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `images` JSON COMMENT '评论图片',
  `likes` INT DEFAULT 0 COMMENT '点赞数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
  INDEX idx_recipe_id (`recipe_id`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';
```

### favorites（收藏表）

```sql
CREATE TABLE `favorites` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `recipe_id` INT NOT NULL COMMENT '食谱ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_recipe` (`user_id`, `recipe_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
  INDEX idx_user_id (`user_id`),
  INDEX idx_recipe_id (`recipe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';
```

### likes（点赞表）

```sql
CREATE TABLE `likes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `target_type` VARCHAR(20) NOT NULL COMMENT '点赞目标类型：recipe/comment',
  `target_id` INT NOT NULL COMMENT '目标ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_target` (`user_id`, `target_type`, `target_id`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_target (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';
```

### shopping_list（购物清单表）

```sql
CREATE TABLE `shopping_list` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '物品名称',
  `amount` VARCHAR(50) COMMENT '数量',
  `category` VARCHAR(20) COMMENT '分类',
  `checked` BOOLEAN DEFAULT FALSE COMMENT '是否已购买',
  `recipe_id` INT COMMENT '关联食谱ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE SET NULL,
  INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物清单表';
```

### categories（分类表）

```sql
CREATE TABLE `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(255) COMMENT '图标URL',
  `description` VARCHAR(200) COMMENT '描述',
  `recipe_count` INT DEFAULT 0 COMMENT '食谱数量',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';
```

---

## 开发优先级建议

### Phase 1：核心功能（Week 1-2）
- ✅ 认证模块（微信登录）
- ✅ 用户模块（基础信息）
- ✅ 食谱模块（CRUD）
- ✅ 文件上传

### Phase 2：社交功能（Week 3-4）
- ✅ 评论模块
- ✅ 点赞/收藏功能
- ✅ 搜索功能

### Phase 3：辅助功能（Week 5-6）
- ✅ 购物清单
- ✅ 分类管理
- ✅ 统计数据

### Phase 4：优化功能（Week 7-8）
- ✅ 性能优化
- ✅ 缓存策略
- ✅ 数据统计

---

## 接口开发注意事项

### 1. 安全性
- ✅ 所有需要认证的接口必须验证 JWT Token
- ✅ 使用参数验证（class-validator）
- ✅ 防止 SQL 注入（使用 ORM）
- ✅ XSS 防护（内容过滤）
- ✅ 限流保护（Rate Limiting）

### 2. 性能优化
- ✅ 使用 Redis 缓存热门数据
- ✅ 数据库查询优化（索引）
- ✅ 分页查询（避免全表扫描）
- ✅ 图片 CDN 加速
- ✅ API 响应压缩

### 3. 错误处理
- ✅ 统一异常处理
- ✅ 友好的错误提示
- ✅ 错误日志记录
- ✅ 异常监控

### 4. 文档维护
- ✅ 使用 Swagger 自动生成 API 文档
- ✅ 接口变更及时更新文档
- ✅ 提供接口调用示例
- ✅ 版本控制

---

## 测试清单

### 单元测试
- [ ] 认证服务测试
- [ ] 用户服务测试
- [ ] 食谱服务测试
- [ ] 评论服务测试

### 集成测试
- [ ] API 端到端测试
- [ ] 数据库事务测试
- [ ] 文件上传测试

### 性能测试
- [ ] 并发测试（500+ QPS）
- [ ] 压力测试
- [ ] 数据库性能测试

---

**文档版本**：v1.0  
**最后更新**：2025-01-08  
**维护者**：CookTip 开发团队  
**联系方式**：3509204288@qq.com

**注意**：本文档会随着开发进度持续更新，请定期查看最新版本。

