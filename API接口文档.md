# 📡 "一家食谱" 后端API接口文档

## 📋 文档说明

- **项目名称**：一家食谱（CookTip）
- **接口版本**：v1.0
- **Base URL**：`https://cooktip-backend.vercel.app/api`
- **文档更新**：2025年9月30日
- **部署状态**：✅ 已部署，数据库已就绪

## ⚠️ 重要提示

**当前状态：95% 完成**

- ✅ **数据库**：Neon PostgreSQL 已配置完成（7张表）
- ✅ **API 框架**：12个 Serverless Functions 已部署
- ⏳ **API 更新**：需要将代码从 MySQL 语法更新为 PostgreSQL 语法
- 📝 **详细待办**：查看 `下一步工作清单.md`

**可用的测试端点：**
- 健康检查：https://cooktip-backend.vercel.app/api/recipes?health=check

**注意：** 本文档描述的是完整的API设计规范。实际开发时，请参考 `项目当前状态.md` 了解当前实现进度

---

## 🔐 通用说明

### 请求头（Request Headers）

所有需要认证的接口都需要携带以下请求头：

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

### 响应格式（Response Format）

所有接口统一返回格式：

```json
{
  "code": 200,          // 状态码：200 成功，其他为错误
  "message": "Success", // 提示信息
  "data": {}           // 返回数据（可能是对象、数组或null）
}
```

### 错误码（Error Codes）

| Code | Message | 说明 |
|------|---------|------|
| 200 | Success | 请求成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权，token 无效或过期 |
| 403 | Forbidden | 禁止访问 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

---

## 1️⃣ 用户模块（User）

### 1.1 微信登录

**接口说明**：使用微信 code 换取 token

**请求方式**：`POST`

**接口路径**：`/auth/wechat/login`

**请求参数**：
```json
{
  "code": "081xYxGa1eJETE0BZDJa1g0NWc1xYxGR",
  "userInfo": {
    "nickName": "张三",
    "avatarUrl": "https://...",
    "gender": 1,        // 0未知，1男，2女
    "country": "China",
    "province": "Guangdong",
    "city": "Shenzhen"
  }
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "user_123456",
    "nickName": "张三",
    "avatarUrl": "https://...",
    "isNewUser": false
  }
}
```

---

### 1.2 获取用户信息

**接口说明**：获取当前登录用户的详细信息

**请求方式**：`GET`

**接口路径**：`/user/info`

**请求参数**：无（从 token 中获取用户 ID）

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "userId": "user_123456",
    "nickName": "张三",
    "avatarUrl": "https://...",
    "gender": 1,
    "bio": "热爱烹饪的美食家",
    "recipeCount": 15,      // 发布的食谱数
    "followCount": 120,     // 关注数
    "fansCount": 89,        // 粉丝数
    "collectCount": 45,     // 收藏数
    "likeCount": 230,       // 获赞数
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### 1.3 更新用户信息

**请求方式**：`PUT`

**接口路径**：`/user/info`

