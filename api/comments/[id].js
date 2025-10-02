const { sql } = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

/**
 * 评论操作（单个评论）
 * DELETE /api/comments/[id] - 删除评论
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

  // 验证 id 参数
  if (!id || id === 'undefined' || id === 'null') {
    return res.status(400).json({
      code: 400,
      message: '缺少评论ID',
      data: null
    });
  }

  // 验证 UUID 格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      code: 400,
      message: '评论ID格式不正确',
      data: null
    });
  }

  try {
    // 检查评论是否存在且属于当前用户
    const commentResult = await sql`
      SELECT id, user_id, recipe_id FROM comments WHERE id = ${id}::uuid
    `;

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '评论不存在',
        data: null
      });
    }

    const comment = commentResult.rows[0];

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权删除此评论',
        data: null
      });
    }

    // 删除评论
    await sql`DELETE FROM comments WHERE id = ${id}::uuid`;

    // 更新食谱评论数
    await sql`
      UPDATE recipes SET comments = GREATEST(comments - 1, 0) WHERE id = ${comment.recipe_id}::uuid
    `;

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