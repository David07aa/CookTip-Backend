
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
-- CHANGE REPLICATION SOURCE TO SOURCE_LOG_FILE='mysql-bin.000183', SOURCE_LOG_POS=84877744;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `onefoodlibrary` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `onefoodlibrary`;
DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipe_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '食谱ID',
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户ID',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论内容',
  `images` json DEFAULT NULL COMMENT '评论图片数组',
  `likes` int DEFAULT '0' COMMENT '点赞数',
  `reply_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '回复评论ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_comments_recipe` (`recipe_id`),
  KEY `idx_comments_user` (`user_id`),
  KEY `idx_comments_created` (`created_at` DESC),
  KEY `reply_to` (`reply_to`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`reply_to`) REFERENCES `comments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `recipe_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '食谱ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_recipe` (`user_id`,`recipe_id`),
  KEY `idx_favorites_user` (`user_id`),
  KEY `idx_favorites_recipe` (`recipe_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `follower_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '粉丝ID',
  `following_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关注对象ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_follower_following` (`follower_id`,`following_id`),
  KEY `idx_follows_follower` (`follower_id`),
  KEY `idx_follows_following` (`following_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注表';
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `recipe_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '食谱ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_recipe` (`user_id`,`recipe_id`),
  KEY `idx_likes_user` (`user_id`),
  KEY `idx_likes_recipe` (`recipe_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '食谱标题',
  `cover_image` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '封面图片',
  `introduction` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '简介',
  `author_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作者ID',
  `cook_time` int NOT NULL COMMENT '烹饪时间（分钟）',
  `difficulty` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '难度：简单/中等/困难',
  `servings` int NOT NULL COMMENT '份量',
  `taste` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '口味',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类：中餐/西餐/烘焙/饮品等',
  `tags` json DEFAULT NULL COMMENT '标签数组',
  `ingredients` json NOT NULL COMMENT '食材列表',
  `steps` json NOT NULL COMMENT '步骤列表',
  `tips` text COLLATE utf8mb4_unicode_ci COMMENT '小贴士',
  `nutrition` json DEFAULT NULL COMMENT '营养信息',
  `views` int DEFAULT '0' COMMENT '浏览量',
  `likes` int DEFAULT '0' COMMENT '点赞数',
  `collects` int DEFAULT '0' COMMENT '收藏数',
  `comments` int DEFAULT '0' COMMENT '评论数',
  `shares` int DEFAULT '0' COMMENT '分享数',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'published' COMMENT '状态：draft/published/deleted',
  `is_recommended` tinyint(1) DEFAULT '0' COMMENT '是否推荐',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_recipes_category` (`category`),
  KEY `idx_recipes_author` (`author_id`),
  KEY `idx_recipes_status` (`status`),
  KEY `idx_recipes_created` (`created_at` DESC),
  KEY `idx_recipes_views` (`views` DESC),
  CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食谱表';
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES ('018dd488-e930-4b04-b89b-ab98214af966','红烧排骨','https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800','色泽红亮，肉质酥烂，咸甜适中，是一道经典的传统家常菜。','2565ea32-9aa8-4d00-bcda-ea70b681b111',45,'简单',4,'咸鲜','中餐','[\"家常菜\", \"硬菜\", \"下饭菜\"]','[{\"name\": \"排骨\", \"amount\": \"500g\"}, {\"name\": \"生姜\", \"amount\": \"3片\"}, {\"name\": \"葱\", \"amount\": \"2根\"}, {\"name\": \"八角\", \"amount\": \"2个\"}, {\"name\": \"桂皮\", \"amount\": \"1小块\"}, {\"name\": \"料酒\", \"amount\": \"2勺\"}, {\"name\": \"生抽\", \"amount\": \"3勺\"}, {\"name\": \"老抽\", \"amount\": \"1勺\"}, {\"name\": \"冰糖\", \"amount\": \"10颗\"}, {\"name\": \"盐\", \"amount\": \"适量\"}]','[{\"step\": 1, \"image\": \"\", \"description\": \"排骨冷水下锅焯水，撇去浮沫，捞出洗净\"}, {\"step\": 2, \"image\": \"\", \"description\": \"锅中少油，放入冰糖小火炒糖色\"}, {\"step\": 3, \"image\": \"\", \"description\": \"下排骨翻炒上色\"}, {\"step\": 4, \"image\": \"\", \"description\": \"加入葱姜、八角、桂皮爆香\"}, {\"step\": 5, \"image\": \"\", \"description\": \"倒入料酒、生抽、老抽翻炒\"}, {\"step\": 6, \"image\": \"\", \"description\": \"加热水没过排骨，大火烧开转小火炖30分钟\"}, {\"step\": 7, \"image\": \"\", \"description\": \"大火收汁，汤汁浓稠即可出锅\"}]','炒糖色时要小火，糖融化起泡即可，不要炒糊。收汁时要勤翻动，防止粘锅。','{\"fat\": \"28g\", \"carbs\": \"15g\", \"protein\": \"32g\", \"calories\": \"450kcal\"}',375,39,52,0,0,'published',0,'2025-09-30 15:51:14','2025-09-30 15:51:14'),('266cb5e8-9800-4f4c-abd9-230341a41896','戚风蛋糕','https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800','口感轻盈细腻，松软如云朵，是烘焙入门必学的基础蛋糕。','17e09256-465e-4df3-8ca7-eafd816aa129',60,'中等',8,'香甜','烘焙','[\"甜品\", \"蛋糕\", \"下午茶\"]','[{\"name\": \"鸡蛋\", \"amount\": \"5个\"}, {\"name\": \"低筋面粉\", \"amount\": \"90g\"}, {\"name\": \"细砂糖\", \"amount\": \"70g（蛋白）+ 20g（蛋黄）\"}, {\"name\": \"玉米油\", \"amount\": \"50ml\"}, {\"name\": \"牛奶\", \"amount\": \"50ml\"}, {\"name\": \"柠檬汁\", \"amount\": \"几滴\"}]','[{\"step\": 1, \"image\": \"\", \"description\": \"分离蛋黄和蛋白，蛋白放入无水无油的盆中\"}, {\"step\": 2, \"image\": \"\", \"description\": \"蛋黄加糖、油、牛奶搅拌均匀，筛入低筋面粉拌匀\"}, {\"step\": 3, \"image\": \"\", \"description\": \"蛋白加柠檬汁，分三次加糖打发至硬性发泡\"}, {\"step\": 4, \"image\": \"\", \"description\": \"取1/3蛋白霜与蛋黄糊混合，再倒回蛋白盆中翻拌均匀\"}, {\"step\": 5, \"image\": \"\", \"description\": \"倒入8寸模具，震出气泡\"}, {\"step\": 6, \"image\": \"\", \"description\": \"烤箱预热150度，烤60分钟\"}, {\"step\": 7, \"image\": \"\", \"description\": \"出炉立即倒扣，完全冷却后脱模\"}]','打发蛋白是关键，要打到提起打蛋器有小尖角。翻拌时要轻柔，避免消泡。倒扣冷却很重要，防止塌陷。','{\"fat\": \"12g\", \"carbs\": \"22g\", \"protein\": \"6g\", \"calories\": \"220kcal\"}',421,36,33,0,0,'published',0,'2025-09-30 15:51:13','2025-09-30 15:51:13'),('327e5c39-5e25-448c-b664-4054453b6401','番茄炒蛋','https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800','经典家常菜，简单易做，营养丰富。鲜嫩的鸡蛋配上酸甜的番茄，是一道百吃不厌的美味。','2565ea32-9aa8-4d00-bcda-ea70b681b111',15,'简单',2,'酸甜','中餐','[\"家常菜\", \"快手菜\", \"下饭菜\"]','[{\"name\": \"鸡蛋\", \"amount\": \"3个\"}, {\"name\": \"番茄\", \"amount\": \"2个\"}, {\"name\": \"食用油\", \"amount\": \"适量\"}, {\"name\": \"盐\", \"amount\": \"适量\"}, {\"name\": \"白糖\", \"amount\": \"1小勺\"}]','[{\"step\": 1, \"image\": \"\", \"description\": \"鸡蛋打入碗中，加少许盐打散\"}, {\"step\": 2, \"image\": \"\", \"description\": \"番茄洗净切块\"}, {\"step\": 3, \"image\": \"\", \"description\": \"锅中热油，倒入蛋液，炒至凝固盛出\"}, {\"step\": 4, \"image\": \"\", \"description\": \"锅中再加少许油，放入番茄翻炒出汁\"}, {\"step\": 5, \"image\": \"\", \"description\": \"加入炒好的鸡蛋，加盐和糖调味，翻炒均匀即可\"}]','番茄要选择熟透的，口感更好。炒鸡蛋时油温要高，快速翻炒。','{\"fat\": \"10g\", \"carbs\": \"8g\", \"protein\": \"12g\", \"calories\": \"180kcal\"}',187,107,43,0,0,'published',0,'2025-09-30 15:51:13','2025-09-30 15:51:13'),('5708f619-3d4f-4278-8e68-a8a21c47b2fc','抹茶拿铁','https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800','清新的抹茶配上香浓的牛奶，一杯治愈系的饮品，完美的下午茶时光。','17e09256-465e-4df3-8ca7-eafd816aa129',10,'简单',1,'香甜','饮品','[\"饮品\", \"抹茶\", \"下午茶\"]','[{\"name\": \"抹茶粉\", \"amount\": \"5g\"}, {\"name\": \"牛奶\", \"amount\": \"200ml\"}, {\"name\": \"热水\", \"amount\": \"30ml\"}, {\"name\": \"蜂蜜/糖\", \"amount\": \"适量\"}]','[{\"step\": 1, \"image\": \"\", \"description\": \"抹茶粉加入热水，用打蛋器充分搅拌至无颗粒\"}, {\"step\": 2, \"image\": \"\", \"description\": \"牛奶加热至70度左右\"}, {\"step\": 3, \"image\": \"\", \"description\": \"将热牛奶倒入抹茶液中\"}, {\"step\": 4, \"image\": \"\", \"description\": \"加入蜂蜜或糖调味\"}, {\"step\": 5, \"image\": \"\", \"description\": \"用奶泡器打出奶泡（可选）\"}]','抹茶粉要选择优质的，味道更纯正。可以冰镇后饮用，夏天更爽口。','{\"fat\": \"5g\", \"carbs\": \"20g\", \"protein\": \"7g\", \"calories\": \"150kcal\"}',206,107,6,0,0,'published',0,'2025-09-30 15:51:14','2025-09-30 15:51:14'),('e4069657-16fc-4237-bb18-6c2d2351911f','宫保鸡丁','https://images.unsplash.com/photo-1603073163308-9e6a53b7e9b4?w=800','川菜经典名菜，麻辣鲜香，鸡肉嫩滑，花生酥脆，色香味俱全。','2565ea32-9aa8-4d00-bcda-ea70b681b111',25,'中等',3,'麻辣','中餐','[\"川菜\", \"下饭菜\", \"宴客菜\"]','[{\"name\": \"鸡胸肉\", \"amount\": \"300g\"}, {\"name\": \"花生米\", \"amount\": \"100g\"}, {\"name\": \"干辣椒\", \"amount\": \"10个\"}, {\"name\": \"花椒\", \"amount\": \"1小勺\"}, {\"name\": \"葱姜蒜\", \"amount\": \"适量\"}, {\"name\": \"料酒\", \"amount\": \"1勺\"}, {\"name\": \"酱油\", \"amount\": \"2勺\"}, {\"name\": \"醋\", \"amount\": \"1勺\"}, {\"name\": \"白糖\", \"amount\": \"1勺\"}, {\"name\": \"淀粉\", \"amount\": \"适量\"}]','[{\"step\": 1, \"image\": \"\", \"description\": \"鸡胸肉切丁，加料酒、酱油、淀粉腌制15分钟\"}, {\"step\": 2, \"image\": \"\", \"description\": \"调制宫保汁：酱油、醋、糖、淀粉、水混合\"}, {\"step\": 3, \"image\": \"\", \"description\": \"热油炸花生米至金黄，捞出备用\"}, {\"step\": 4, \"image\": \"\", \"description\": \"鸡丁下锅快速滑炒至变色，盛出\"}, {\"step\": 5, \"image\": \"\", \"description\": \"锅中留油，爆香干辣椒和花椒\"}, {\"step\": 6, \"image\": \"\", \"description\": \"加入葱姜蒜爆香，倒入鸡丁翻炒\"}, {\"step\": 7, \"image\": \"\", \"description\": \"淋入宫保汁，翻炒均匀，最后加入花生米即可\"}]','鸡肉一定要嫩，腌制时间不要太长。花椒和干辣椒不要炒糊，保持小火。','{\"fat\": \"18g\", \"carbs\": \"25g\", \"protein\": \"28g\", \"calories\": \"380kcal\"}',257,90,29,0,0,'published',0,'2025-09-30 15:51:13','2025-09-30 15:51:13');
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `shopping_lists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopping_lists` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `items` json NOT NULL COMMENT '购物项目',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_shopping_user` (`user_id`),
  CONSTRAINT `shopping_lists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物清单表';
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `shopping_lists` WRITE;
/*!40000 ALTER TABLE `shopping_lists` DISABLE KEYS */;
/*!40000 ALTER TABLE `shopping_lists` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `openid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '微信openid',
  `nick_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '昵称',
  `avatar` text COLLATE utf8mb4_unicode_ci COMMENT '头像URL',
  `bio` text COLLATE utf8mb4_unicode_ci COMMENT '个人简介',
  `is_vip` tinyint(1) DEFAULT '0' COMMENT '是否VIP',
  `followers` int DEFAULT '0' COMMENT '粉丝数',
  `following` int DEFAULT '0' COMMENT '关注数',
  `total_likes` int DEFAULT '0' COMMENT '总获赞数',
  `recipe_count` int DEFAULT '0' COMMENT '食谱数量',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`),
  KEY `idx_users_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('17e09256-465e-4df3-8ca7-eafd816aa129','test_openid_002','厨艺新手小李','https://i.pravatar.cc/300?img=2','正在学习做菜，希望能做出好吃的菜肴~',0,0,0,0,2,'2025-09-30 15:51:13','2025-09-30 15:51:14'),('2565ea32-9aa8-4d00-bcda-ea70b681b111','test_openid_001','美食达人小王','https://i.pravatar.cc/300?img=1','热爱烹饪，分享美食，享受生活！',0,0,0,0,3,'2025-09-30 15:51:13','2025-09-30 15:51:14');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