**请求参数**：
```json
{
  "nickName": "李四",
  "avatarUrl": "https://...",
  "bio": "美食探索者"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 1.4 获取用户发布的食谱

**请求方式**：`GET`

**接口路径**：`/user/recipes`

**请求参数**：
```
userId: string (可选，不传则获取当前用户)
page: number (默认1)
pageSize: number (默认10)
status: string (可选：draft草稿，published已发布，all全部)
```

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "recipeId": "recipe_001",
        "title": "宫保鸡丁",
        "coverImage": "https://...",
        "viewCount": 1520,
        "likeCount": 89,
        "collectCount": 45,
        "status": "published",
        "createdAt": "2025-09-20T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 2️⃣ 食谱模块（Recipe）

### 2.1 获取食谱列表

**接口说明**：首页食谱列表，支持分页和筛选

**请求方式**：`GET`

**接口路径**：`/recipes`

**请求参数**：
```
page: number (默认1)
pageSize: number (默认10)
category: string (可选，分类：中餐、西餐、日料等)
difficulty: string (可选：简单、中等、困难)
cookTime: number (可选，烹饪时间：≤30、≤60、≤90、>90)
sort: string (可选：latest最新、hot最热、recommend推荐)
```

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "recipeId": "recipe_001",
        "title": "宫保鸡丁",
        "description": "经典川菜，麻辣鲜香",
        "coverImage": "https://...",
        "author": {
          "userId": "user_123",
          "nickName": "张三",
          "avatarUrl": "https://..."
        },
        "category": "中餐",
        "difficulty": "中等",
        "cookTime": 30,
        "servings": 2,
        "viewCount": 1520,
        "likeCount": 89,
        "collectCount": 45,
        "isLiked": false,
        "isCollected": false,
        "createdAt": "2025-09-20T10:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2.2 获取食谱详情

**请求方式**：`GET`

**接口路径**：`/recipes/:recipeId`

**请求参数**：无（路径参数）

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "recipeId": "recipe_001",
    "title": "宫保鸡丁",
    "description": "经典川菜，麻辣鲜香，是宴席上的常客",
    "coverImage": "https://...",
    "author": {
      "userId": "user_123",
      "nickName": "张三",
      "avatarUrl": "https://..."
    },
    "category": "中餐",
    "difficulty": "中等",
    "cookTime": 30,
    "servings": 2,
    "taste": "香辣",
    "tags": ["川菜", "快手菜", "下饭菜"],
    "ingredients": [
      {
        "name": "鸡胸肉",
        "amount": "200g"
      },
      {
        "name": "花生米",
        "amount": "50g"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "description": "鸡胸肉切丁，加料酒、生抽、淀粉腌制15分钟",
        "image": "https://...",
        "tips": "腌制可以让肉质更嫩"
      },
      {
        "stepNumber": 2,
        "description": "热锅凉油，炒香花椒和干辣椒",
        "image": "https://...",
        "tips": ""
      }
    ],
    "viewCount": 1520,
    "likeCount": 89,
    "collectCount": 45,
    "commentCount": 12,
    "isLiked": false,
    "isCollected": false,
    "createdAt": "2025-09-20T10:00:00Z",
    "updatedAt": "2025-09-20T10:00:00Z"
  }
}
```

---

### 2.3 创建食谱

**接口说明**：发布新食谱

**请求方式**：`POST`

**接口路径**：`/recipes`

**请求参数**：
```json
{
  "title": "宫保鸡丁",
  "description": "经典川菜，麻辣鲜香",
  "coverImage": "https://...",
  "category": "中餐",
  "difficulty": "中等",
  "cookTime": 30,
  "servings": 2,
  "taste": "香辣",
  "tags": ["川菜", "快手菜"],
  "ingredients": [
    {
      "name": "鸡胸肉",
      "amount": "200g"
    }
  ],
  "steps": [
    {
      "description": "鸡胸肉切丁，加料酒、生抽、淀粉腌制15分钟",
      "image": "https://...",
      "tips": "腌制可以让肉质更嫩"
    }
  ],
  "status": "published"  // draft草稿、published发布
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "recipeId": "recipe_001",
    "createdAt": "2025-09-30T12:00:00Z"
  }
}
```

---

### 2.4 更新食谱

**请求方式**：`PUT`

**接口路径**：`/recipes/:recipeId`

**请求参数**：与创建食谱相同（只传需要修改的字段）

**响应数据**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 2.5 删除食谱

**请求方式**：`DELETE`

**接口路径**：`/recipes/:recipeId`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 2.6 增加浏览量

**接口说明**：用户查看食谱详情时调用

**请求方式**：`POST`

**接口路径**：`/recipes/:recipeId/view`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "viewCount": 1521
  }
}
```

---

## 3️⃣ 搜索模块（Search）

### 3.1 搜索食谱

**请求方式**：`GET`

**接口路径**：`/search`

**请求参数**：
```
keyword: string (搜索关键词)
page: number (默认1)
pageSize: number (默认10)
category: string (可选，分类筛选)
difficulty: string (可选，难度筛选)
```

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "recipeId": "recipe_001",
        "title": "宫保鸡丁",
        "description": "经典川菜",
        "coverImage": "https://...",
        "author": {
          "nickName": "张三"
        },
        "likeCount": 89,
        "collectCount": 45
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 3.2 获取搜索历史

**请求方式**：`GET`

**接口路径**：`/search/history`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      "宫保鸡丁",
      "红烧肉",
      "蛋炒饭"
    ]
  }
}
```

---

### 3.3 保存搜索历史

**请求方式**：`POST`

**接口路径**：`/search/history`

**请求参数**：
```json
{
  "keyword": "宫保鸡丁"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": null
}
```

---

### 3.4 清除搜索历史

**请求方式**：`DELETE`

