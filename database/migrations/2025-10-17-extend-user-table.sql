-- =========================================
-- 用户表扩展迁移脚本
-- 版本: v2.0
-- 日期: 2025-10-17
-- 说明: 在保留微信登录功能的基础上，扩展用户表支持多种登录方式
-- =========================================

-- 第一步：备份现有数据
-- =========================================
DROP TABLE IF EXISTS `users_backup_20251017`;
CREATE TABLE `users_backup_20251017` AS SELECT * FROM `users`;

SELECT '✅ 步骤1: 数据备份完成' as status;
SELECT CONCAT('备份用户数量: ', COUNT(*)) as result FROM `users_backup_20251017`;

-- 第二步：添加新字段
-- =========================================

-- 添加用户名（可选，用于未来扩展）
ALTER TABLE `users` 
ADD COLUMN `username` VARCHAR(50) UNIQUE DEFAULT NULL COMMENT '用户名（可选）' AFTER `session_key`;

-- 添加邮箱（可选）
ALTER TABLE `users` 
ADD COLUMN `email` VARCHAR(100) UNIQUE DEFAULT NULL COMMENT '邮箱（可选）' AFTER `username`;

-- 添加手机号（可选）
ALTER TABLE `users` 
ADD COLUMN `phone` VARCHAR(20) UNIQUE DEFAULT NULL COMMENT '手机号（可选）' AFTER `email`;

-- 添加密码哈希（可选，用于未来支持密码登录）
ALTER TABLE `users` 
ADD COLUMN `password_hash` VARCHAR(255) DEFAULT NULL COMMENT '密码哈希（可选）' AFTER `phone`;

-- 添加验证状态
ALTER TABLE `users` 
ADD COLUMN `is_verified` BOOLEAN DEFAULT false COMMENT '是否已验证' AFTER `password_hash`;

SELECT '✅ 步骤2: 新字段添加完成' as status;

-- 第三步：添加索引优化查询
-- =========================================

-- 为新字段创建索引
CREATE INDEX `idx_username` ON `users`(`username`);
CREATE INDEX `idx_email` ON `users`(`email`);
CREATE INDEX `idx_phone` ON `users`(`phone`);

SELECT '✅ 步骤3: 索引创建完成' as status;

-- 第四步：验证迁移结果
-- =========================================

-- 查看新的表结构
SELECT '📊 新的 users 表结构:' as status;
DESCRIBE `users`;

-- 验证数据完整性
SELECT '📝 数据完整性验证:' as status;
SELECT 
  (SELECT COUNT(*) FROM `users`) as current_count,
  (SELECT COUNT(*) FROM `users_backup_20251017`) as backup_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM `users`) = (SELECT COUNT(*) FROM `users_backup_20251017`) 
    THEN '✅ 数据完整，无丢失'
    ELSE '⚠️ 警告：数据数量不一致'
  END as integrity_check;

-- 显示现有用户数据
SELECT '👥 现有用户数据:' as status;
SELECT 
  id, 
  openid, 
  nickname, 
  username,
  email,
  phone,
  is_verified,
  recipe_count,
  follower_count,
  following_count
FROM `users`;

-- 完成提示
SELECT '🎉 迁移完成！' as status;
SELECT '
注意事项：
1. ✅ 原有数据已备份到 users_backup_20251017 表
2. ✅ 微信登录功能保持不变（openid, session_key 字段保留）
3. ✅ 新增字段均为可选（允许 NULL），不影响现有业务
4. ✅ 为未来扩展预留了 username、email、phone、password_hash 字段
5. 📝 如需回滚，请运行回滚脚本：2025-10-17-rollback-user-table.sql
' as notes;

