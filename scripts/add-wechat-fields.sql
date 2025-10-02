-- 添加微信登录相关字段到 users 表
-- session_key: 用于解密微信用户数据
-- union_id: 如果小程序绑定了微信开放平台，可以获取 unionId

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS session_key VARCHAR(100),
ADD COLUMN IF NOT EXISTS union_id VARCHAR(100);

-- 为 union_id 添加索引（如果存在的话）
CREATE INDEX IF NOT EXISTS idx_users_union_id ON users(union_id);

-- 更新现有数据（如果 openid 为空的用户，设置为随机值避免冲突）
-- 这是为了兼容可能已存在的测试数据

