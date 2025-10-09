# ERR_CONNECTION_CLOSED 错误排查指南

**错误信息**: `GET https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/api/v1/categories net::ERR_CONNECTION_CLOSED`

**发生时间**: 部署成功后，小程序请求API时

---

## 🔍 问题原因分析

### 可能原因1：云托管实例内存不足（最可能）⭐⭐⭐⭐⭐

**症状**：
- 部署成功
- 服务启动后短时间内崩溃
- 所有API请求都返回 ERR_CONNECTION_CLOSED

**原因**：
- 192张图片（约15-20MB）打包进Docker镜像
- Node.js运行时占用内存
- 默认实例配置可能只有512MB-1GB
- **总内存超出限制，导致服务崩溃**

**验证方法**：
1. 登录微信云托管控制台
2. 查看服务日志
3. 查看实例监控（CPU/内存使用率）

---

### 可能原因2：服务启动时间过长

**症状**：
- 部署后等待一段时间（1-2分钟）可能恢复
- 健康检查失败

**原因**：
- TypeORM初始化数据库连接需要时间
- 静态文件模块加载需要时间

---

### 可能原因3：数据库连接失败

**症状**：
- 服务无法启动
- 日志显示数据库连接错误

**原因**：
- 环境变量配置错误
- SQLPub数据库连接超时

---

## ✅ 解决方案

### 方案一：增加云托管实例内存（推荐）⭐⭐⭐⭐⭐

#### 步骤：
1. **登录微信云托管控制台**
   - https://console.cloud.tencent.com/tcb
   - 或通过微信开发者工具 → 云开发 → 云托管

2. **调整实例配置**
   - 进入服务详情
   - 点击"版本配置"或"实例配置"
   - **内存**：从 512MB/1GB 增加到 **2GB**
   - **CPU**：建议 1核心
   - 保存并重新部署

3. **预期结果**
   - 服务稳定运行
   - API正常响应
   - 图片正常访问

---

### 方案二：优化Dockerfile减少内存占用

修改 `Dockerfile`，使用更轻量的配置：

```dockerfile
# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 设置Node.js内存限制（可选）
ENV NODE_OPTIONS="--max-old-space-size=1024"

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制编译后的文件
COPY --from=builder /app/dist ./dist

# 从构建阶段复制上传目录（包含老乡鸡图片）
COPY --from=builder /app/uploads ./uploads

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main"]
```

---

### 方案三：将图片迁移到云存储（最佳长期方案）⭐⭐⭐⭐⭐

#### 优点：
- ✅ 不占用服务器内存
- ✅ CDN加速，加载更快
- ✅ 成本更低
- ✅ 更易扩展

#### 步骤：

**1. 开通腾讯云COS**
   - 登录腾讯云控制台
   - 对象存储COS
   - 创建存储桶

**2. 上传图片**
   ```bash
   # 使用COS工具上传
   coscmd upload -r uploads/images/laoxiangji/ /laoxiangji/
   ```

**3. 批量更新数据库**
   ```javascript
   // 将图片URL从
   https://xxx.com/uploads/images/laoxiangji/xxx.png
   // 改为
   https://your-bucket.cos.ap-shanghai.myqcloud.com/laoxiangji/xxx.png
   ```

**4. 移除Docker镜像中的图片**
   - 删除 uploads 目录
   - 减小镜像体积

---

## 🛠️ 前端解决方案（临时方案）

### 1. 增加超时时间和重试机制

我已经为您创建了 `utils/request.js`，包含：

#### 特性：
- ✅ 默认30秒超时（可配置）
- ✅ 自动重试2次（网络失败时）
- ✅ 递增延迟重试（1秒、2秒）
- ✅ 友好的错误提示
- ✅ ERR_CONNECTION_CLOSED专门处理

#### 使用方法：

```javascript
// api/category.js
const request = require('../utils/request')

function getCategories() {
  return request.get('/categories', {}, {
    timeout: 30000, // 30秒超时
    retry: 3,       // 重试3次
    needAuth: false
  })
}
```

