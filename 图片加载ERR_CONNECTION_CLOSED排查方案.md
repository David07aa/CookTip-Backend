# 图片加载 ERR_CONNECTION_CLOSED 排查方案

## 🚨 错误信息

```
[渲染层网络层错误] Failed to load image <URL>
net::ERR_CONNECTION_CLOSED 
(env: Windows,mp,1.06.2504030; lib: 3.5.8)
```

## 📋 问题分析

`ERR_CONNECTION_CLOSED` 表示：
- 网络连接在请求完成前被关闭
- 可能是域名无法解析
- 可能是服务器拒绝连接
- 可能是小程序域名未配置

## 🔍 紧急排查步骤

### 步骤1：确认图片URL是什么

**在小程序控制台查看完整的图片URL：**

```javascript
// 在页面中打印图片URL
console.log('=== 图片URL调试 ===');
console.log('封面URL:', this.data.recipes[0]?.cover);
console.log('视频封面URL:', this.data.recipes[0]?.videoCover);
```

**请告诉我您看到的URL是以下哪种格式：**

#### ❌ 格式A：使用了内网域名（错误）
```
https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/xxx.jpg
```
**问题**：这是云托管的内网域名，外部无法访问

#### ❌ 格式B：使用了云托管公网域名（错误）
```
https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com/uploads/xxx.jpg
```
**问题**：云托管域名不能用作 downloadFile 合法域名

#### ✅ 格式C：使用COS对象存储域名（正确）
```
https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/uploads/xxx.jpg
```
**这是正确的格式**

#### ❌ 格式D：本地路径（错误）
```
E:\前端项目文档\项目文件夹\CookTip\images\empty\no-search.png
```
**问题**：小程序无法访问本地文件系统

---

### 步骤2：测试图片URL是否可访问

#### 2.1 在浏览器中测试

**请在浏览器中直接访问图片URL，看是否能显示**

示例测试：
```
https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/images/default/recipe-cover.png
```

**可能的结果：**

- ✅ **能看到图片** → 图片存在，继续步骤3
- ❌ **403 Access Denied** → COS权限问题，查看步骤4
- ❌ **404 Not Found** → 图片不存在，查看步骤5
- ❌ **无法访问/超时** → 域名或网络问题

#### 2.2 使用curl测试（在终端中）

```bash
# 测试图片是否可访问
curl -I https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/images/default/recipe-cover.png

# 应该返回 HTTP/1.1 200 OK
```

---

### 步骤3：检查小程序域名配置

#### 3.1 登录微信小程序后台
访问：https://mp.weixin.qq.com

#### 3.2 检查 downloadFile 合法域名配置

路径：**开发管理** → **开发设置** → **服务器域名** → **downloadFile合法域名**

**必须包含**：
```
https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com
```

#### 3.3 检查开发者工具设置

在微信开发者工具中：
- 点击右上角 **详情**
- 选择 **本地设置**
- 确认勾选了 **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**（仅开发环境）

#### 3.4 等待域名配置生效

如果刚配置域名：
- ⏰ 需要等待 **3-5分钟** 才能生效
- 🔄 配置后需要 **重启开发者工具**
- 📱 真机调试需要 **重新预览/上传**

---

### 步骤4：检查COS存储桶权限

#### 4.1 登录腾讯云控制台
访问：https://console.cloud.tencent.com/cos

#### 4.2 选择存储桶
找到并点击：`yjsp-1367462091`

#### 4.3 检查权限配置

**方法A：通过权限管理检查**

1. 点击 **权限管理** → **存储桶访问权限**
2. 查看 **公共权限** 设置：
   - ✅ **公有读私有写** 或 **公有读写**（推荐：公有读私有写）
   - ❌ **私有读写**（会导致无法访问）

**方法B：通过Policy检查**

1. 点击 **权限管理** → **Policy权限**
2. 确认是否有限制公共访问的策略

#### 4.4 设置为公有读（如果不是）

```json
// 在 Bucket Policy 中添加公共读策略
{
  "version": "2.0",
  "statement": [
    {
      "principal": {"qcs": ["qcs::cam::anyone:anyone"]},
      "effect": "allow",
      "action": ["name/cos:GetObject"],
      "resource": ["qcs::cos:ap-nanjing:uid/1367462091:yjsp-1367462091/*"]
    }
  ]
}
```

