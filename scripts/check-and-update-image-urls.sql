-- ===========================================
-- 图片URL检查和更新脚本
-- 从云开发存储迁移到腾讯云COS
-- ===========================================

-- 旧域名：https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com
-- 新域名：https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com

-- ===========================================
-- 第1步：检查当前数据
-- ===========================================

-- 查看前10条食谱记录的图片URL
SELECT 
  id, 
  title,
  cover_image,
  CASE 
    WHEN cover_image LIKE '%796a-yjsp-wxxcx%' THEN '使用旧域名'
    WHEN cover_image LIKE '%yjsp-1367462091.cos%' THEN '使用新域名'
    WHEN cover_image LIKE 'http%' THEN '使用其他域名'
    ELSE '相对路径'
  END as url_type
FROM recipes 
WHERE cover_image IS NOT NULL
LIMIT 10;

-- 统计各种URL类型的数量
SELECT 
  COUNT(*) as total_recipes,
  SUM(CASE WHEN cover_image LIKE '%796a-yjsp-wxxcx%' THEN 1 ELSE 0 END) as old_domain_count,
  SUM(CASE WHEN cover_image LIKE '%yjsp-1367462091.cos%' THEN 1 ELSE 0 END) as new_domain_count,
  SUM(CASE WHEN cover_image NOT LIKE 'http%' AND cover_image IS NOT NULL THEN 1 ELSE 0 END) as relative_path_count,
  SUM(CASE WHEN cover_image IS NULL THEN 1 ELSE 0 END) as null_count
FROM recipes;

-- 检查用户表的头像
SELECT 
  id,
  nickname,
  avatar,
  CASE 
    WHEN avatar LIKE '%796a-yjsp-wxxcx%' THEN '使用旧域名'
    WHEN avatar LIKE '%yjsp-1367462091.cos%' THEN '使用新域名'
    ELSE '其他'
  END as url_type
FROM users 
WHERE avatar IS NOT NULL
LIMIT 10;

-- ===========================================
-- 第2步：备份数据（重要！执行更新前必须备份）
-- ===========================================

-- 备份 recipes 表
CREATE TABLE IF NOT EXISTS recipes_backup_20241016 AS SELECT * FROM recipes;

-- 备份 users 表
CREATE TABLE IF NOT EXISTS users_backup_20241016 AS SELECT * FROM users;

-- 验证备份
SELECT COUNT(*) as recipes_backup_count FROM recipes_backup_20241016;
SELECT COUNT(*) as users_backup_count FROM users_backup_20241016;

-- ===========================================
-- 第3步：更新数据库中的URL（仅在确认需要时执行）
-- ===========================================

-- ⚠️ 警告：执行前请确认：
-- 1. 已经备份数据
-- 2. 图片已迁移到新COS存储桶
-- 3. 新COS存储桶权限已设置为公有读
-- 4. 已在浏览器测试新URL可访问

-- 更新 recipes 表的 cover_image 字段
UPDATE recipes 
SET cover_image = REPLACE(
  cover_image, 
  'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com',
  'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com'
)
WHERE cover_image LIKE '%796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com%';

-- 显示更新结果
SELECT ROW_COUNT() as updated_recipes;

-- 更新 users 表的 avatar 字段
UPDATE users 
SET avatar = REPLACE(
  avatar,
  'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com',
  'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com'
)
WHERE avatar LIKE '%796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com%';

-- 显示更新结果
SELECT ROW_COUNT() as updated_users;

-- ===========================================
-- 第4步：验证更新结果
-- ===========================================

-- 验证 recipes 表
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN cover_image LIKE '%796a-yjsp-wxxcx%' THEN 1 ELSE 0 END) as still_old_domain,
  SUM(CASE WHEN cover_image LIKE '%yjsp-1367462091.cos%' THEN 1 ELSE 0 END) as new_domain_count
FROM recipes 
WHERE cover_image IS NOT NULL;

-- 查看更新后的示例数据
SELECT id, title, cover_image 
FROM recipes 
WHERE cover_image LIKE '%yjsp-1367462091.cos%'
LIMIT 5;

-- 验证 users 表
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN avatar LIKE '%796a-yjsp-wxxcx%' THEN 1 ELSE 0 END) as still_old_domain,
  SUM(CASE WHEN avatar LIKE '%yjsp-1367462091.cos%' THEN 1 ELSE 0 END) as new_domain_count
FROM users 
WHERE avatar IS NOT NULL;

-- ===========================================
-- 第5步：如果更新有误，回滚数据
-- ===========================================

-- 回滚 recipes 表（仅在需要时执行）
-- TRUNCATE TABLE recipes;
-- INSERT INTO recipes SELECT * FROM recipes_backup_20241016;

-- 回滚 users 表（仅在需要时执行）
-- TRUNCATE TABLE users;
-- INSERT INTO users SELECT * FROM users_backup_20241016;

-- ===========================================
-- 使用说明
-- ===========================================

-- 1. 先执行"第1步：检查当前数据"，查看URL格式
-- 2. 如果数据库存储的是完整URL（包含旧域名），继续后续步骤
-- 3. 如果数据库存储的是相对路径（如 /laoxiangji/xxx.png），
--    则无需更新数据库，只需：
--    - 更新环境变量 CDN_BASE_URL
--    - 迁移图片文件
--    - 重启后端服务
-- 4. 执行"第2步：备份数据"（必须！）
-- 5. 确认图片已迁移后，执行"第3步：更新数据库中的URL"
-- 6. 执行"第4步：验证更新结果"
-- 7. 如果有问题，执行"第5步：回滚数据"

-- ===========================================
-- 注意事项
-- ===========================================

-- ⚠️ 更新前必须确认：
-- 1. 已经从旧存储下载所有图片
-- 2. 图片已上传到新COS存储桶
-- 3. 新COS存储桶已设置为"公有读私有写"
-- 4. 在浏览器中测试新URL可以访问
-- 5. 已经备份数据库数据

-- ⚠️ 更新后需要：
-- 1. 重启云托管后端服务
-- 2. 清除小程序缓存
-- 3. 测试小程序图片加载

