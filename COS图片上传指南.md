# COS图片上传指南

## 📋 需要上传的文件

请上传以下文件到COS存储桶 `yjsp-1367462091` 的 `laoxiangji/LXJLOGO/` 目录：

### 文件清单

| 文件名 | 用途 | 建议尺寸 | 格式 | 大小限制 |
|--------|------|----------|------|----------|
| `logo.png` | 品牌LOGO | 400×160px | PNG | < 100KB |
| `banner1.jpg` | 轮播图1 | 750×380px | JPG | < 500KB |
| `banner2.jpg` | 轮播图2 | 750×380px | JPG | < 500KB |
| `banner3.jpg` | 轮播图3 | 750×380px | JPG | < 500KB |

---

## 🚀 上传步骤

### 方法1: 通过腾讯云控制台上传（推荐）

#### 步骤1: 登录腾讯云

1. 访问：https://console.cloud.tencent.com/cos
2. 使用您的腾讯云账号登录

#### 步骤2: 进入存储桶

1. 在左侧菜单选择"存储桶列表"
2. 找到并点击存储桶：`yjsp-1367462091`
3. 区域应该是：`ap-nanjing`（南京）

#### 步骤3: 导航到目标目录

1. 点击"文件列表"标签
2. 依次点击进入目录：
   ```
   laoxiangji/ → LXJLOGO/
   ```
3. 如果 `LXJLOGO` 目录不存在，点击"新建文件夹"创建

#### 步骤4: 上传文件

1. 点击"上传文件"按钮
2. 选择准备好的4个文件：
   - logo.png
   - banner1.jpg
   - banner2.jpg
   - banner3.jpg
3. 点击"上传"
4. 等待上传完成

#### 步骤5: 设置权限

**重要**：必须设置为公有读，否则前端无法访问！

对每个文件：
1. 点击文件右侧的"详情"
2. 找到"访问权限"选项
3. 选择"公有读私有写"或"公有读"
4. 点击"保存"

---

### 方法2: 使用COSBrowser工具上传

#### 下载工具

- 官网：https://cloud.tencent.com/document/product/436/11366
- 支持Windows、Mac、Linux

#### 配置连接

1. 打开COSBrowser
2. 输入以下信息：
   - **SecretId**: 从腾讯云控制台获取
   - **SecretKey**: 从腾讯云控制台获取
   - **存储桶名称**: `yjsp-1367462091`
   - **所属地域**: `ap-nanjing`

#### 上传文件

1. 在左侧树形结构中导航到：`laoxiangji/LXJLOGO/`
2. 将文件拖拽到右侧窗口
3. 或点击"上传"按钮选择文件
4. 右键文件 → "设置权限" → 选择"公有读"

---

### 方法3: 使用命令行工具（COSCMD）

#### 安装COSCMD

```bash
pip install coscmd
```

#### 配置

```bash
coscmd config -a <SecretId> -s <SecretKey> -b yjsp-1367462091 -r ap-nanjing
```

#### 上传文件

```bash
# 上传单个文件
coscmd upload logo.png laoxiangji/LXJLOGO/logo.png

# 批量上传
coscmd upload banner1.jpg laoxiangji/LXJLOGO/banner1.jpg
coscmd upload banner2.jpg laoxiangji/LXJLOGO/banner2.jpg
coscmd upload banner3.jpg laoxiangji/LXJLOGO/banner3.jpg
```

#### 设置权限

```bash
coscmd putobjectacl laoxiangji/LXJLOGO/logo.png --grant-read anyone
coscmd putobjectacl laoxiangji/LXJLOGO/banner1.jpg --grant-read anyone
coscmd putobjectacl laoxiangji/LXJLOGO/banner2.jpg --grant-read anyone
coscmd putobjectacl laoxiangji/LXJLOGO/banner3.jpg --grant-read anyone
```

---

## ✅ 验证上传

### 步骤1: 检查文件是否存在

在浏览器中直接访问以下URL，应该能看到图片：

```
https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/LXJLOGO/logo.png
https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/LXJLOGO/banner1.jpg
https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/LXJLOGO/banner2.jpg
https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/LXJLOGO/banner3.jpg
```

### 步骤2: 检查权限

- ✅ 如果能正常显示图片 → 权限正确
- ❌ 如果显示403错误 → 需要设置为公有读

