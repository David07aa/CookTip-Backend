const { query, queryOne } = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

/**
 * 删除评论
 * DELETE /api/comments/[id]
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({
      code: 405,
      message: '仅支持DELETE请求',
      data: null
    });
  }

  // 验证认证
  const authError = await requireAuth(req, res);
  if (authError) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      code: 400,
      message: '缺少评论ID',
      data: null
    });
  }

  try {
    // 检查评论是否存在且属于当前用户
    const comment = await queryOne(
      'SELECT id, user_id, recipe_id FROM comments WHERE id = ?',
      [id]
    );

    if (!comment) {
      return res.status(404).json({
        code: 404,
        message: '评论不存在',
        data: null
      });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权删除此评论',
        data: null
      });
    }

    // 删除评论
    await query('DELETE FROM comments WHERE id = ?', [id]);

    // 更新食谱评论数
    await query(
      'UPDATE recipes SET comments = GREATEST(comments - 1, 0) WHERE id = ?',
      [comment.recipe_id]
    );

    res.status(200).json({
      code: 200,
      message: '删除成功',
      data: null
    });

  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};
