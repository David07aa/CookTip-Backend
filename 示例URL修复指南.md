# 示例URL修复指南

## 🐛 问题描述

前端报错：
```
[渲染层网络层错误] Failed to load image https://example.com/logo.png
the server responded with a status of 404 (HTTP/1.1 404) 
```

**根本原因**：数据库种子数据（`database/seed.sql` 和 `database/init.sql`）中使用了 `https://example.com/` 作为示例URL，这些数据被后端API返回到前端后导致图片加载失败。

---

## 📊 受影响的表

### 1. **users** 表
- **字段**: `avatar`
- **示例**: `https://example.com/avatars/user1.jpg`
- **影响**: 用户头像显示失败

### 2. **recipes** 表
- **字段**: `cover_image`、`steps` (JSON字段中的image)
- **示例**: 
  - `https://example.com/recipes/hongshaorou.jpg`
  - `https://example.com/steps/1.jpg`
- **影响**: 食谱封面、步骤图片显示失败

### 3. **categories** 表
- **字段**: `icon`
- **示例**: `https://example.com/icons/chinese.png`
- **影响**: 分类图标显示失败

---

## 🔧 修复方法

### 方法1: 执行Node.js脚本（推荐）

#### 步骤

1. **确保环境变量已配置**
   ```bash
   # 检查 .env 文件
   DB_HOST=sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com
   DB_PORT=28641
   DB_USERNAME=root
   DB_PASSWORD=你的密码
   DB_DATABASE=CookTip
   ```

2. **执行修复脚本**
   ```bash
   cd E:\前端项目文档\项目文件夹\CookTip-Backend
   node scripts/fix-example-urls.js
   ```

3. **查看输出结果**
   ```
   🔄 连接数据库...
   ✅ 数据库连接成功
   
   📊 检查受影响的记录...
     - 用户表: 3 条记录包含示例URL
     - 食谱表: 3 条记录包含示例URL
     - 分类表: 10 条记录包含示例URL
   
   🔧 更新用户头像...
     ✅ 已更新 3 个用户头像
   
   🔧 更新食谱封面...
     ✅ 已更新 3 个食谱封面
   
   🔧 更新食谱步骤图片...
     ✅ 已更新 2 个食谱的步骤图片
   
   🔧 更新分类图标...
     ✅ 已更新 10 个分类图标
   
   📊 验证更新结果...
     - 用户表剩余示例URL: 0
     - 食谱表剩余示例URL: 0
     - 分类表剩余示例URL: 0
   
   ✅ 所有示例URL已成功替换！
   
   🔌 数据库连接已关闭
   ```

---

### 方法2: 手动执行SQL（备选）

#### 步骤

1. **连接到数据库**
   - 使用Navicat或其他数据库工具
   - 连接信息参考 `.env` 文件

2. **执行SQL脚本**
   ```bash
   source database/migrations/update-example-urls.sql
   ```
   
   或在Navicat中：
   - 打开 `database/migrations/update-example-urls.sql`
   - 点击"运行"

3. **检查结果**
   ```sql
   SELECT COUNT(*) FROM users WHERE avatar LIKE '%example.com%';
   SELECT COUNT(*) FROM recipes WHERE cover_image LIKE '%example.com%';
   SELECT COUNT(*) FROM categories WHERE icon LIKE '%example.com%';
   ```
   
   所有查询结果应该为 `0`。

---

## 📋 替换映射表

| 原URL | 新URL | 类型 |
|-------|-------|------|
| `https://example.com/avatars/user*.jpg` | `https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/userImage/Defaultavatar.png` | 默认头像 |
| `https://example.com/recipes/hongshaorou.jpg` | `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800` | 红烧肉封面 |
| `https://example.com/recipes/xihongshi.jpg` | `https://images.unsplash.com/photo-1603073545352-f53f2070e40e?w=800` | 西红柿炒蛋封面 |
| `https://example.com/recipes/cake.jpg` | `https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800` | 蛋糕封面 |
| `https://example.com/steps/*.jpg` | `''` (空字符串) | 步骤图片 |
| `https://example.com/icons/chinese.png` | `/images/category/中餐.png` | 分类图标 |

---

## ✅ 验证修复

### 1. 后端验证

**查询数据库**:
```sql
-- 检查用户头像
SELECT id, nickname, avatar FROM users LIMIT 5;

-- 检查食谱封面
SELECT id, title, cover_image FROM recipes LIMIT 5;

-- 检查分类图标
SELECT id, name, icon FROM categories LIMIT 5;
```

