# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制编译后的文件
COPY --from=builder /app/dist ./dist

# 复制上传目录（包含老乡鸡图片）
COPY uploads ./uploads

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main"]