或者在控制台：
1. **权限管理** → **存储桶访问权限**
2. **公共权限** → 选择 **公有读私有写**
3. 点击 **保存**

---

### 步骤5：检查图片是否存在于COS

#### 5.1 查看COS中的文件列表

在腾讯云COS控制台：
1. 进入存储桶 `yjsp-1367462091`
2. 查看文件列表
3. 确认以下目录和文件是否存在：

**必需的占位图和默认图**：
```
images/
├── empty/
│   ├── no-search.png
│   ├── no-data.png
│   ├── no-recipe.png
│   └── no-comment.png
└── default/
    ├── avatar.png
    ├── recipe-cover.png
    ├── video-cover.png
    └── category.png
```

#### 5.2 如果图片不存在

**临时方案**：使用在线占位图服务

修改 `utils/cdn.js`（或 `config/cdn.js`）：

```javascript
const CDN_CONFIG = {
  baseUrl: COS_BASE_URL,
  
  // 临时使用在线占位图
  placeholders: {
    noSearch: 'https://via.placeholder.com/400x300/f5f5f5/999999?text=暂无搜索结果',
    noData: 'https://via.placeholder.com/400x300/f5f5f5/999999?text=暂无数据',
    noRecipe: 'https://via.placeholder.com/400x300/f5f5f5/999999?text=暂无食谱',
    noComment: 'https://via.placeholder.com/400x300/f5f5f5/999999?text=暂无评论',
  },
  
  defaults: {
    avatar: 'https://via.placeholder.com/100x100/4CAF50/ffffff?text=用户',
    recipeCover: 'https://via.placeholder.com/600x400/FF9800/ffffff?text=食谱',
    videoCover: 'https://via.placeholder.com/600x400/2196F3/ffffff?text=视频',
    categoryIcon: 'https://via.placeholder.com/80x80/9C27B0/ffffff?text=分类',
  }
};
```

⚠️ **注意**：使用 `via.placeholder.com` 需要在小程序后台配置：
```
downloadFile合法域名：https://via.placeholder.com
```

**长期方案**：上传图片到COS

参考：`对象存储图片修复完整方案.md` 第5步

---

### 步骤6：检查前端代码是否正确使用CDN配置

#### 6.1 检查是否引入了cdn.js

```javascript
// ✅ 正确引入
import { getCdnUrl, getPlaceholder, processRecipeList } from '@/utils/cdn';

// 或
const { getCdnUrl, getPlaceholder } = require('@/utils/cdn');
```

#### 6.2 检查是否使用了处理函数

```javascript
// ❌ 错误：直接使用API返回的数据
api.getRecipeList().then(res => {
  this.setData({ recipes: res.data });
});

// ✅ 正确：使用processRecipeList处理
import { processRecipeList } from '@/utils/cdn';

api.getRecipeList().then(res => {
  const recipes = processRecipeList(res.data);
  this.setData({ recipes });
});
```

#### 6.3 检查占位图配置

```javascript
// ❌ 错误：仍使用本地路径
data: {
  placeholderImage: 'E:\\...\\no-search.png'
}

// ✅ 正确：使用getPlaceholder
import { getPlaceholder } from '@/utils/cdn';

data: {
  placeholderImage: getPlaceholder('noSearch')
}
```

---

### 步骤7：检查后端返回的图片URL格式

#### 7.1 查看API返回数据

在小程序控制台或Network面板查看API返回：

```javascript
// 调用API并打印返回数据
api.getRecipeList({ page: 1, limit: 1 }).then(res => {
  console.log('=== API返回的食谱数据 ===');
  console.log(JSON.stringify(res.data[0], null, 2));
});
```

#### 7.2 检查返回的URL格式

**后端应该返回完整的COS URL**：

```json
{
  "id": 1,
  "cover": "https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/uploads/cover_xxx.jpg",
  "videoCover": "https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/uploads/video_xxx.jpg"
}
```

**如果返回的是相对路径**：

```json
{
  "id": 1,
  "cover": "/uploads/cover_xxx.jpg",
  "videoCover": "/uploads/video_xxx.jpg"
}
```

