# Vercel 环境变量配置指南

## 📋 需要配置的环境变量

微信登录功能需要以下环境变量：

| 变量名 | 说明 | 必需 | 获取方式 |
|--------|------|------|---------|
| `WECHAT_APPID` | 微信小程序 AppID | ✅ 是 | 微信公众平台 |
| `WECHAT_SECRET` | 微信小程序 AppSecret | ✅ 是 | 微信公众平台 |
| `JWT_SECRET` | JWT 加密密钥 | ✅ 是 | 自定义（随机字符串）|
| `POSTGRES_URL` | PostgreSQL 数据库连接 | ✅ 是 | Neon 自动注入 |

---

## 🔑 获取微信小程序密钥

### 步骤 1: 登录微信公众平台

访问：https://mp.weixin.qq.com/

### 步骤 2: 获取 AppID 和 AppSecret

1. 登录后，点击左侧菜单：**开发** → **开发管理** → **开发设置**
2. 在页面中找到 **开发者ID**：
   - **AppID(小程序ID)**：复制这个值（如：`wx1234567890abcdef`）
   - **AppSecret(小程序密钥)**：点击"生成"或"重置"按钮
     - ⚠️ 首次生成需要扫码验证
     - ⚠️ 重置会使旧密钥失效
     - ⚠️ 生成后立即复制保存，关闭页面后无法再查看

**示例**：
```
AppID: wx1234567890abcdef
AppSecret: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## ⚙️ 在 Vercel 配置环境变量

### 方式一：通过 Vercel Dashboard（推荐）

#### 步骤 1: 访问项目设置

访问：https://vercel.com/davids-projects-688aeefc/cooktip-backend

或者：
1. 登录 https://vercel.com/
2. 找到项目 `cooktip-backend`
3. 点击项目名称进入

#### 步骤 2: 进入环境变量设置

1. 点击顶部导航栏的 **Settings**
2. 在左侧菜单中选择 **Environment Variables**

#### 步骤 3: 添加环境变量

**添加 WECHAT_APPID**：
1. 在 **Key** 输入框填入：`WECHAT_APPID`
2. 在 **Value** 输入框填入：你的小程序 AppID（如：`wx1234567890abcdef`）
3. 选择环境（Environment）：
   - ✅ 勾选 **Production**
   - ✅ 勾选 **Preview**
   - ✅ 勾选 **Development**
4. 点击 **Add** 按钮

**添加 WECHAT_SECRET**：
1. 在 **Key** 输入框填入：`WECHAT_SECRET`
2. 在 **Value** 输入框填入：你的小程序 AppSecret
3. 选择所有环境（Production, Preview, Development）
4. 点击 **Add** 按钮

**添加 JWT_SECRET**（如果还没有）：
1. 在 **Key** 输入框填入：`JWT_SECRET`
2. 在 **Value** 输入框填入：随机字符串（如：`your-super-secret-jwt-key-change-this-in-production-12345`）
3. 选择所有环境
4. 点击 **Add** 按钮

#### 步骤 4: 保存并重新部署

1. 环境变量添加完成后，Vercel 会提示需要重新部署
2. 点击 **Redeploy** 按钮，或者使用下面的 CLI 命令重新部署

---

### 方式二：通过 Vercel CLI

使用命令行配置（需要在项目目录下执行）：

```bash
# 设置 WECHAT_APPID
vercel env add WECHAT_APPID production

# 设置 WECHAT_SECRET
vercel env add WECHAT_SECRET production

