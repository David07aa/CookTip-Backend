-- 添加 session_key 字段到 users 表
-- 用于存储微信 session_key，可用于解密敏感数据

USE cooktip;

-- 检查字段是否已存在
SELECT COUNT(*) INTO @column_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'cooktip'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'session_key';

-- 如果字段不存在，则添加
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE users ADD COLUMN session_key VARCHAR(200) NULL COMMENT "微信session_key" AFTER avatar',
  'SELECT "session_key字段已存在" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 查看修改后的表结构
DESC users;

SELECT '✅ session_key 字段添加完成！' AS status;

