# 微信登录云函数

## 🎯 用途

专门处理微信小程序登录，解决云托管服务器IP白名单问题（错误码40164）。

## 🔧 问题背景

### 错误现象
```
invalid ip 124.221.206.113 not in whitelist (错误码: 40164)
```

### 问题原因
1. 微信code2session接口要求调用方IP必须在白名单中
2. 云托管服务器的IP `124.221.206.113` 不在微信小程序后台的IP白名单中
3. 云托管的出口IP可能动态变化，难以维护白名单

### 解决方案
使用微信云函数调用code2session接口：
- ✅ 微信云函数的IP已经在白名单中
- ✅ 不需要手动配置IP白名单  
- ✅ 避免云托管IP变化的问题
- ✅ 更安全稳定

---

## 📦 功能说明

### 工作流程

```
小程序前端
    ↓ wx.login() 获取 code
    ↓ wx.getUserProfile() 获取用户信息
    ↓
调用云函数: wechat-login
    ↓ 传入: code, nickname, avatar
    ↓
云函数处理
    ↓ cloud.getWXContext() 获取 openid
    ↓ 调用云托管后端 /api/v1/auth/wx-login
    ↓
后端处理
    ↓ 验证code并获取session_key
    ↓ 创建/更新用户
    ↓ 生成JWT token
    ↓
返回前端
    ↓ access_token
    ↓ user_info
```

### 关键特性

1. **避免IP白名单问题**
   - 微信云函数的IP已在白名单中
   - 无需手动配置

2. **安全性**
   - AppID和Secret配置在云托管后端
   - 敏感信息不暴露给前端

3. **可靠性**
   - 完整的错误处理
   - 详细的日志输出

---

## 🚀 部署步骤

### 1. 安装依赖

在云函数目录下：
```bash
npm install
```

### 2. 上传云函数

**方法A：微信开发者工具**
1. 打开小程序项目
2. 右键点击 `cloudfunctions/wechat-login` 目录
3. 选择 "上传并部署：云端安装依赖"
4. 等待部署完成

**方法B：命令行**
```bash
wx-cloud functions deploy wechat-login
```

### 3. 验证部署

在微信开发者工具的"云开发控制台"：
1. 进入 **云函数** 页面
2. 找到 `wechat-login` 函数
3. 点击 **测试** 按钮
4. 输入测试数据：
   ```json
   {
     "code": "test_code_123",
     "nickname": "测试用户",
     "avatar": "https://test.com/avatar.jpg"
   }
   ```
5. 查看返回结果

### 4. 更新前端代码

前端需要使用新的云函数：
```javascript
// 旧代码（通过api-proxy）
wx.cloud.callFunction({
  name: 'api-proxy',
  data: {
    method: 'POST',
    path: '/api/v1/auth/wx-login',
    data: loginData
  }
})

// 新代码（直接调用wechat-login）
wx.cloud.callFunction({
  name: 'wechat-login',
  data: loginData  // 直接传递登录数据
})
```

---

## 📋 依赖说明

### package.json
```json
{
  "dependencies": {
    "wx-server-sdk": "^3.0.0",  // 微信云开发SDK
    "axios": "^1.6.0"            // HTTP请求库
  }
}
```

### 为什么需要axios？
- 云函数需要调用云托管后端API
- 使用内网地址 `http://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com`
- 更快速、更稳定

---

## 🔍 响应格式

### 成功响应
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "code": 200,
    "message": "success",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer",
      "expires_in": 604800,
      "user": {
        "id": 1,
        "openid": "oABC123...",
        "nickname": "微信用户",
        "avatar": "https://...",
        "created_at": "2025-10-16T..."
      }
    }
  }
}
```

### 失败响应
```json
{
  "success": false,
  "statusCode": 401,
  "data": {
    "code": 401,
    "message": "微信登录失败: invalid code (错误码: 40029)",
    "error": "Unauthorized"
  }
}
```

---

## 🛠️ 常见问题

### Q1: 云函数部署失败

**A**: 检查以下几点：
1. 确保 `package.json` 文件存在
2. 确保 `config.json` 中的 `env` 值正确
3. 在微信开发者工具中"云端安装依赖"

### Q2: 调用云函数报错

**A**: 可能的原因：
1. 云函数未部署或部署失败
2. 前端代码中函数名称错误
3. 传递的参数格式不正确

解决方法：
```javascript
// 检查云函数调用代码
wx.cloud.callFunction({
  name: 'wechat-login',  // 确保名称正确
  data: {
    code: '...',         // 确保有code
    nickname: '...',     // 用户昵称
    avatar: '...'        // 用户头像
  },
  success: res => console.log('成功:', res),
  fail: err => console.error('失败:', err)
})
```

### Q3: 仍然返回40164错误

**A**: 检查：
1. 确认调用的是 `wechat-login` 云函数，不是 `api-proxy`
2. 查看云函数日志，确认云函数被正确调用
3. 确认云托管后端环境变量配置正确

### Q4: 云函数调用成功但登录失败

**A**: 查看云函数日志：
1. 微信开发者工具 → 云开发 → 云函数
2. 点击 `wechat-login` → 查看日志
3. 根据具体错误信息排查

---

## 📊 性能说明

### 响应时间
- 正常情况：200-500ms
- 包括：
  - 云函数调用：< 50ms
  - 后端处理：100-300ms
  - 网络传输：50-150ms

### 并发能力
- 微信云函数：默认支持1000并发
- 云托管后端：根据配置

---

## 🔄 版本历史

### v1.0.0 (2025-10-16)
- ✅ 初始版本
- ✅ 解决IP白名单问题（错误码40164）
- ✅ 完整的错误处理和日志
- ✅ 支持微信登录流程

---

## 📝 注意事项

1. **环境配置**
   - 确保云托管后端已正确配置 `WX_APPID` 和 `WX_SECRET`
   - 确保云托管服务正常运行

2. **安全性**
   - AppID和Secret仍然在云托管后端配置
   - 不要在云函数中硬编码敏感信息

3. **日志**
   - 云函数会输出详细日志
   - 可在云开发控制台查看

4. **错误处理**
   - 云函数会捕获所有错误并返回
   - 前端需要根据返回的状态码处理

---

## 🎉 使用示例

完整的登录流程请参考 `miniprogram-utils/wechat-login.js`。

