-- ========================================
-- 修复 example.com 示例URL问题
-- 将数据库中的所有示例URL替换为实际的CDN URL
-- ========================================

USE CookTip;

-- 1. 更新用户头像（users表）
UPDATE users 
SET avatar = 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/userImage/Defaultavatar.png'
WHERE avatar LIKE '%example.com%';

-- 2. 更新食谱封面（recipes表）
UPDATE recipes 
SET cover_image = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'
WHERE cover_image LIKE '%example.com%' 
  AND title LIKE '%红烧肉%';

UPDATE recipes 
SET cover_image = 'https://images.unsplash.com/photo-1603073545352-f53f2070e40e?w=800'
WHERE cover_image LIKE '%example.com%' 
  AND title LIKE '%西红柿炒蛋%';

UPDATE recipes 
SET cover_image = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'
WHERE cover_image LIKE '%example.com%' 
  AND title LIKE '%戚风蛋糕%';

-- 3. 更新食谱步骤图片（steps字段是JSON）
-- 注意：这里使用JSON_REPLACE来更新JSON字段中的URL
UPDATE recipes 
SET steps = JSON_REPLACE(
  steps,
  '$[0].image', '',
  '$[1].image', '',
  '$[2].image', '',
  '$[3].image', ''
)
WHERE steps LIKE '%example.com%';

-- 4. 更新分类图标（categories表）
UPDATE categories 
SET icon = CONCAT('/images/category/', LOWER(name), '.png')
WHERE icon LIKE '%example.com%';

-- 5. 验证更新结果
SELECT 
  '用户表' as 表名,
  COUNT(*) as 总记录数,
  SUM(CASE WHEN avatar LIKE '%example.com%' THEN 1 ELSE 0 END) as 剩余示例URL
FROM users

UNION ALL

SELECT 
  '食谱表' as 表名,
  COUNT(*) as 总记录数,
  SUM(CASE WHEN cover_image LIKE '%example.com%' OR steps LIKE '%example.com%' THEN 1 ELSE 0 END) as 剩余示例URL
FROM recipes

UNION ALL

SELECT 
  '分类表' as 表名,
  COUNT(*) as 总记录数,
  SUM(CASE WHEN icon LIKE '%example.com%' THEN 1 ELSE 0 END) as 剩余示例URL
FROM categories;

-- 6. 显示更新后的数据示例
SELECT id, nickname, avatar FROM users LIMIT 5;
SELECT id, title, cover_image FROM recipes LIMIT 5;
SELECT id, name, icon FROM categories LIMIT 5;