# 设置 JWT_SECRET
vercel env add JWT_SECRET production
```

执行后会提示输入值，按要求输入即可。

---

## 🚀 重新部署

配置环境变量后，需要重新部署才能生效。

### 方式一：Vercel Dashboard

1. 进入项目页面
2. 点击 **Deployments** 标签
3. 找到最新的部署
4. 点击右侧的 **...** 菜单
5. 选择 **Redeploy**

### 方式二：CLI 命令（推荐）

在项目目录下执行：

```bash
vercel --prod --token G6jj9jmjazCTlSAsQ7BYhbEf --yes
```

---

## ✅ 验证配置

### 1. 检查环境变量是否设置

在 Vercel Dashboard 中：
1. Settings → Environment Variables
2. 确认看到以下变量：
   - ✅ WECHAT_APPID
   - ✅ WECHAT_SECRET
   - ✅ JWT_SECRET
   - ✅ POSTGRES_URL（Neon 自动注入）

### 2. 测试登录接口

等待 2-3 分钟部署完成后：

1. 打开 `验证登录接口.html`
2. 点击"测试 2: 微信登录接口"
3. 查看结果

**预期结果**：
- ✅ 返回 401（code 无效，这是正常的）
- ✅ 返回 400（参数问题）
- ❌ 返回 500（说明环境变量仍有问题）

---

## 🔍 常见问题

### Q1: 找不到 AppSecret 怎么办？

**A**: AppSecret 只在生成时显示一次，如果忘记了需要重置：
1. 进入微信公众平台 → 开发 → 开发管理 → 开发设置
2. 找到 AppSecret，点击"重置"
3. 扫码验证
4. 立即复制新的 AppSecret
5. 更新 Vercel 环境变量

### Q2: 重置 AppSecret 会影响现有用户吗？

**A**: 会！重置后：
- 旧的 AppSecret 立即失效
- 已登录用户的 token 不受影响（token 是用 JWT_SECRET 签名的）
- 新用户登录会使用新的 AppSecret

### Q3: JWT_SECRET 应该设置什么值？

**A**: 建议使用强随机字符串，例如：
```
your-super-secret-jwt-key-change-this-in-production-abc123xyz789
```

或使用命令生成随机字符串：

**Windows CMD 命令**：
```cmd
:: 方法1: 使用 PowerShell 生成（推荐）
powershell -Command "[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))"

:: 方法2: 使用时间戳+随机数
echo jwt-secret-%RANDOM%%RANDOM%%RANDOM%%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
```

**Windows PowerShell 命令**：
```powershell
# 生成32字节的Base64编码字符串
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# 生成64字符的随机字符串
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

**在线工具**：
- https://www.random.org/strings/
- https://generate-secret.vercel.app/

### Q4: 配置后仍然 500 错误？

**A**: 检查以下几点：
1. 环境变量名称是否完全正确（区分大小写）
2. 是否选择了所有环境（Production, Preview, Development）
3. 是否已重新部署
4. 等待 2-3 分钟让部署完成

### Q5: CORS 测试失败怎么办？

**A**: CORS 配置已在代码中设置，如果测试3失败：
1. 检查浏览器是否阻止了请求
2. 清除浏览器缓存
3. 使用无痕/隐私模式测试
4. 确认已重新部署最新代码

---

## 📝 完整配置检查清单

部署前检查：
- [ ] 已获取微信小程序 AppID
- [ ] 已获取微信小程序 AppSecret
- [ ] 已生成或准备 JWT_SECRET

Vercel 配置：
- [ ] 在 Vercel 中添加 WECHAT_APPID
- [ ] 在 Vercel 中添加 WECHAT_SECRET
- [ ] 在 Vercel 中添加 JWT_SECRET
- [ ] 确认所有环境变量选择了 Production/Preview/Development
- [ ] 已触发重新部署

验证：
- [ ] 等待部署完成（2-3 分钟）
- [ ] 运行 `验证登录接口.html` 测试
- [ ] 测试 2 返回 401/400（正常）
- [ ] 测试 3 CORS 正常

---

## 🎯 快速操作步骤总结

1. **获取密钥**：登录微信公众平台，复制 AppID 和 AppSecret
2. **配置 Vercel**：访问 https://vercel.com/ → 项目 → Settings → Environment Variables
3. **添加变量**：添加 WECHAT_APPID、WECHAT_SECRET、JWT_SECRET
4. **重新部署**：运行 `vercel --prod` 或在 Dashboard 点击 Redeploy
5. **等待完成**：等待 2-3 分钟
6. **测试验证**：打开 `验证登录接口.html` 运行测试

---

**配置完成后，请告诉我测试结果！** 🙏

