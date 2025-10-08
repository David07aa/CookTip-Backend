-- CookTip 测试数据
-- 用于开发和测试环境

SET NAMES utf8mb4;

-- 插入测试用户
INSERT INTO `users` (`openid`, `nickname`, `avatar`, `bio`) VALUES
('test_openid_001', '美食达人小王', 'https://example.com/avatars/user1.jpg', '热爱烹饪，分享美食'),
('test_openid_002', '厨艺爱好者', 'https://example.com/avatars/user2.jpg', '每天一道新菜'),
('test_openid_003', '家常菜大师', 'https://example.com/avatars/user3.jpg', '妈妈的味道');

-- 插入测试食谱
INSERT INTO `recipes` (`user_id`, `category_id`, `title`, `cover_image`, `description`, `difficulty`, `cook_time`, `servings`, `taste`, `ingredients`, `steps`, `tips`, `tags`, `status`) VALUES
(1, 1, '红烧肉', 'https://example.com/recipes/hongshaorou.jpg', '经典家常菜，肥而不腻，入口即化', '简单', 90, 4, '咸鲜',
'[{"name":"五花肉","amount":"500克"},{"name":"冰糖","amount":"30克"},{"name":"料酒","amount":"2勺"},{"name":"生抽","amount":"3勺"},{"name":"老抽","amount":"1勺"}]',
'[{"step":1,"description":"五花肉切块，冷水下锅焯水","image":"https://example.com/steps/1.jpg","tips":"焯水时加入料酒和姜片去腥"},{"step":2,"description":"锅中放油，加入冰糖炒糖色","image":"https://example.com/steps/2.jpg","tips":"小火慢炒，糖色变焦糖色即可"}]',
'炖煮时保持小火，时间越长越入味',
'["中餐","家常菜","下饭菜"]',
'published'),

(1, 5, '西红柿炒蛋', 'https://example.com/recipes/xihongshi.jpg', '简单快手，营养美味', '超简单', 15, 2, '酸甜',
'[{"name":"西红柿","amount":"2个"},{"name":"鸡蛋","amount":"3个"},{"name":"白糖","amount":"少许"},{"name":"盐","amount":"适量"}]',
'[{"step":1,"description":"鸡蛋打散，西红柿切块","image":""},{"step":2,"description":"先炒鸡蛋，盛出备用","image":""},{"step":3,"description":"炒西红柿，加入鸡蛋翻炒","image":""}]',
'加少许白糖提味',
'["家常菜","快手菜"]',
'published'),

(2, 4, '戚风蛋糕', 'https://example.com/recipes/cake.jpg', '松软细腻的完美蛋糕', '中等', 60, 8, '香甜',
'[{"name":"低筋面粉","amount":"85克"},{"name":"鸡蛋","amount":"5个"},{"name":"牛奶","amount":"40克"},{"name":"玉米油","amount":"40克"},{"name":"白糖","amount":"70克"}]',
'[{"step":1,"description":"分离蛋黄和蛋白","image":""},{"step":2,"description":"蛋黄加油奶搅拌均匀","image":""},{"step":3,"description":"蛋白打发至硬性发泡","image":""},{"step":4,"description":"混合后倒入模具，烤箱160度50分钟","image":""}]',
'蛋白一定要打发到位，倒扣晾凉',
'["烘焙甜点"]',
'published');

-- 插入测试评论
INSERT INTO `comments` (`recipe_id`, `user_id`, `content`, `likes`) VALUES
(1, 2, '做得很成功，味道很棒！家人都很喜欢。', 5),
(1, 3, '按照这个方法做的，确实肥而不腻，谢谢分享！', 3),
(2, 3, '快手菜首选，每天早上都做！', 2);

-- 插入测试收藏
INSERT INTO `favorites` (`user_id`, `recipe_id`) VALUES
(2, 1),
(3, 1),
(3, 2);

-- 插入测试点赞
INSERT INTO `likes` (`user_id`, `target_type`, `target_id`) VALUES
(2, 'recipe', 1),
(3, 'recipe', 1),
(3, 'recipe', 2),
(2, 'comment', 1);

-- 更新统计数据
UPDATE `recipes` SET `likes` = 2, `favorites` = 2, `views` = 150, `comments` = 2 WHERE `id` = 1;
UPDATE `recipes` SET `likes` = 1, `favorites` = 1, `views` = 80, `comments` = 1 WHERE `id` = 2;
UPDATE `recipes` SET `views` = 45 WHERE `id` = 3;

UPDATE `users` SET `recipe_count` = 2 WHERE `id` = 1;
UPDATE `users` SET `recipe_count` = 1 WHERE `id` = 2;
UPDATE `users` SET `favorite_count` = 2 WHERE `id` = 3;
UPDATE `users` SET `favorite_count` = 1 WHERE `id` = 2;

UPDATE `categories` SET `recipe_count` = 1 WHERE `id` = 1;
UPDATE `categories` SET `recipe_count` = 1 WHERE `id` = 4;
UPDATE `categories` SET `recipe_count` = 1 WHERE `id` = 5;

-- 显示插入的数据数量
SELECT '测试数据插入完成' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS recipe_count FROM recipes;
SELECT COUNT(*) AS comment_count FROM comments;
SELECT COUNT(*) AS favorite_count FROM favorites;
SELECT COUNT(*) AS like_count FROM likes;

