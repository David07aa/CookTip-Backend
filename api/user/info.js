const { query, queryOne } = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

/**
 * 用户信息接口
 * GET /api/user/info - 获取当前用户信息
 * PUT /api/user/info - 更新用户信息
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 验证认证
  const authError = await requireAuth(req, res);
  if (authError) return;

  try {
    // GET - 获取当前用户信息
    if (req.method === 'GET') {
      const user = await queryOne(
        `SELECT 
          id as userId,
          nick_name as nickName,
          avatar as avatarUrl,
          bio,
          is_vip as isVip,
          recipe_count as recipeCount,
          following as followCount,
          followers as fansCount,
          total_likes as likeCount,
          created_at as createdAt
        FROM users 
        WHERE id = ?`,
        [req.user.id]
      );

      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      // 获取收藏数
      const collectResult = await queryOne(
        'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
        [req.user.id]
      );

      return res.status(200).json({
        code: 200,
        message: 'Success',
        data: {
          ...user,
          isVip: user.isVip === 1,
          collectCount: collectResult.count
        }
      });
    }

    // PUT - 更新用户信息
    if (req.method === 'PUT') {
      const { nickName, avatarUrl, bio } = req.body;

      const updates = [];
      const params = [];

      if (nickName !== undefined) {
        updates.push('nick_name = ?');
        params.push(nickName);
      }

      if (avatarUrl !== undefined) {
        updates.push('avatar = ?');
        params.push(avatarUrl);
      }

      if (bio !== undefined) {
        updates.push('bio = ?');
        params.push(bio);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '没有需要更新的字段',
          data: null
        });
      }

      updates.push('updated_at = NOW()');
      params.push(req.user.id);

      await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: null
      });
    }

    return res.status(405).json({
      code: 405,
      message: '方法不允许',
      data: null
    });

  } catch (error) {
    console.error('用户信息操作错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};
