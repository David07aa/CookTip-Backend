-- ============================================
-- 一家食谱小程序 - MySQL 数据库表结构
-- 数据库: onefoodlibrary
-- 创建日期: 2025-09-30
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
  nick_name VARCHAR(100) COMMENT '昵称',
  avatar TEXT COMMENT '头像URL',
  bio TEXT COMMENT '个人简介',
  is_vip BOOLEAN DEFAULT FALSE COMMENT '是否VIP',
  followers INTEGER DEFAULT 0 COMMENT '粉丝数',
  following INTEGER DEFAULT 0 COMMENT '关注数',
  total_likes INTEGER DEFAULT 0 COMMENT '总获赞数',
  recipe_count INTEGER DEFAULT 0 COMMENT '食谱数量',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_users_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 食谱表
CREATE TABLE IF NOT EXISTS recipes (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL COMMENT '食谱标题',
  cover_image TEXT NOT NULL COMMENT '封面图片',
  introduction TEXT NOT NULL COMMENT '简介',
  author_id CHAR(36) COMMENT '作者ID',
  cook_time INTEGER NOT NULL COMMENT '烹饪时间（分钟）',
  difficulty VARCHAR(20) NOT NULL COMMENT '难度：简单/中等/困难',
  servings INTEGER NOT NULL COMMENT '份量',
  taste VARCHAR(50) COMMENT '口味',
  category VARCHAR(50) NOT NULL COMMENT '分类：中餐/西餐/烘焙/饮品等',
  tags JSON COMMENT '标签数组',
  ingredients JSON NOT NULL COMMENT '食材列表',
  steps JSON NOT NULL COMMENT '步骤列表',
  tips TEXT COMMENT '小贴士',
  nutrition JSON COMMENT '营养信息',
  views INTEGER DEFAULT 0 COMMENT '浏览量',
  likes INTEGER DEFAULT 0 COMMENT '点赞数',
  collects INTEGER DEFAULT 0 COMMENT '收藏数',
  comments INTEGER DEFAULT 0 COMMENT '评论数',
  shares INTEGER DEFAULT 0 COMMENT '分享数',
  status VARCHAR(20) DEFAULT 'published' COMMENT '状态：draft/published/deleted',
  is_recommended BOOLEAN DEFAULT FALSE COMMENT '是否推荐',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_recipes_category (category),
  INDEX idx_recipes_author (author_id),
  INDEX idx_recipes_status (status),
  INDEX idx_recipes_created (created_at DESC),
  INDEX idx_recipes_views (views DESC),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食谱表';

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id CHAR(36) PRIMARY KEY,
  recipe_id CHAR(36) NOT NULL COMMENT '食谱ID',
  user_id CHAR(36) COMMENT '用户ID',
  content TEXT NOT NULL COMMENT '评论内容',
  images JSON COMMENT '评论图片数组',
  likes INTEGER DEFAULT 0 COMMENT '点赞数',
  reply_to CHAR(36) COMMENT '回复评论ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_comments_recipe (recipe_id),
  INDEX idx_comments_user (user_id),
  INDEX idx_comments_created (created_at DESC),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reply_to) REFERENCES comments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL COMMENT '用户ID',
  recipe_id CHAR(36) NOT NULL COMMENT '食谱ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_user_recipe (user_id, recipe_id),
  INDEX idx_favorites_user (user_id),
  INDEX idx_favorites_recipe (recipe_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL COMMENT '用户ID',
  recipe_id CHAR(36) NOT NULL COMMENT '食谱ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_user_recipe (user_id, recipe_id),
  INDEX idx_likes_user (user_id),
  INDEX idx_likes_recipe (recipe_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- 购物清单表
CREATE TABLE IF NOT EXISTS shopping_lists (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL COMMENT '用户ID',
  items JSON NOT NULL COMMENT '购物项目',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_shopping_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物清单表';

-- 关注表
CREATE TABLE IF NOT EXISTS follows (
  id CHAR(36) PRIMARY KEY,
  follower_id CHAR(36) NOT NULL COMMENT '粉丝ID',
  following_id CHAR(36) NOT NULL COMMENT '关注对象ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_follower_following (follower_id, following_id),
  INDEX idx_follows_follower (follower_id),
  INDEX idx_follows_following (following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注表';
