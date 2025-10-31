-- 更新"老乡鸡官方"用户的头像为存储桶 LOGO
-- 执行时间: 2025-10-30
-- LOGO URL: https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/LXJLOGO/LxjLogo.png

-- 1. 查看当前"老乡鸡官方"用户信息
SELECT id, nickname, avatar 
FROM users 
WHERE nickname = '老乡鸡官方';

-- 2. 更新头像为存储桶 LOGO
UPDATE users 
SET avatar = 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/LXJLOGO/LxjLogo.png'
WHERE nickname = '老乡鸡官方';

-- 3. 验证更新结果
SELECT id, nickname, avatar 
FROM users 
WHERE nickname = '老乡鸡官方';

-- 预期结果:
-- +----+------------------+-------------------------------------------------------------------------+
-- | id | nickname         | avatar                                                                  |
-- +----+------------------+-------------------------------------------------------------------------+
-- |  1 | 老乡鸡官方       | https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/LXJLOGO/LxjLogo.png |
-- +----+------------------+-------------------------------------------------------------------------+