### 2. 添加加载状态

```javascript
// pages/index/index.js
Page({
  data: {
    loading: true,
    categories: []
  },

  onLoad() {
    this.loadCategories()
  },

  async loadCategories() {
    try {
      wx.showLoading({ title: '加载中...', mask: true })
      
      const res = await getCategories()
      this.setData({
        categories: res.data || [],
        loading: false
      })
      
      wx.hideLoading()
    } catch (err) {
      console.error('加载失败:', err)
      this.setData({ loading: false })
      wx.hideLoading()
      
      // 提示用户重试
      wx.showModal({
        title: '加载失败',
        content: '服务器连接失败，是否重试？',
        success: (res) => {
          if (res.confirm) {
            this.loadCategories()
          }
        }
      })
    }
  }
})
```

---

## 📊 快速诊断

### 步骤1：检查服务状态

访问健康检查端点（如果有）：
```
https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/
```

### 步骤2：查看云托管日志

1. 微信开发者工具 → 云开发 → 云托管
2. 选择服务
3. 查看"日志"标签
4. 查找错误信息：
   - `FATAL ERROR: ... JavaScript heap out of memory` ← 内存溢出
   - `Error connecting to database` ← 数据库连接失败
   - `ECONNREFUSED` ← 端口未监听

### 步骤3：检查实例配置

1. 云托管控制台
2. 服务详情 → 版本配置
3. 查看当前内存配置
4. **如果 < 2GB，建议升级**

---

## 🎯 推荐方案

根据当前情况，建议按以下顺序尝试：

### 立即执行（前端）：
1. ✅ 使用我提供的 `utils/request.js`（已创建）
2. ✅ 增加超时时间到30秒
3. ✅ 添加重试机制

### 后端优化（必做）：
1. ⭐⭐⭐⭐⭐ **增加云托管实例内存到2GB**
2. ⭐⭐⭐ 检查并优化数据库连接池配置
3. ⭐⭐⭐ 添加健康检查端点

### 长期优化（可选）：
1. ⭐⭐⭐⭐⭐ 将图片迁移到云存储COS
2. ⭐⭐⭐⭐ 配置CDN加速
3. ⭐⭐⭐ 压缩图片文件

---

## 🔧 立即可用的前端代码

### 修改 `api/category.js`

```javascript
const request = require('../utils/request')

/**
 * 获取分类列表
 */
function getCategories() {
  return request.get('/categories', {}, {
    timeout: 30000, // 30秒超时
    retry: 3,       // 失败重试3次
    needAuth: false
  })
}

module.exports = {
  getCategories
}
```

### 修改 `api/recipe.js`

```javascript
const request = require('../utils/request')

/**
 * 获取食谱列表
 */
function getRecipeList(params) {
  return request.get('/recipes', params, {
    timeout: 30000,
    retry: 2,
    needAuth: false
  })
}

module.exports = {
  getRecipeList
}
```

---

## ❓ 常见问题

### Q: 为什么部署成功但服务无法访问？
**A**: 部署成功只是镜像构建成功，不代表服务正常运行。可能是内存不足导致启动后崩溃。

### Q: 如何确认是内存问题？
**A**: 查看云托管日志，如果看到 `JavaScript heap out of memory` 就是内存溢出。

### Q: 升级内存配置需要多久生效？
**A**: 保存配置后会自动重新部署，约3-5分钟生效。

### Q: 图片迁移到COS复杂吗？
**A**: 不复杂，主要步骤是：上传图片 → 批量更新数据库URL → 删除Docker中的图片。

---

## ✅ 验证清单

修复后验证：
- [ ] 访问 API：https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/api/v1/categories
- [ ] 返回正常的JSON数据
- [ ] 小程序能正常加载分类
- [ ] 小程序能正常显示图片
- [ ] 没有ERR_CONNECTION_CLOSED错误

---

**更新时间**: 2025-10-09

