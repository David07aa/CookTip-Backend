# 微信头像自动上传COS配置指南

## 📋 功能说明

系统现已支持**自动处理微信头像**：
- ✅ 登录时自动检测微信头像
- ✅ 下载微信头像并上传到COS
- ✅ 存储路径：`laoxiangji/userImage/user_{userId}_{nickname}_avatar.jpg`
- ✅ 失败时自动降级使用原URL

---

## 🔧 必需的环境变量

需要在**微信云托管 → 服务配置 → 环境变量**中添加以下配置：

```bash
# COS配置（对象存储）
COS_SECRET_ID=你的SecretId（从腾讯云获取）
COS_SECRET_KEY=你的SecretKey（从腾讯云获取）
COS_BUCKET=yjsp-1367462091
COS_REGION=ap-nanjing
```

---

## 📍 如何获取COS密钥

### 1. 进入腾讯云控制台
访问：https://console.cloud.tencent.com/

### 2. 访问密钥管理
控制台 → 访问管理 → 访问密钥 → API密钥管理

### 3. 创建或查看密钥
- 如果已有密钥，直接查看
- 如果没有，点击"新建密钥"

### 4. 复制密钥信息
- `SecretId`：复制到 `COS_SECRET_ID`
- `SecretKey`：复制到 `COS_SECRET_KEY`

### 5. 配置Bucket信息
- `COS_BUCKET`：你的存储桶名称（如：`yjsp-1367462091`）
- `COS_REGION`：存储桶所在地域（如：`ap-nanjing`）

---

## 🚀 配置步骤

### 步骤1：在云托管配置环境变量

1. 打开**微信云托管控制台**
2. 进入你的服务
3. 点击**服务配置** → **环境变量**
4. 添加上述4个环境变量
5. **保存并重新部署服务**

### 步骤2：推送代码并部署

```bash
# 提交代码
git add .
git commit -m "feat: 添加微信头像自动上传COS功能"
git push origin main

# 或者在云托管控制台手动部署
```

### 步骤3：测试功能

1. 在小程序中使用微信登录
2. 查看后端日志，应该看到：
   ```
   ✅ [CloudLogin] 头像处理完成: https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/userImage/user_7_微信用户_avatar.jpg
   ```
3. 检查COS中是否生成了头像文件

---

## 📂 文件存储路径

头像文件将存储在：
```
laoxiangji/userImage/user_{userId}_{nickname}_avatar.jpg
```

**命名规则**：
- `{userId}`：用户数据库ID，确保唯一性
- `{nickname}`：用户昵称（清理特殊字符后）
- 示例：`user_7_微信用户_avatar.jpg`

---

## 🔍 故障排查

### 问题1：头像上传失败

**错误日志**：
```
⚠️ [CloudLogin] 头像处理失败，使用原URL: ...
```

**解决方案**：
1. 检查环境变量是否正确配置
2. 检查SecretId和SecretKey是否有效
3. 检查COS Bucket权限设置

### 问题2：COS权限错误

**错误信息**：`Access Denied`

**解决方案**：
1. 进入COS控制台
2. 选择存储桶 `yjsp-1367462091`
3. 权限管理 → 存储桶访问权限
4. 确保有写入权限

### 问题3：头像仍显示微信URL

**原因**：可能是环境变量未配置

**解决方案**：
1. 检查云托管环境变量
2. 重新部署服务
3. 清理旧用户数据重新登录测试

---

## ✨ 实现的功能

### 1. 自动处理（登录时）
```typescript
// 用户登录时自动处理
if (isWechatAvatar(avatar)) {
  // 下载微信头像
  const imageBuffer = await downloadWechatAvatar(avatar);
  
  // 上传到COS
  const cosUrl = await uploadAvatarToCOS(imageBuffer, userId, nickname);
  
  // 保存到数据库
  user.avatar = cosUrl;
}
```

### 2. 容错处理
- 如果下载失败，使用原URL
- 如果上传失败，使用原URL  
- 不影响用户登录流程

### 3. 路径规范
- 统一存储在 `laoxiangji/userImage/` 目录
- 文件名包含用户ID，避免冲突
- 文件名包含昵称，便于识别

---

## 📝 相关文件

### 后端代码
- `src/utils/wechat-avatar.util.ts` - 头像处理工具类
- `src/modules/auth/auth.service.ts` - 集成头像处理逻辑

### 配置文件
- 云托管环境变量 - COS配置

---

## ⚡ 性能说明

- **下载速度**：1-3秒（取决于微信服务器）
- **上传速度**：1-2秒（COS上传）
- **总耗时**：约2-5秒
- **异步处理**：不阻塞登录响应

---

## 📞 需要帮助？

如果配置过程中遇到问题：
1. 检查环境变量是否配置正确
2. 查看云托管服务日志
3. 确认COS Bucket权限设置

配置完成后，所有新登录用户的微信头像将自动上传到COS！ 🎉

