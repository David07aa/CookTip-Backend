# 🔧 需要添加 DATABASE_URL

## 当前状态

已成功添加以下环境变量：
- ✅ WECHAT_APPID
- ✅ WECHAT_SECRET  
- ✅ JWT_SECRET

还需要：
- ⏳ DATABASE_URL (Neon PostgreSQL 连接字符串)

## 如何获取 DATABASE_URL

### 方式 1: 从 Neon Dashboard 获取

1. 登录 Neon: https://neon.tech
2. 选择您的项目
3. 点击 "Connection Details"
4. 复制 "Connection string"

格式类似：
```
postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

### 方式 2: 从之前的配置获取

如果之前已经配置过，可以从：
- 之前的 `.env` 文件
- Vercel 项目的环境变量备份
- Neon 项目的连接信息

## 添加步骤

获取到 DATABASE_URL 后，执行：

```powershell
# 替换下面的 YOUR_DATABASE_URL 为实际的连接字符串
echo "YOUR_DATABASE_URL" | vercel env add DATABASE_URL production --token G6jj9jmjazCTlSAsQ7BYhbEf
```

## 然后重新部署

```powershell
vercel --prod --force --token G6jj9jmjazCTlSAsQ7BYhbEf --yes
```

## 完成后

固定域名 `https://cooktip-backend.vercel.app` 应该就可以正常访问了！

