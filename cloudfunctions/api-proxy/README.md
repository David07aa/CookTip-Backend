# API 代理云函数

## 功能说明

这个云函数作为 API 网关，将小程序的请求转发到云托管后端服务。

### 为什么需要这个云函数？

- 微信小程序不允许将云托管默认域名配置为 request 合法域名
- 云函数的域名自动在小程序白名单中
- 云函数可以通过内网访问云托管服务（更快、更安全）

### 工作原理

```
小程序 → 云函数 (API 代理) → 云托管后端 (内网访问)
        ↑                        ↑
   自动在白名单              无需公网域名
```

## 部署步骤

### 1. 在微信开发者工具中

1. 打开您的小程序项目
2. 点击 **云开发** 按钮
3. 如果没有云开发环境，点击 **开通** 创建环境
4. 记录环境 ID（如 `cooktip-prod-xxx`）

### 2. 部署云函数

#### 方式 A：通过微信开发者工具（推荐）

1. 将 `cloudfunctions` 目录放到小程序项目根目录
2. 在开发者工具中右键 `api-proxy` 文件夹
3. 选择 **上传并部署：云端安装依赖**
4. 等待部署完成（约 1-2 分钟）

#### 方式 B：通过命令行

```bash
# 1. 登录
tcb login

# 2. 部署云函数
tcb fn deploy api-proxy --force
```

### 3. 验证部署

在微信开发者工具控制台运行：

```javascript
wx.cloud.callFunction({
  name: 'api-proxy',
  data: {
    method: 'GET',
    path: '/health'
  },
  success: res => {
    console.log('云函数调用成功:', res)
  },
  fail: err => {
    console.error('云函数调用失败:', err)
  }
})
```

## 使用方法

### 调用参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| method | String | 否 | HTTP 方法（GET/POST/PUT/PATCH/DELETE），默认 GET |
| path | String | 是 | API 路径（如 `/api/v1/categories`） |
| data | Object | 否 | 请求数据（POST/PUT/PATCH 请求） |
| query | Object | 否 | URL 查询参数（GET 请求） |
| headers | Object | 否 | 自定义请求头 |

### 返回格式

```javascript
{
  statusCode: 200,        // HTTP 状态码
  headers: {...},         // 响应头
  data: {                 // 响应数据
    code: 200,
    message: 'success',
    data: {...}
  }
}
```

### 调用示例

```javascript
// 获取分类列表
wx.cloud.callFunction({
  name: 'api-proxy',
  data: {
    method: 'GET',
    path: '/api/v1/categories'
  }
})

// 获取食谱列表（带查询参数）
wx.cloud.callFunction({
  name: 'api-proxy',
  data: {
    method: 'GET',
    path: '/api/v1/recipes',
    query: {
      page: 1,
      limit: 10,
      sort: 'recommended'
    }
  }
})

// 创建食谱
wx.cloud.callFunction({
  name: 'api-proxy',
  data: {
    method: 'POST',
    path: '/api/v1/recipes',
    data: {
      title: '番茄炒蛋',
      description: '经典家常菜'
    },
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }
})
```

## 性能说明

- **延迟**：增加约 50-100ms（相比直连）
- **超时**：15 秒（可在代码中调整）
- **并发**：支持高并发（云函数自动扩容）
- **成本**：免费版 10 万次/月，通常够用

## 监控和日志

### 查看云函数日志

1. 打开云开发控制台
2. 选择 **云函数** → **api-proxy**
3. 点击 **日志** 标签
4. 查看实时日志和历史日志

### 日志内容

```
收到请求: { method: 'GET', path: '/api/v1/categories', ... }
转发请求到: http://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/api/v1/categories
后端响应: { status: 200, hasData: true }
```

## 故障排查

### 问题 1：云函数调用失败

**检查**：
- 云函数是否部署成功
- 环境 ID 是否正确
- 小程序是否已初始化云开发

### 问题 2：返回 504 网关超时

**原因**：
- 后端服务未启动
- 内网地址配置错误
- 后端响应太慢（>15秒）

**解决**：
- 检查云托管服务状态
- 验证内网地址是否正确
- 优化后端性能

### 问题 3：返回 500 内部错误

**检查**：
- 查看云函数日志
- 确认依赖是否安装完整
- 验证请求参数格式

## 更新云函数

修改代码后，重新部署：

```bash
# 右键 api-proxy 文件夹
# 选择 "上传并部署：云端安装依赖"
```

## 配置说明

### config.json

```json
{
  "timeout": 20,        // 云函数超时时间（秒）
  "memorySize": 256     // 内存大小（MB）
}
```

### 可调整参数

在 `index.js` 中：

```javascript
// 内网地址
const API_INTERNAL_URL = 'http://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com'

// 请求超时时间
timeout: 15000  // 15秒
```

## 最佳实践

1. **错误处理**：云函数已包含完善的错误处理
2. **日志记录**：关键步骤都有日志输出
3. **超时设置**：合理设置超时时间
4. **并发控制**：云函数自动处理并发

## 成本估算

| 项目 | 免费版 | 说明 |
|------|--------|------|
| 调用次数 | 10 万次/月 | 通常够用 |
| 执行时长 | 4 万 GBs/月 | 256MB × 20s × 约 7800 次 |
| 超出费用 | 0.0133 元/万次 | 很便宜 |

## 版本信息

- **版本**：1.0.0
- **更新时间**：2025-10-16
- **兼容性**：微信小程序云开发

## 技术支持

如有问题，请查看：
- 云函数日志
- 云托管服务状态
- 后端 API 文档