**接口路径**：`/search/history`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "清除成功",
  "data": null
}
```

---

### 3.5 获取热门搜索

**请求方式**：`GET`

**接口路径**：`/search/hot`

**请求参数**：
```
limit: number (默认10)
```

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "keyword": "宫保鸡丁",
        "searchCount": 15200
      },
      {
        "keyword": "红烧肉",
        "searchCount": 12300
      }
    ]
  }
}
```

---

## 4️⃣ 分类模块（Category）

### 4.1 获取分类列表

**请求方式**：`GET`

**接口路径**：`/categories`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "categoryId": "cat_001",
        "name": "中餐",
        "icon": "https://...",
        "recipeCount": 1520
      },
      {
        "categoryId": "cat_002",
        "name": "西餐",
        "icon": "https://...",
        "recipeCount": 890
      }
    ]
  }
}
```

---

## 5️⃣ 收藏模块（Collect）

### 5.1 收藏食谱

**请求方式**：`POST`

**接口路径**：`/collect`

**请求参数**：
```json
{
  "recipeId": "recipe_001"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "collectCount": 46
  }
}
```

---

### 5.2 取消收藏

**请求方式**：`DELETE`

**接口路径**：`/collect/:recipeId`

**请求参数**：无（路径参数）

**响应数据**：
```json
{
  "code": 200,
  "message": "取消收藏",
  "data": {
    "collectCount": 45
  }
}
```

---

### 5.3 获取我的收藏

**请求方式**：`GET`

**接口路径**：`/collect/my`

**请求参数**：
```
page: number (默认1)
pageSize: number (默认10)
```

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "recipeId": "recipe_001",
        "title": "宫保鸡丁",
        "coverImage": "https://...",
        "author": {
          "nickName": "张三"
        },
        "likeCount": 89,
        "collectCount": 45,
        "collectedAt": "2025-09-25T10:00:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 6️⃣ 点赞模块（Like）

### 6.1 点赞食谱

**请求方式**：`POST`

**接口路径**：`/like`

**请求参数**：
```json
{
  "recipeId": "recipe_001"
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "likeCount": 90
  }
}
```

---

### 6.2 取消点赞

**请求方式**：`DELETE`

**接口路径**：`/like/:recipeId`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "取消点赞",
  "data": {
    "likeCount": 89
  }
}
```

---

## 7️⃣ 评论模块（Comment）

### 7.1 获取评论列表

**请求方式**：`GET`

**接口路径**：`/recipes/:recipeId/comments`

**请求参数**：
```
page: number (默认1)
pageSize: number (默认20)
sort: string (latest最新、hot最热)
```

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "commentId": "comment_001",
        "content": "做出来很好吃！",
        "images": ["https://...", "https://..."],
        "author": {
          "userId": "user_456",
          "nickName": "李四",
          "avatarUrl": "https://..."
        },
        "likeCount": 12,
        "isLiked": false,
        "replyCount": 3,
        "replies": [
          {
            "replyId": "reply_001",
            "content": "确实不错",
            "author": {
              "nickName": "王五"
            },
            "createdAt": "2025-09-28T11:00:00Z"
          }
        ],
        "createdAt": "2025-09-25T14:30:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 7.2 发表评论

**请求方式**：`POST`

**接口路径**：`/recipes/:recipeId/comments`

**请求参数**：
```json
{
  "content": "做出来很好吃！",
  "images": ["https://...", "https://..."]
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "评论成功",
  "data": {
    "commentId": "comment_001",
    "createdAt": "2025-09-30T12:00:00Z"
  }
}
```

---

### 7.3 删除评论

**请求方式**：`DELETE`

**接口路径**：`/comments/:commentId`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 7.4 回复评论

**请求方式**：`POST`

**接口路径**：`/comments/:commentId/replies`

**请求参数**：
```json
{
  "content": "确实不错",
  "replyToUserId": "user_456"  // 可选，@某人
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "回复成功",
  "data": {
    "replyId": "reply_001",
    "createdAt": "2025-09-30T12:00:00Z"
  }
}
```

---

## 8️⃣ 购物清单模块（Shopping List）

### 8.1 获取购物清单

**请求方式**：`GET`