**预期结果**:
- 所有 `avatar` 字段应该是 COS URL或为空
- 所有 `cover_image` 字段应该是 Unsplash URL或COS URL
- 所有 `icon` 字段应该是相对路径或为空

### 2. 前端验证

#### 测试步骤

1. **清除小程序缓存**
   - 微信开发者工具 → 清除缓存 → 清除本地数据缓存

2. **重新加载页面**
   - 首页：检查食谱列表的封面图
   - 食谱详情页：检查封面图、步骤图
   - 个人中心：检查用户头像

3. **检查控制台**
   - 不应再有 `example.com` 的404错误
   - 如果仍有错误，记录URL并手动修复

#### 测试API

使用 Postman 或 curl 测试：

```bash
# 获取食谱列表
curl http://localhost:3000/api/v1/recipes

# 获取食谱详情
curl http://localhost:3000/api/v1/recipes/1

# 获取用户信息
curl http://localhost:3000/api/v1/users/1
```

检查返回的JSON中是否还有 `example.com` URL。

---

## 🔍 排查步骤

如果修复后仍有问题：

### 1. 检查数据库数据
```sql
-- 查找所有包含 example.com 的记录
SELECT 'users' as table_name, id, avatar as url 
FROM users 
WHERE avatar LIKE '%example.com%'

UNION ALL

SELECT 'recipes' as table_name, id, cover_image as url 
FROM recipes 
WHERE cover_image LIKE '%example.com%'

UNION ALL

SELECT 'categories' as table_name, id, icon as url 
FROM categories 
WHERE icon LIKE '%example.com%';
```

### 2. 检查前端缓存
```javascript
// 在小程序控制台执行
wx.clearStorageSync()
wx.reLaunch({ url: '/pages/index/index' })
```

### 3. 检查CDN配置
确保 `utils/cdn.js` 中的配置正确：
```javascript
const COS_BASE_URL = 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com';
```

### 4. 检查后端日志
查看后端控制台，确认API返回的数据格式：
```bash
# 重启后端服务
npm run start:dev
```

---

## 📝 预防措施

### 1. 更新种子数据
修改 `database/seed.sql`，将所有示例URL替换为实际URL：

```sql
-- 不要使用
('test_openid_001', '美食达人小王', 'https://example.com/avatars/user1.jpg', '热爱烹饪，分享美食'),

-- 应该使用
('test_openid_001', '美食达人小王', 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/userImage/Defaultavatar.png', '热爱烹饪，分享美食'),
```

### 2. 前端防御性编程
在前端添加URL验证：

```javascript
// utils/cdn.js
function getCdnUrl(path) {
  if (!path) return '';
  
  // 🚫 阻止 example.com URL
  if (path.includes('example.com')) {
    console.warn('[CDN] 发现示例URL，已替换为默认图:', path);
    return getDefaultImage('recipeCover');
  }
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  return `${COS_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
```

### 3. API层过滤
在后端添加中间件过滤示例URL：

```typescript
// src/common/interceptors/sanitize-url.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizeUrlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.sanitizeUrls(data))
    );
  }

  private sanitizeUrls(data: any): any {
    if (!data) return data;
    
    if (typeof data === 'string') {
      if (data.includes('example.com')) {
        console.warn('[API] 发现示例URL，已替换:', data);
        return '';
      }
      return data;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeUrls(item));
    }
    
    if (typeof data === 'object') {
      const sanitized = {};
      for (const key in data) {
        sanitized[key] = this.sanitizeUrls(data[key]);
      }
      return sanitized;
    }
    
    return data;
  }
}
```

---

## 🎯 总结

### 问题根源
- ❌ 数据库种子数据使用了 `https://example.com/` 示例URL
- ❌ 后端API直接返回数据库中的URL到前端
- ❌ 前端尝试加载这些不存在的URL导致404错误

### 解决方案
- ✅ 执行数据库迁移脚本，将所有示例URL替换为实际URL
- ✅ 更新种子数据文件，避免未来重新导入时再次出现问题
- ✅ 前端添加URL验证，防御性处理异常URL
- ✅ 后端添加URL过滤中间件（可选）

### 验证标准
- ✅ 数据库中无 `example.com` URL（查询结果为0）
- ✅ 前端控制台无404错误
- ✅ 所有图片正常加载

---

**修复完成时间**: 2025年10月29日  
**修复作者**: CookTip 开发团队