### 步骤3: 测试前端展示

1. 打开微信开发者工具
2. 清除缓存：
   ```javascript
   wx.clearStorageSync()
   wx.reLaunch({ url: '/pages/index/index' })
   ```
3. 刷新首页
4. 检查：
   - LOGO是否显示
   - Banner轮播图是否正常

---

## 🎨 图片制作建议

### LOGO设计

**尺寸**: 400×160px（宽高比 5:2）

**要求**:
- 背景透明（PNG格式）
- 清晰可辨识
- 颜色与品牌风格一致
- 文件大小 < 100KB

**工具推荐**:
- Photoshop
- Figma
- Canva
- 在线LOGO生成器

### Banner设计

**尺寸**: 750×380px（宽高比约 2:1）

**要求**:
- 主题突出、吸引眼球
- 文字清晰易读
- 颜色搭配和谐
- 文件大小 < 500KB

**内容建议**:
- Banner 1: 精选美食推荐（展示特色菜品）
- Banner 2: 每日新菜谱（突出新鲜感）
- Banner 3: 热门美食（展示受欢迎的菜品）

**工具推荐**:
- Photoshop
- 稿定设计
- 创客贴
- Canva

---

## 🔧 图片优化

### 压缩工具

在线工具：
- TinyPNG: https://tinypng.com/
- Squoosh: https://squoosh.app/
- 智图: https://zhitu.isux.us/

命令行工具：
```bash
# 安装ImageMagick
brew install imagemagick  # Mac
choco install imagemagick  # Windows

# 压缩图片
convert logo.png -quality 85 -strip logo_optimized.png
convert banner1.jpg -quality 85 -strip banner1_optimized.jpg
```

### 尺寸调整

如果原图尺寸不对，使用以下命令调整：

```bash
# 调整LOGO尺寸
convert logo.png -resize 400x160 logo_resized.png

# 调整Banner尺寸
convert banner1.jpg -resize 750x380^ -gravity center -extent 750x380 banner1_resized.jpg
```

---

## 📝 常见问题

### Q1: 上传后显示404

**原因**: 文件路径或文件名不正确

**解决**:
1. 确认文件在正确的目录：`laoxiangji/LXJLOGO/`
2. 确认文件名完全一致（区分大小写）
3. 确认没有多余的文件夹层级

### Q2: 上传后显示403

**原因**: 文件权限未设置为公有读

**解决**:
1. 在COS控制台找到该文件
2. 点击"详情"
3. 修改"访问权限"为"公有读"
4. 保存

### Q3: 图片显示模糊

**原因**: 图片尺寸过小或压缩过度

**解决**:
1. 使用推荐的尺寸（2倍图）
2. 压缩质量不低于80%
3. 使用PNG格式（LOGO）
4. 使用JPG格式（Banner）

### Q4: 文件太大上传失败

**原因**: 单个文件超过限制

**解决**:
1. 使用在线工具压缩图片
2. 降低图片质量（85%左右）
3. 优化图片格式

---

## 🎯 最佳实践

### 文件命名

✅ **正确**:
```
logo.png
banner1.jpg
banner2.jpg
banner3.jpg
```

❌ **错误**:
```
Logo.PNG          # 大写
Banner-1.jpg      # 连字符
banner 1.jpg      # 空格
banner_01.jpg     # 不同格式
```

### 权限设置

- 所有图片文件：**公有读**
- 确保前端可以直接访问URL

### 版本管理

如果需要更新图片：
1. **方法1**: 直接覆盖同名文件（推荐）
2. **方法2**: 使用版本号（如 `banner1_v2.jpg`），同时更新后端代码

### 备份

建议保留原图备份：
- 本地电脑保存一份
- 云盘保存一份
- 方便后续修改和优化

---

## 📊 监控和维护

### 定期检查

1. **每周检查**:
   - 图片是否正常显示
   - 加载速度是否正常
   - 是否有404或403错误

2. **每月优化**:
   - 分析用户点击数据
   - 更换表现不佳的banner
   - 优化图片大小

### 统计数据

建议在后端添加banner点击统计：
```javascript
// 前端点击时上报
onBannerTap(e) {
  const { id } = e.currentTarget.dataset
  api.stats.trackBannerClick(id)
}
```

---

**文档更新时间**: 2025年10月29日  
**作者**: CookTip 开发团队

