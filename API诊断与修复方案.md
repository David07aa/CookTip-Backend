# 🔍 API 诊断与修复方案

## 📊 当前状态分析

### ✅ 已正确配置的部分

1. **API 结构**: Vercel Serverless Functions 架构 ✅
2. **CORS Headers**: 每个 API 文件都有 CORS 配置 ✅
3. **数据库连接**: PostgreSQL (Neon) 配置正确 ✅
4. **数据导入**: 198 个老乡鸡菜谱已导入 ✅

### ⚠️ 发现的问题

#### 问题 1: vercel.json 配置过于简单
**当前配置:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ]
}
```

**问题**: 
- 缺少 `routes` 配置
- 没有明确的 CORS 响应头配置
- 可能导致微信小程序请求失败

#### 问题 2: 速率限制 (429 Too Many Requests)
**当前状态**: API 因频繁测试触发 Vercel 速率限制

**影响**: 暂时无法测试 API

#### 问题 3: 前端请求可能的问题
根据用户反馈"前端总是不能请求数据"，可能原因：

1. **微信小程序域名白名单未配置**
2. **CORS 预检请求 (OPTIONS) 处理不当**
3. **请求格式或参数不正确**
4. **前端 Base URL 配置错误**

---

## 🔧 修复方案

### 方案 1: 优化 vercel.json 配置 (推荐)

创建更完善的 `vercel.json`:

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
      "dest": "/api/$1",
      "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      "headers": {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
      }
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
        }
      ]
    }
  ]
}
```

### 方案 2: 创建统一的 CORS 中间件

创建 `middleware/cors.js`:

```javascript
/**
 * 统一 CORS 处理中间件
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

function handleCors(req, res) {
  setCorsHeaders(res);
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // 表示已处理
  }
  
  return false; // 继续处理其他逻辑
}

module.exports = { setCorsHeaders, handleCors };
```

然后在所有 API 文件中使用:

```javascript
const { handleCors } = require('../../middleware/cors');

module.exports = async (req, res) => {
  // CORS 处理
  if (handleCors(req, res)) return;
  
  // 原有逻辑...
};
```

### 方案 3: 前端配置检查清单

#### 微信小程序配置

**1. 在微信小程序后台配置服务器域名:**

进入: 微信公众平台 -> 开发 -> 开发管理 -> 开发设置 -> 服务器域名

添加:
```
request合法域名: https://cooktip-backend.vercel.app
```

**2. 检查前端代码中的 Base URL:**

```javascript
// utils/config.js 或 api/config.js
const BASE_URL = 'https://cooktip-backend.vercel.app'; // 确保没有多余的斜杠

// 正确的请求方式
wx.request({
  url: `${BASE_URL}/api/categories`,  // ✅ 正确
  method: 'GET',
  success: (res) => {
    console.log(res.data);
  }
});

// 错误的请求方式
wx.request({
  url: `${BASE_URL}api/categories`,   // ❌ 错误: 缺少斜杠
  url: `/api/categories`,              // ❌ 错误: 相对路径
  url: `${BASE_URL}//api/categories`,  // ❌ 错误: 双斜杠
});
```

**3. 开发工具配置:**

- 打开微信开发者工具
- 勾选: "详情" -> "本地设置" -> "不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书" (仅开发时)

---

## 🧪 测试步骤

### 步骤 1: 等待速率限制重置 (10-15 分钟)

当前 API 触发了 429 限制，需要等待重置。

### 步骤 2: 浏览器测试

等待后，在浏览器中直接访问:

1. **分类接口**: https://cooktip-backend.vercel.app/api/categories
2. **食谱列表**: https://cooktip-backend.vercel.app/api/recipes?page=1&limit=5
3. **搜索接口**: https://cooktip-backend.vercel.app/api/search?keyword=鸡&page=1&pageSize=5

**预期结果:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [...]
  }
}
```

### 步骤 3: 微信小程序测试

在微信开发者工具中测试:

```javascript
// pages/index/index.js
Page({
  onLoad() {
    this.testAPI();
  },
  
  testAPI() {
    console.log('开始测试 API...');
    
    // 测试 1: 分类接口
    wx.request({
      url: 'https://cooktip-backend.vercel.app/api/categories',
      method: 'GET',
      success: (res) => {
        console.log('✅ 分类接口成功:', res.data);
        if (res.data.code === 200) {
          wx.showToast({
            title: '分类接口正常',
            icon: 'success'
          });
        }
      },
      fail: (err) => {
        console.error('❌ 分类接口失败:', err);
        wx.showToast({
          title: '请求失败: ' + err.errMsg,
          icon: 'none',
          duration: 3000
        });
      }
    });
    
    // 测试 2: 食谱列表
    wx.request({
      url: 'https://cooktip-backend.vercel.app/api/recipes',
      method: 'GET',
      data: {
        page: 1,
        limit: 5
      },
      success: (res) => {
        console.log('✅ 食谱列表成功:', res.data);
        if (res.data.code === 200 && res.data.data.list.length > 0) {
          wx.showToast({
            title: `获取到 ${res.data.data.list.length} 个食谱`,
            icon: 'success'
          });
        }
      },
      fail: (err) => {
        console.error('❌ 食谱列表失败:', err);
      }
    });
  }
});
```

### 步骤 4: 查看网络请求详情

在微信开发者工具中:
1. 打开 "调试器" -> "Network" 标签
2. 执行请求
3. 查看请求和响应详情
4. 检查是否有错误信息

---

## 🔍 常见错误及解决方案

### 错误 1: `request:fail invalid url "/api/categories"`

**原因**: 前端使用了相对路径

**解决**:
```javascript
// ❌ 错误
url: '/api/categories'

// ✅ 正确
url: 'https://cooktip-backend.vercel.app/api/categories'
```

### 错误 2: `request:fail url not in domain list`

**原因**: 微信小程序后台未配置域名白名单

**解决**: 
1. 开发时: 勾选 "不校验合法域名"
2. 生产时: 在微信公众平台添加 `https://cooktip-backend.vercel.app` 到白名单

### 错误 3: `Failed to fetch` 或 CORS 错误

**原因**: CORS 配置问题

**解决**: 应用上述 vercel.json 优化配置

### 错误 4: `429 Too Many Requests`

**原因**: 请求过于频繁

**解决**: 
- 添加请求防抖/节流
- 等待 10-15 分钟后重试
- 减少不必要的请求

---

## 📝 实施步骤

### 立即执行:

1. ✅ **更新 vercel.json** (已在下方提供完整配置)
2. ✅ **创建 CORS 中间件** (已提供代码)
3. ⏰ **等待 15 分钟** 让速率限制重置
4. 🧪 **浏览器测试** API 是否正常响应
5. 📱 **微信小程序测试** 确认前端可以获取数据

### 后续优化:

1. 添加 API 请求缓存
2. 实现请求重试机制
3. 添加请求日志监控
4. 配置 CDN 加速

---

## 📞 需要前端提供的信息

为了更好地诊断问题，请提供:

1. **前端完整错误信息** (包括 errMsg)
2. **前端请求代码** (完整的 wx.request 调用)
3. **微信开发者工具 Network 截图**
4. **是否配置了服务器域名白名单**

---

**创建时间**: 2025-10-02  
**状态**: 待执行  
**优先级**: 🔴 高

