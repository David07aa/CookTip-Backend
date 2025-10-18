-- =========================================
-- 用户表扩展回滚脚本
-- 版本: v2.0
-- 日期: 2025-10-17
-- 说明: 如果迁移后出现问题，使用此脚本回滚到原始状态
-- =========================================

-- 警告提示
SELECT '⚠️ 警告：即将回滚 users 表到迁移前状态' as warning;
SELECT '此操作将删除新增的字段，请确认是否继续执行' as confirmation;
SELECT '如需继续，请逐行执行以下语句' as instruction;

-- 回滚步骤1：删除新增的索引
-- =========================================
SELECT '开始删除新增索引...' as status;

DROP INDEX IF EXISTS `idx_username` ON `users`;
DROP INDEX IF EXISTS `idx_email` ON `users`;
DROP INDEX IF EXISTS `idx_phone` ON `users`;

SELECT '✅ 步骤1: 索引删除完成' as status;

-- 回滚步骤2：删除新增的字段
-- =========================================
SELECT '开始删除新增字段...' as status;

ALTER TABLE `users` DROP COLUMN IF EXISTS `username`;
ALTER TABLE `users` DROP COLUMN IF EXISTS `email`;
ALTER TABLE `users` DROP COLUMN IF EXISTS `phone`;
ALTER TABLE `users` DROP COLUMN IF EXISTS `password_hash`;
ALTER TABLE `users` DROP COLUMN IF EXISTS `is_verified`;

SELECT '✅ 步骤2: 字段删除完成' as status;

-- 回滚步骤3：验证回滚结果
-- =========================================
SELECT '📊 回滚后的 users 表结构:' as status;
DESCRIBE `users`;

-- 验证数据完整性
SELECT '📝 数据完整性验证:' as status;
SELECT 
  (SELECT COUNT(*) FROM `users`) as current_count,
  (SELECT COUNT(*) FROM `users_backup_20251017`) as backup_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM `users`) = (SELECT COUNT(*) FROM `users_backup_20251017`) 
    THEN '✅ 数据完整，回滚成功'
    ELSE '⚠️ 警告：数据数量不一致'
  END as integrity_check;

-- 完成提示
SELECT '🎉 回滚完成！' as status;
SELECT '
回滚结果：
1. ✅ 已删除 username、email、phone、password_hash、is_verified 字段
2. ✅ 已删除相关索引
3. ✅ users 表恢复到迁移前状态
4. 📝 备份数据仍保留在 users_backup_20251017 表中
5. ⚠️ 如需恢复备份数据，请手动操作
' as notes;

-- 可选：如果需要完全恢复备份数据，取消注释以下语句
-- DROP TABLE IF EXISTS `users`;
-- CREATE TABLE `users` AS SELECT * FROM `users_backup_20251017`;
-- SELECT '✅ 已从备份完全恢复 users 表' as result;

