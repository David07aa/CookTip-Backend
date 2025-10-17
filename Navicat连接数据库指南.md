# 📊 Navicat连接微信云托管数据库指南

## 🔐 数据库连接信息

### 方式1：外网连接（推荐，适合本地开发）

```
连接名称: CookTip-云托管数据库
主机/IP: sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com
端口: 23831
用户名: root
密码: 050710Xzl
数据库: cooktip
```

### 方式2：内网连接（仅云托管内部可用）

```
连接名称: CookTip-内网数据库
主机/IP: 10.32.104.73
端口: 3306
用户名: root
密码: 050710Xzl
数据库: cooktip
```

---

## 🚀 Navicat连接步骤（外网连接）

### 步骤1：打开Navicat

1. 启动Navicat for MySQL
2. 点击左上角 **"连接"** 按钮
3. 选择 **"MySQL"** 或 **"MariaDB"**

### 步骤2：配置连接参数

**基本设置**：
```
连接名: CookTip-Production
主机: sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com
端口: 23831
用户名: root
密码: 050710Xzl
```

**高级设置**（可选）：
```
使用SSL: 否（如果连接失败可以尝试开启）
字符集: utf8mb4
```

### 步骤3：测试连接

1. 点击左下角 **"测试连接"** 按钮
2. 如果显示 **"连接成功"**，点击 **"确定"**
3. 如果失败，查看下面的"常见问题"

### 步骤4：打开数据库

1. 双击左侧的连接名称
2. 展开连接，找到 `cooktip` 数据库
3. 双击打开数据库

### 步骤5：查看表

展开 `cooktip` 数据库，可以看到以下表：
- `users` - 用户表
- `recipes` - 菜谱表
- `categories` - 分类表
- `comments` - 评论表
- `favorites` - 收藏表
- `likes` - 点赞表
- `shopping_list` - 购物清单表

---

## 📋 详细配置截图指南

### 1. 新建连接

```
点击 Navicat 工具栏：
[连接] → [MySQL]
```

### 2. 填写连接信息

**常规标签页**：
```
┌─────────────────────────────────────────┐
│ 连接名:  CookTip-Production            │
│                                         │
│ 主机: sh-cynosdbmysql-grp-qksrb4s2...  │
│ 端口: 23831                             │
│ 用户名: root                            │
│ 密码: 050710Xzl  [☐ 保存密码]          │
│                                         │
│ [测试连接]  [确定]  [取消]              │
└─────────────────────────────────────────┘
```

**高级标签页**（可选）：
```
┌─────────────────────────────────────────┐
│ 编码: UTF-8                             │
│ 使用压缩: ☐                             │
│ 使用 SSL: ☐                             │
│                                         │
└─────────────────────────────────────────┘
```

### 3. 连接到数据库

```
连接成功后：
[CookTip-Production]
  └─ [cooktip]  ← 双击打开
      ├─ Tables
      │   ├─ users
      │   ├─ recipes
      │   ├─ categories
      │   └─ ...
      ├─ Views
      ├─ Functions
      └─ Stored Procedures
```

---

## 🔧 常见问题和解决方案

### 问题1: 无法连接到数据库

**错误信息**：
```
Can't connect to MySQL server on 'sh-cynosdbmysql-grp-qksrb4s2...' (10060)
```

**可能原因**：
1. ❌ 外网访问未开启
2. ❌ IP白名单限制
3. ❌ 防火墙阻止

**解决方案**：

#### 方案A：开启外网访问

1. 登录腾讯云控制台
2. 进入：**云数据库 MySQL** 或 **TDSQL-C**
3. 找到你的数据库实例
4. 点击：**实例详情**
5. 查看：**外网地址** 是否已开启
6. 如果未开启，点击 **"开启外网地址"**

#### 方案B：添加IP白名单

1. 在数据库实例详情页
2. 点击：**安全组** 或 **访问控制**
3. 添加你的本地IP地址到白名单
4. 获取本地IP：访问 https://ip.cn/ 或 https://www.whatismyip.com/

#### 方案C：使用VPN或内网穿透

如果外网访问被禁用，可以：
1. 使用腾讯云VPN连接到VPC
2. 使用跳板机（堡垒机）
3. 通过SSH隧道连接

### 问题2: 认证失败

**错误信息**：
```
Access denied for user 'root'@'...' (using password: YES)
```

**解决方案**：
1. 确认用户名：`root`
2. 确认密码：`050710Xzl`
3. 检查密码是否包含特殊字符或空格
4. 尝试重置数据库密码

### 问题3: 数据库不存在

**错误信息**：
```
Unknown database 'cooktip'
```

