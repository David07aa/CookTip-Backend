-- CookTip 数据库初始化脚本
-- 创建时间: 2025-01-08

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `openid` VARCHAR(100) UNIQUE NOT NULL COMMENT '微信OpenID',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `bio` VARCHAR(200) DEFAULT NULL COMMENT '个人简介',
  `recipe_count` INT DEFAULT 0 COMMENT '发布食谱数',
  `follower_count` INT DEFAULT 0 COMMENT '粉丝数',
  `following_count` INT DEFAULT 0 COMMENT '关注数',
  `favorite_count` INT DEFAULT 0 COMMENT '收藏数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_openid (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(255) DEFAULT NULL COMMENT '图标URL',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
  `recipe_count` INT DEFAULT 0 COMMENT '食谱数量',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- ----------------------------
-- Table structure for recipes
-- ----------------------------
DROP TABLE IF EXISTS `recipes`;
CREATE TABLE `recipes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '食谱ID',
  `user_id` INT NOT NULL COMMENT '作者ID',
  `category_id` INT DEFAULT NULL COMMENT '分类ID',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图',
  `description` TEXT DEFAULT NULL COMMENT '简介',
  `difficulty` VARCHAR(20) DEFAULT NULL COMMENT '难度',
  `cook_time` INT DEFAULT NULL COMMENT '烹饪时间（分钟）',
  `servings` INT DEFAULT NULL COMMENT '份量',
  `taste` VARCHAR(20) DEFAULT NULL COMMENT '口味',
  `ingredients` JSON DEFAULT NULL COMMENT '食材列表',
  `steps` JSON DEFAULT NULL COMMENT '步骤列表',
  `tips` TEXT DEFAULT NULL COMMENT '小贴士',
  `tags` JSON DEFAULT NULL COMMENT '标签',
  `nutrition` JSON DEFAULT NULL COMMENT '营养信息',
  `likes` INT DEFAULT 0 COMMENT '点赞数',
  `favorites` INT DEFAULT 0 COMMENT '收藏数',
  `comments` INT DEFAULT 0 COMMENT '评论数',
  `views` INT DEFAULT 0 COMMENT '浏览量',
  `status` VARCHAR(20) DEFAULT 'published' COMMENT '状态：published/draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX idx_user_id (`user_id`),
  INDEX idx_category_id (`category_id`),
  INDEX idx_status (`status`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食谱表';

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
  `recipe_id` INT NOT NULL COMMENT '食谱ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `parent_id` INT DEFAULT NULL COMMENT '父评论ID（回复）',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `images` JSON DEFAULT NULL COMMENT '评论图片',
  `likes` INT DEFAULT 0 COMMENT '点赞数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
  INDEX idx_recipe_id (`recipe_id`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ----------------------------
-- Table structure for favorites
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `recipe_id` INT NOT NULL COMMENT '食谱ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `user_recipe` (`user_id`, `recipe_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
  INDEX idx_user_id (`user_id`),
  INDEX idx_recipe_id (`recipe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ----------------------------
-- Table structure for likes
-- ----------------------------
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `target_type` VARCHAR(20) NOT NULL COMMENT '点赞目标类型：recipe/comment',
  `target_id` INT NOT NULL COMMENT '目标ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `user_target` (`user_id`, `target_type`, `target_id`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_target (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- ----------------------------
-- Table structure for shopping_list
-- ----------------------------
DROP TABLE IF EXISTS `shopping_list`;
CREATE TABLE `shopping_list` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '购物清单ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '物品名称',
  `amount` VARCHAR(50) DEFAULT NULL COMMENT '数量',
  `category` VARCHAR(20) DEFAULT NULL COMMENT '分类',
  `checked` BOOLEAN DEFAULT FALSE COMMENT '是否已购买',
  `recipe_id` INT DEFAULT NULL COMMENT '关联食谱ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE SET NULL,
  INDEX idx_user_id (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物清单表';

SET FOREIGN_KEY_CHECKS = 1;

-- 初始化分类数据
INSERT INTO `categories` (`name`, `icon`, `description`, `sort_order`) VALUES
('中餐', 'https://example.com/icons/chinese.png', '传统中式美食', 1),
('西餐', 'https://example.com/icons/western.png', '西式料理', 2),
('日韩料理', 'https://example.com/icons/asian.png', '日本和韩国料理', 3),
('烘焙甜点', 'https://example.com/icons/dessert.png', '蛋糕、面包、甜品', 4),
('家常菜', 'https://example.com/icons/home.png', '简单易做的家常菜', 5),
('快手菜', 'https://example.com/icons/fast.png', '30分钟内完成', 6),
('素食', 'https://example.com/icons/vegetarian.png', '素食料理', 7),
('汤羹', 'https://example.com/icons/soup.png', '各式汤品', 8),
('小吃', 'https://example.com/icons/snack.png', '特色小吃', 9),
('饮品', 'https://example.com/icons/drink.png', '饮料和茶饮', 10);

-- 显示表结构
SHOW TABLES;

