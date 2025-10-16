# CookTip Backend - 美食菜谱小程序后端

<div align="center">
  <h3>🍳 基于 NestJS 的美食菜谱小程序后端 API</h3>
  <p>微信云托管 + 云数据库 + 对象存储</p>
</div>

---

## 📚 项目文档导航

### 📖 核心文档
- **[项目架构文档.md](./项目架构文档.md)** - 🌟 **完整架构说明（推荐从这里开始）**
- **[后端API开发文档.md](./后端API开发文档.md)** - 完整 API 接口文档
- **[后端技术选型方案.md](./后端技术选型方案.md)** - 技术栈选型依据
- **[前端对接文档-新版.md](./前端对接文档-新版.md)** - 小程序对接指南

### ☁️ 云函数相关
- **[云函数部署完整指南.md](./云函数部署完整指南.md)** - 云函数部署步骤
- **[云函数API网关-README.md](./云函数API网关-README.md)** - API网关说明
- **[云函数快速参考.md](./云函数快速参考.md)** - 常用参考

### 🛠️ 工具文档
- **[miniprogram-utils/使用示例.md](./miniprogram-utils/使用示例.md)** - 小程序工具使用
- **[cloudfunctions/api-proxy/README.md](./cloudfunctions/api-proxy/README.md)** - API代理说明

---

## 🛠️ 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | 10.x | 后端框架 |
| TypeScript | 5.x | 开发语言 |
| MySQL | 8.0 | 数据库 |
| TypeORM | 0.3.x | ORM |
| JWT | - | 身份认证 |
| Swagger | - | API 文档 |
| Docker | - | 容器化 |

---

## 📊 项目架构

```
CookTip-Backend/
├── src/                      # 源代码
│   ├── modules/             # 业务模块
│   │   ├── auth/           # 认证模块
│   │   ├── user/           # 用户模块
│   │   ├── recipe/         # 食谱模块
│   │   ├── category/       # 分类模块
│   │   ├── comment/        # 评论模块
│   │   ├── favorite/       # 收藏模块
│   │   ├── search/         # 搜索模块
│   │   ├── stats/          # 统计模块
│   │   ├── upload/         # 上传模块
│   │   └── shopping-list/  # 购物清单模块
│   ├── entities/           # 数据实体
│   ├── common/             # 公共模块
│   ├── app.module.ts       # 根模块
│   └── main.ts             # 入口文件
├── database/               # 数据库脚本
│   ├── init.sql           # 初始化脚本
│   └── seed.sql           # 测试数据
├── scripts/                # 工具脚本
│   ├── init-cloudbase-db.js      # 初始化云托管数据库
│   └── migrate-to-cloudbase.js   # 数据库迁移脚本
└── dist/                   # 编译输出
```

---

## 🚀 快速启动

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填写数据库配置

# 3. 初始化数据库
node scripts/init-cloudbase-db.js

# 4. 启动开发服务器
npm run start:dev

# 5. 访问 API 文档
# http://localhost:3000/api/docs
```

### 生产部署

```bash
# 推送代码到 GitHub，自动触发云托管部署
git push origin main
```

---

## 📦 核心脚本

### 数据库相关

| 脚本 | 说明 |
|------|------|
| `init-cloudbase-db.js` | 初始化云托管数据库表结构 |
| `migrate-to-cloudbase.js` | 从旧数据库迁移数据到云托管 |

### NPM 脚本

| 命令 | 说明 |
|------|------|
| `npm run start:dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start:prod` | 启动生产服务器 |

---

## 🌐 线上环境

| 服务 | 地址 |
|------|------|
| API 基础地址 | https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com/api/v1 |
| API 文档 | https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com/api/docs |
| 对象存储 | https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com |

**⚠️ 注意**：当前使用公网测试地址，生产环境建议配置自定义域名。

---

## 🗄️ 数据库信息

| 项目 | 信息 |
|------|------|
| 类型 | MySQL 8.0 |
| 平台 | 微信云托管 |
| 内网地址 | 10.32.104.73:3306 |
| 外网地址 | sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com:23831 |
| 数据库名 | cooktip |

---

## 📝 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 Airbnb 代码规范
- 使用 ESLint + Prettier

### Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试
chore: 构建/工具链
```

---

## 🎯 核心功能

- ✅ 微信小程序登录
- ✅ 食谱增删改查
- ✅ 分类管理
- ✅ 评论系统
- ✅ 收藏功能
- ✅ 点赞功能
- ✅ 搜索功能
- ✅ 统计分析
- ✅ 购物清单
- ✅ 图片上传（对象存储）

---

## 📈 性能优化

| 优化项 | 效果 |
|--------|------|
| 数据库内网访问 | 延迟 <1ms |
| 图片 CDN 加速 | 加载速度提升 50% |
| API 响应缓存 | 减少数据库查询 |
| 连接池优化 | 并发能力提升 |

---

## 🔐 安全措施

- ✅ JWT Token 认证
- ✅ 请求频率限制
- ✅ SQL 注入防护
- ✅ XSS 防护
- ✅ CORS 配置
- ✅ 环境变量隔离

---

## 📞 技术支持

如有问题，请查阅对应的文档或联系开发团队。

---

## 📄 License

MIT License

---

**Last Updated**: 2025-10-09  
**Current Version**: 1.0.0