**解决方案**：
1. 不要在"初始数据库"中填写数据库名
2. 先连接到服务器
3. 连接成功后，手动选择 `cooktip` 数据库

### 问题4: SSL连接问题

**错误信息**：
```
SSL connection error
```

**解决方案**：
1. 在"高级"标签中，取消勾选 **"使用SSL"**
2. 或者下载SSL证书并配置

---

## 🔒 安全建议

### 1. 密码管理

⚠️ **重要**：数据库密码已暴露在文档中，建议：

1. **立即修改数据库密码**
   ```
   腾讯云控制台 → 云数据库 → 实例列表 → 重置密码
   ```

2. **更新配置文件**
   - 修改 `cloudbase-env-vars.json` 中的 `DB_PASSWORD`
   - 重新部署云托管服务

3. **使用密钥管理**
   - 将敏感信息存储在腾讯云密钥管理服务（KMS）
   - 或使用环境变量

### 2. IP白名单

只允许信任的IP访问数据库：
```
腾讯云控制台 → 云数据库 → 安全组
添加规则：
- 类型：MySQL(3306)
- 来源：你的IP地址/32
- 策略：允许
```

### 3. 只读账户

创建只读账户用于日常查询：
```sql
-- 连接到数据库后执行
CREATE USER 'readonly'@'%' IDENTIFIED BY '新密码';
GRANT SELECT ON cooktip.* TO 'readonly'@'%';
FLUSH PRIVILEGES;
```

### 4. 备份数据

定期备份数据：
```
Navicat 菜单：
工具 → 备份 → 备份表
```

---

## 📊 常用SQL查询

连接成功后，可以执行以下查询：

### 查看所有用户
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

### 查看所有菜谱
```sql
SELECT id, title, description, view_count, like_count 
FROM recipes 
ORDER BY created_at DESC 
LIMIT 10;
```

### 查看分类统计
```sql
SELECT 
  c.name AS category_name,
  COUNT(r.id) AS recipe_count
FROM categories c
LEFT JOIN recipes r ON r.category_id = c.id
GROUP BY c.id, c.name
ORDER BY recipe_count DESC;
```

### 查看最近登录用户
```sql
SELECT 
  id, 
  nickname, 
  openid, 
  created_at,
  updated_at
FROM users 
ORDER BY updated_at DESC 
LIMIT 20;
```

### 查看数据库统计
```sql
-- 用户总数
SELECT COUNT(*) AS total_users FROM users;

-- 菜谱总数
SELECT COUNT(*) AS total_recipes FROM recipes;

-- 评论总数
SELECT COUNT(*) AS total_comments FROM comments;

-- 收藏总数
SELECT COUNT(*) AS total_favorites FROM favorites;
```

---

## 🎯 快速测试

### 测试1：连接测试
```sql
SELECT VERSION();
-- 应该返回 MySQL 版本号
```

### 测试2：查看当前数据库
```sql
SELECT DATABASE();
-- 应该返回 'cooktip'
```

### 测试3：查看所有表
```sql
SHOW TABLES;
-- 应该显示所有7个表
```

### 测试4：查看用户数量
```sql
SELECT COUNT(*) FROM users;
-- 返回当前用户总数
```

---

## 📝 连接信息汇总

### 生产环境（外网）
```
主机: sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com
端口: 23831
用户: root
密码: 050710Xzl
数据库: cooktip
字符集: utf8mb4
```

### 内网环境（仅云托管内部）
```
主机: 10.32.104.73
端口: 3306
用户: root
密码: 050710Xzl
数据库: cooktip
字符集: utf8mb4
```

---

## ⚠️ 重要提醒

1. **密码安全**
   - ⚠️ 当前密码已暴露，建议立即修改
   - 不要在公开渠道分享数据库密码

2. **只读操作**
   - 生产环境请谨慎执行 UPDATE、DELETE 操作
   - 建议先在测试环境验证

3. **备份习惯**
   - 执行重要操作前先备份
   - 定期导出数据库

4. **监控访问**
   - 定期检查数据库访问日志
   - 关注异常连接

---

## 🎉 成功连接检查清单

- [ ] Navicat已安装
- [ ] 已获取数据库连接信息
- [ ] 已在Navicat中创建新连接
- [ ] 测试连接成功
- [ ] 可以看到 `cooktip` 数据库
- [ ] 可以看到所有表（users, recipes等）
- [ ] 可以执行SQL查询
- [ ] 已修改数据库密码（推荐）
- [ ] 已配置IP白名单（推荐）

---

如果按照上述步骤仍无法连接，请提供：
1. Navicat的错误信息截图
2. 你的网络环境（公司、家庭等）
3. 是否使用了代理或VPN

祝连接成功！ 🚀