**接口路径**：`/shopping-list`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "itemId": "item_001",
        "name": "鸡胸肉",
        "amount": "200g",
        "category": "肉类",
        "checked": false,
        "recipeId": "recipe_001",
        "recipeTitle": "宫保鸡丁",
        "createdAt": "2025-09-28T10:00:00Z"
      },
      {
        "itemId": "item_002",
        "name": "花生米",
        "amount": "50g",
        "category": "干货",
        "checked": true,
        "recipeId": "recipe_001",
        "recipeTitle": "宫保鸡丁",
        "createdAt": "2025-09-28T10:00:00Z"
      }
    ],
    "total": 15,
    "checkedCount": 5
  }
}
```

---

### 8.2 添加到购物清单

**接口说明**：从食谱详情页添加食材到购物清单

**请求方式**：`POST`

**接口路径**：`/shopping-list`

**请求参数**：
```json
{
  "recipeId": "recipe_001",
  "ingredients": [
    {
      "name": "鸡胸肉",
      "amount": "200g",
      "category": "肉类"
    }
  ]
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "addedCount": 5
  }
}
```

---

### 8.3 更新购物清单项状态

**请求方式**：`PUT`

**接口路径**：`/shopping-list/:itemId`

**请求参数**：
```json
{
  "checked": true
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 8.4 删除购物清单项

**请求方式**：`DELETE`

**接口路径**：`/shopping-list/:itemId`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 8.5 清空已购买项

**请求方式**：`DELETE`

**接口路径**：`/shopping-list/checked`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "清空成功",
  "data": {
    "deletedCount": 5
  }
}
```

---

## 9️⃣ 图片上传模块（Upload）

### 9.1 上传图片

**接口说明**：通用图片上传接口

**请求方式**：`POST`

**接口路径**：`/upload/image`

**请求参数**：
```
Content-Type: multipart/form-data

file: File (图片文件)
type: string (类型：cover封面、step步骤、avatar头像、comment评论)
```

**响应数据**：
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.yourdomian.com/images/2025/09/30/xxx.jpg",
    "width": 1920,
    "height": 1080,
    "size": 256000,
    "mimeType": "image/jpeg"
  }
}
```

---

### 9.2 批量上传图片

**请求方式**：`POST`

**接口路径**：`/upload/images`

**请求参数**：
```
Content-Type: multipart/form-data

files: File[] (最多9张)
type: string
```

**响应数据**：
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "list": [
      {
        "url": "https://...",
        "width": 1920,
        "height": 1080
      }
    ],
    "successCount": 3,
    "failCount": 0
  }
}
```

---

## 🔟 草稿模块（Draft）

### 10.1 保存草稿

**请求方式**：`POST`

**接口路径**：`/drafts`

**请求参数**：
```json
{
  "draftId": "draft_001",  // 可选，更新时传
  "title": "宫保鸡丁",
  "coverImage": "https://...",
  "formData": {
    // 完整的表单数据
  }
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "保存成功",
  "data": {
    "draftId": "draft_001",
    "savedAt": "2025-09-30T12:00:00Z"
  }
}
```

---

### 10.2 获取草稿列表

**请求方式**：`GET`

**接口路径**：`/drafts`

**请求参数**：
```
page: number (默认1)
pageSize: number (默认10)
```

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "draftId": "draft_001",
        "title": "宫保鸡丁",
        "coverImage": "https://...",
        "progress": 65,
        "updatedAt": "2025-09-30T12:00:00Z"
      }
    ],
    "total": 3
  }
}
```

---

### 10.3 获取草稿详情

**请求方式**：`GET`

**接口路径**：`/drafts/:draftId`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "draftId": "draft_001",
    "formData": {
      // 完整的表单数据
    },
    "createdAt": "2025-09-28T10:00:00Z",
    "updatedAt": "2025-09-30T12:00:00Z"
  }
}
```

---

### 10.4 删除草稿

**请求方式**：`DELETE`

**接口路径**：`/drafts/:draftId`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 1️⃣1️⃣ 轮播图模块（Banner）

### 11.1 获取轮播图列表

**请求方式**：`GET`

**接口路径**：`/banners`

**请求参数**：
```
position: string (位置：home首页、search搜索页)
```

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "bannerId": "banner_001",
        "image": "https://...",
        "title": "春季特色菜推荐",
        "linkType": "recipe",  // recipe食谱、category分类、url外链
        "linkValue": "recipe_001",
        "sort": 1
      }
    ]
  }
}
```

---

## 1️⃣2️⃣ 标签模块（Tag）

### 12.1 获取推荐标签

**请求方式**：`GET`

**接口路径**：`/tags/recommend`

**请求参数**：无

