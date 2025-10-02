# 微信登录 API 对接文档

## 接口信息

**接口地址**: `https://cooktip-backend.vercel.app/api/auth/wechat`  
**请求方法**: `POST`  
**Content-Type**: `application/json`

---

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | String | 是 | wx.login() 获取的临时登录凭证 |
| nickName | String | 否 | 用户昵称（推荐传递） |
| avatar | String | 否 | 用户头像 URL（推荐传递） |

### 请求示例

```json
{
  "code": "081xyzABC123...",
  "nickName": "微信用户",
  "avatar": "https://thirdwx.qlogo.cn/..."
}
```

---

## 响应格式

### 成功响应 (200)

**新用户注册成功**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nickName": "微信用户",
      "avatar": "https://thirdwx.qlogo.cn/...",
      "isVip": false,
      "isNewUser": true
    }
  }
}
```

**老用户登录成功**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nickName": "老用户昵称",
      "avatar": "https://thirdwx.qlogo.cn/...",
      "isVip": false,
      "isNewUser": false
    }
  }
}
```

### 失败响应

**缺少参数 (400)**:
```json
{
  "code": 400,
  "message": "缺少登录凭证 code",
  "data": null
}
```

**微信登录失败 (401)**:
```json
{
  "code": 401,
  "message": "微信登录失败",
  "data": {
    "error": "invalid code",
    "errcode": 40029
  }
}
```

**服务器错误 (500)**:
```json
{
  "code": 500,
  "message": "服务器错误",
  "data": null
}
```

---

## 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|---------|
| 400 | 缺少必填参数 | 检查请求参数是否完整 |
| 401 | 微信登录失败 | code 已过期或无效，重新调用 wx.login() |
| 405 | 请求方法错误 | 使用 POST 方法 |
| 500 | 服务器错误 | 稍后重试或联系技术支持 |

### 微信 errcode 说明

| errcode | 说明 |
|---------|------|
| 40029 | code 无效（已使用或已过期） |
| 40163 | code 已被使用过 |
| -1 | 系统繁忙 |

---

## 前端集成代码

### 微信小程序

```javascript
// utils/auth.js
const API_BASE = 'https://cooktip-backend.vercel.app/api';

/**
 * 微信登录
 * @returns {Promise<Object>} 登录结果
 */
async function wechatLogin() {
  try {
    // 1. 调用 wx.login 获取 code
    const loginRes = await wx.login();
    
    if (!loginRes.code) {
      throw new Error('获取登录凭证失败');
    }

    // 2. 可选：获取用户信息（需要用户授权）
    let userInfo = null;
    try {
      const profileRes = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });
      userInfo = profileRes.userInfo;
    } catch (err) {
      console.log('用户未授权获取信息');
    }

    // 3. 调用后端登录接口
    const res = await wx.request({
      url: `${API_BASE}/auth/wechat`,
      method: 'POST',
      data: {
        code: loginRes.code,
        nickName: userInfo?.nickName,
        avatar: userInfo?.avatarUrl
      }
    });

    if (res.data.code === 200) {
      // 4. 保存 token 和用户信息
      const { token, user } = res.data.data;
      
      wx.setStorageSync('token', token);
      wx.setStorageSync('userInfo', user);

      return {
        success: true,
        token,
        user
      };
    } else {
      throw new Error(res.data.message);
    }

  } catch (error) {
    console.error('登录失败:', error);
    
    wx.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 检查登录状态
 */
function isLoggedIn() {
  const token = wx.getStorageSync('token');
  return !!token;
}

/**
 * 获取 Token
 */
function getToken() {
  return wx.getStorageSync('token') || '';
}

/**
 * 退出登录
 */
function logout() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
}

module.exports = {
  wechatLogin,
  isLoggedIn,
  getToken,
  logout
};
```

### 使用示例

```javascript
// pages/login/login.js
const auth = require('../../utils/auth');

Page({
  data: {
    loading: false
  },

  // 点击登录按钮
  async handleLogin() {
    this.setData({ loading: true });

    const result = await auth.wechatLogin();

    this.setData({ loading: false });

    if (result.success) {
      // 登录成功
      wx.showToast({
        title: result.user.isNewUser ? '注册成功' : '登录成功',
        icon: 'success'
      });

      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    }
  }
});
```

---

## 使用 Token 访问其他接口

登录成功后，将 token 保存到本地存储，后续请求需要在 Header 中携带：

```javascript
// utils/request.js
const auth = require('./auth');

function request(options) {
  const token = auth.getToken();
  
  return wx.request({
    url: options.url,
    method: options.method || 'GET',
    data: options.data || {},
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // 携带 token
    },
    success: options.success,
    fail: options.fail
  });
}

module.exports = { request };
```

