-- ============================================
-- 批量更新图片URL到对象存储
-- 执行方式：直接在 SQLPub 控制台执行
-- ============================================

-- 1. 先查看当前需要更新的记录数量
SELECT COUNT(*) as '需要更新的记录数' 
FROM recipes 
WHERE cover_image LIKE 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/%';

-- 2. 查看示例（执行前）
SELECT id, title, cover_image 
FROM recipes 
WHERE cover_image LIKE 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/%'
LIMIT 5;

-- 3. 执行批量更新（核心SQL）
UPDATE recipes 
SET cover_image = REPLACE(
  cover_image,
  'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/',
  'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com/laoxiangji/'
)
WHERE cover_image LIKE 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/%';

-- 4. 验证更新结果
SELECT COUNT(*) as '对象存储图片数量' 
FROM recipes 
WHERE cover_image LIKE 'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com%';

-- 5. 查看更新后的示例
SELECT id, title, cover_image 
FROM recipes 
WHERE cover_image LIKE 'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com%'
LIMIT 5;

-- ============================================
-- 说明：
-- - 将云托管后端URL替换为对象存储URL
-- - 影响约179条记录
-- - 执行时间：约1-2秒
-- ============================================

