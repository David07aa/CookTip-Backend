-- =========================================
-- 创建用户凭证表（支持多账号绑定）
-- 版本: v1.0
-- 日期: 2025-10-17
-- 说明: 支持一个用户绑定多个登录账号
-- =========================================

-- 创建 user_credentials 表
-- =========================================
CREATE TABLE IF NOT EXISTS `user_credentials` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '凭证ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `type` VARCHAR(20) NOT NULL COMMENT '认证类型：username/email/phone/wechat',
  `account` VARCHAR(100) NOT NULL COMMENT '账号标识',
  `is_main` BOOLEAN DEFAULT false COMMENT '是否为主账号',
  `is_verified` BOOLEAN DEFAULT false COMMENT '是否已验证',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 唯一约束：同一类型的账号不能重复
  UNIQUE KEY `unique_type_account` (`type`, `account`),
  
  -- 外键约束
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  -- 索引
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_account` (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户凭证表';

-- 迁移现有用户数据到 user_credentials 表
-- =========================================

-- 1. 迁移微信 openid
INSERT INTO `user_credentials` (`user_id`, `type`, `account`, `is_main`, `is_verified`)
SELECT `id`, 'wechat', `openid`, true, true
FROM `users`
WHERE `openid` IS NOT NULL;

SELECT '✅ 步骤1: 已迁移微信 openid 到 user_credentials' as status;

-- 2. 迁移用户名（如果有）
INSERT INTO `user_credentials` (`user_id`, `type`, `account`, `is_main`, `is_verified`)
SELECT `id`, 'username', `username`, false, `is_verified`
FROM `users`
WHERE `username` IS NOT NULL;

SELECT '✅ 步骤2: 已迁移用户名到 user_credentials' as status;

-- 3. 迁移邮箱（如果有）
INSERT INTO `user_credentials` (`user_id`, `type`, `account`, `is_main`, `is_verified`)
SELECT `id`, 'email', `email`, false, `is_verified`
FROM `users`
WHERE `email` IS NOT NULL;

SELECT '✅ 步骤3: 已迁移邮箱到 user_credentials' as status;

-- 4. 迁移手机号（如果有）
INSERT INTO `user_credentials` (`user_id`, `type`, `account`, `is_main`, `is_verified`)
SELECT `id`, 'phone', `phone`, false, `is_verified`
FROM `users`
WHERE `phone` IS NOT NULL;

SELECT '✅ 步骤4: 已迁移手机号到 user_credentials' as status;

-- 验证迁移结果
-- =========================================
SELECT '📊 迁移结果统计:' as status;

SELECT 
  `type` as '认证类型',
  COUNT(*) as '数量',
  SUM(CASE WHEN `is_main` THEN 1 ELSE 0 END) as '主账号数',
  SUM(CASE WHEN `is_verified` THEN 1 ELSE 0 END) as '已验证数'
FROM `user_credentials`
GROUP BY `type`;

-- 显示表结构
SELECT '📋 user_credentials 表结构:' as status;
DESCRIBE `user_credentials`;

-- 完成提示
SELECT '🎉 user_credentials 表创建完成！' as status;
SELECT '
功能说明：
1. ✅ 支持多种认证方式：username, email, phone, wechat
2. ✅ 支持一个用户绑定多个账号
3. ✅ 支持主账号标识
4. ✅ 支持账号验证状态
5. ✅ 已自动迁移现有用户数据
' as notes;