**使用示例**:
```javascript
const request = require('../../utils/request');

// 获取用户信息（需要登录）
request({
  url: 'https://cooktip-backend.vercel.app/api/user/info',
  method: 'GET',
  success: (res) => {
    console.log('用户信息:', res.data);
  }
});
```

---

## Token 说明

- **有效期**: 7 天
- **格式**: JWT (JSON Web Token)
- **使用方式**: 请求头中添加 `Authorization: Bearer <token>`
- **过期处理**: 返回 401 状态码时，需要重新登录

---

## 注意事项

### 1. code 有效期

- wx.login() 获取的 code 有效期为 **5 分钟**
- 每个 code **只能使用一次**
- code 使用后或过期需要重新调用 wx.login()

### 2. 用户信息获取

- `nickName` 和 `avatar` 为可选参数
- 如果不传递，系统会使用默认值
- 建议获取用户授权后传递，提升用户体验

### 3. 错误处理

```javascript
// 推荐的错误处理方式
try {
  const result = await wechatLogin();
  
  if (!result.success) {
    // 根据错误类型处理
    if (result.error.includes('code')) {
      // code 相关错误，提示用户重试
      wx.showModal({
        title: '提示',
        content: '登录凭证已过期，请重新登录',
        success: (res) => {
          if (res.confirm) {
            // 重新登录
            this.handleLogin();
          }
        }
      });
    } else {
      // 其他错误
      wx.showToast({
        title: '登录失败，请稍后重试',
        icon: 'none'
      });
    }
  }
} catch (error) {
  console.error('登录异常:', error);
}
```

### 4. 网络异常处理

```javascript
wx.request({
  url: 'https://cooktip-backend.vercel.app/api/auth/wechat',
  method: 'POST',
  data: { code },
  success: (res) => {
    // 处理成功响应
  },
  fail: (err) => {
    // 网络请求失败
    wx.showToast({
      title: '网络异常，请检查网络连接',
      icon: 'none'
    });
  }
});
```

### 5. 开发环境配置

在微信开发者工具中：

**开发阶段**（跳过域名校验）:
1. 详情 → 本地设置
2. 勾选 "不校验合法域名..."

**正式发布前**（配置合法域名）:
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 开发 → 开发管理 → 开发设置 → 服务器域名
3. 添加 request 合法域名：`https://cooktip-backend.vercel.app`

---

## 完整流程图

```
用户点击登录
    ↓
调用 wx.login()
    ↓
获取 code
    ↓
[可选] 调用 wx.getUserProfile()
    ↓
获取用户信息（nickName, avatar）
    ↓
POST /api/auth/wechat
    ↓
后端验证 code
    ↓
├─ code 有效
│   ↓
│   查询/创建用户
│   ↓
│   生成 JWT token
│   ↓
│   返回 token + 用户信息
│   ↓
│   保存到本地存储
│   ↓
│   跳转到首页
│
└─ code 无效
    ↓
    返回错误信息
    ↓
    提示用户重试
```

---

## 测试工具

### 在浏览器中测试

打开项目中的 `test-wechat-login.html` 文件，可以快速测试接口是否正常。

### 使用 Postman 测试

**请求配置**:
- URL: `https://cooktip-backend.vercel.app/api/auth/wechat`
- Method: `POST`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "code": "你的测试code",
  "nickName": "测试用户",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

## 常见问题

### Q1: 为什么返回 401 错误？

**A**: code 无效或已过期。每个 code 只能使用一次，有效期 5 分钟。请重新调用 `wx.login()` 获取新的 code。

### Q2: 是否需要配置服务器域名？

**A**: 
- **开发阶段**: 可以在开发者工具中勾选"不校验合法域名"
- **正式发布**: 必须在微信公众平台配置服务器域名

### Q3: Token 过期后如何处理？

**A**: 
```javascript
// 在请求拦截器中统一处理
if (res.statusCode === 401) {
  wx.removeStorageSync('token');
  wx.reLaunch({
    url: '/pages/login/login'
  });
}
```

### Q4: 如何测试登录功能？

**A**: 
1. 必须使用真实的小程序 AppID
2. 必须配置正确的 AppSecret（后端环境变量）
3. 使用开发者工具或真机进行测试

---

## 联系支持

如有问题，请提供：
1. 请求的完整 URL
2. 请求参数
3. 响应内容
4. 错误截图

---

**文档版本**: 1.0  
**最后更新**: 2025-10-02  
**接口版本**: v1  
**生产环境**: https://cooktip-backend.vercel.app