那么**必须**使用 `processRecipeList()` 来转换URL。

#### 7.3 检查后端环境变量

在云托管控制台检查环境变量：

```bash
CDN_BASE_URL=https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com
```

如果没有或不正确，需要更新并重启服务。

---

## 🎯 快速诊断命令

在小程序控制台运行以下代码进行完整诊断：

```javascript
// 完整诊断脚本
const { getCdnUrl, getPlaceholder, getDefaultImage, COS_BASE_URL } = require('@/utils/cdn');

console.log('========================================');
console.log('图片加载问题诊断');
console.log('========================================');

// 1. CDN配置检查
console.log('\n1. CDN配置:');
console.log('   COS基础URL:', COS_BASE_URL);
console.log('   无搜索占位图:', getPlaceholder('noSearch'));
console.log('   默认食谱封面:', getDefaultImage('recipeCover'));

// 2. URL转换测试
console.log('\n2. URL转换测试:');
console.log('   相对路径转换:', getCdnUrl('/uploads/test.jpg'));
console.log('   完整URL保持:', getCdnUrl('https://example.com/test.jpg'));
console.log('   空值处理:', getCdnUrl(''));

// 3. 实际数据检查
console.log('\n3. 实际数据检查:');
const testRecipe = this.data.recipes && this.data.recipes[0];
if (testRecipe) {
  console.log('   第一个食谱ID:', testRecipe.id);
  console.log('   封面URL:', testRecipe.cover);
  console.log('   视频封面URL:', testRecipe.videoCover);
  console.log('   URL是否完整:', testRecipe.cover?.startsWith('http'));
} else {
  console.log('   暂无食谱数据');
}

console.log('\n========================================');
console.log('诊断完成，请截图上述信息');
console.log('========================================');
```

---

## 📝 问题解决检查清单

请逐一检查以下项目：

### 域名配置
- [ ] 小程序后台已配置 downloadFile 合法域名：`https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com`
- [ ] 开发者工具勾选了"不校验合法域名"（开发环境）
- [ ] 域名配置已等待3-5分钟生效
- [ ] 已重启开发者工具

### COS配置
- [ ] COS存储桶权限设置为"公有读私有写"
- [ ] 可以在浏览器中直接访问图片URL
- [ ] 占位图和默认图已上传到COS（或使用在线占位图）

### 前端代码
- [ ] 已复制 `cdn.js` 到前端项目
- [ ] 在页面中正确引入 `cdn.js`
- [ ] 使用 `processRecipeList()` 处理API返回数据
- [ ] 使用 `getPlaceholder()` 设置占位图
- [ ] 所有图片组件添加了 `binderror` 错误处理

### 后端配置
- [ ] 云托管环境变量 `CDN_BASE_URL` 配置正确
- [ ] 后端返回完整的图片URL（或前端统一处理）

---

## 🆘 仍然无法解决？

### 请提供以下信息：

1. **完整的图片URL**（从控制台复制）
   ```
   例如：https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/uploads/xxx.jpg
   ```

2. **在浏览器中访问该URL的结果**
   - 能看到图片？
   - 403错误？
   - 404错误？
   - 无法访问？

3. **小程序后台截图**
   - downloadFile 合法域名配置截图

4. **控制台完整错误信息**
   ```
   包括错误前后的所有日志
   ```

5. **运行诊断脚本的输出**
   ```
   上面提供的完整诊断命令的输出结果
   ```

---

## 💡 最常见的3个原因

### 原因1：域名未配置或未生效（占80%）
**解决**：
- 确认小程序后台已配置 COS 域名
- 等待3-5分钟
- 重启开发者工具

### 原因2：COS权限设置为私有（占15%）
**解决**：
- 在COS控制台设置为"公有读私有写"
- 在浏览器测试URL是否可访问

### 原因3：图片URL仍是本地路径或错误域名（占5%）
**解决**：
- 使用 `cdn.js` 的工具函数
- 确保使用 `processRecipeList()` 处理数据

---

## 📞 下一步

请先：
1. 在控制台打印图片URL，告诉我具体的URL
2. 在浏览器测试该URL是否能访问
3. 确认小程序后台的域名配置

然后我会根据具体情况给您精确的解决方案！