**响应数据**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "tagId": "tag_001",
        "name": "川菜",
        "recipeCount": 520
      },
      {
        "tagId": "tag_002",
        "name": "快手菜",
        "recipeCount": 890
      }
    ]
  }
}
```

---

## 📊 接口优先级

### P0（核心功能，必须实现）

#### 用户模块
- [x] 微信登录
- [x] 获取用户信息

#### 食谱模块
- [x] 获取食谱列表
- [x] 获取食谱详情
- [x] 创建食谱
- [x] 增加浏览量

#### 搜索模块
- [x] 搜索食谱

#### 分类模块
- [x] 获取分类列表

#### 图片上传
- [x] 上传图片

---

### P1（重要功能，尽快实现）

#### 收藏模块
- [x] 收藏/取消收藏
- [x] 获取我的收藏

#### 点赞模块
- [x] 点赞/取消点赞

#### 购物清单
- [x] 获取购物清单
- [x] 添加到购物清单
- [x] 更新状态

#### 搜索增强
- [x] 搜索历史
- [x] 热门搜索

---

### P2（辅助功能，后期优化）

#### 评论模块
- [x] 评论列表
- [x] 发表评论
- [x] 回复评论

#### 草稿模块
- [x] 保存草稿
- [x] 草稿列表

#### 其他
- [x] 轮播图
- [x] 标签推荐

---

## 🔧 开发建议

### 1. 小程序端封装

创建 `utils/request.js` 统一封装请求：

```javascript
// utils/request.js
const BASE_URL = 'https://api.yourdomain.com/api/v1'

function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data.data)
        } else if (res.data.code === 401) {
          // Token 过期，跳转登录
          wx.navigateTo({ url: '/pages/login/login' })
          reject(res.data)
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res.data)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

module.exports = {
  get: (url, data) => request({ url, method: 'GET', data }),
  post: (url, data) => request({ url, method: 'POST', data }),
  put: (url, data) => request({ url, method: 'PUT', data }),
  delete: (url, data) => request({ url, method: 'DELETE', data })
}
```

### 2. API 封装示例

创建 `api/recipe.js`：

```javascript
// api/recipe.js
const request = require('../utils/request')

// 获取食谱列表
function getRecipeList(params) {
  return request.get('/recipes', params)
}

// 获取食谱详情
function getRecipeDetail(recipeId) {
  return request.get(`/recipes/${recipeId}`)
}

// 创建食谱
function createRecipe(data) {
  return request.post('/recipes', data)
}

// 点赞食谱
function likeRecipe(recipeId) {
  return request.post('/like', { recipeId })
}

// 收藏食谱
function collectRecipe(recipeId) {
  return request.post('/collect', { recipeId })
}

module.exports = {
  getRecipeList,
  getRecipeDetail,
  createRecipe,
  likeRecipe,
  collectRecipe
}
```

### 3. 使用示例

```javascript
// pages/index/index.js
const recipeApi = require('../../api/recipe')

Page({
  data: {
    recipes: []
  },
  
  onLoad() {
    this.loadRecipes()
  },
  
  async loadRecipes() {
    try {
      wx.showLoading({ title: '加载中...' })
      
      const data = await recipeApi.getRecipeList({
        page: 1,
        pageSize: 10,
        sort: 'latest'
      })
      
      this.setData({
        recipes: data.list
      })
      
      wx.hideLoading()
    } catch (err) {
      console.error('加载失败:', err)
    }
  }
})
```

---

## 📝 接口测试清单

### 测试工具
- Postman / Apifox
- 微信开发者工具

### 测试要点
- [ ] 所有接口是否返回统一格式
- [ ] 错误码是否正确返回
- [ ] Token 验证是否生效
- [ ] 分页参数是否正确
- [ ] 图片上传是否成功
- [ ] 并发请求是否正常

---

## 🚀 后续优化建议

1. **接口性能优化**
   - 添加 Redis 缓存
   - 图片 CDN 加速
   - 数据库索引优化

2. **安全性增强**
   - API 限流
   - 参数校验
   - SQL 注入防护
   - XSS 防护

3. **监控和日志**
   - 接口调用统计
   - 错误日志收集
   - 性能监控

4. **API 文档**
   - 使用 Swagger/OpenAPI
   - 自动生成文档
   - Mock 数据支持

---

*文档编写时间：2025年9月30日*  
*文档版本：v1.0*  
*接口数量：50+ 个*
