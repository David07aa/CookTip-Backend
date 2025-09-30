const { query, queryOne } = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

/**
 * 评论功能
 * GET /api/comments?recipeId=xxx - 获取评论列表
 * POST /api/comments - 发表评论
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - 获取评论列表
    if (req.method === 'GET') {
      const { recipeId, page = 1, limit = 20 } = req.query;

      if (!recipeId) {
        return res.status(400).json({
          success: false,
          error: '参数错误',
          message: '缺少recipeId参数'
        });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const comments = await query(
        `SELECT 
          c.*,
          u.nick_name as user_nick_name,
          u.avatar as user_avatar,
          u.is_vip as user_is_vip,
          reply_user.nick_name as reply_to_nick_name
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN comments reply_comment ON c.reply_to = reply_comment.id
        LEFT JOIN users reply_user ON reply_comment.user_id = reply_user.id
        WHERE c.recipe_id = ?
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?`,
        [recipeId, parseInt(limit), offset]
      );

      const formattedComments = comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        images: comment.images ? JSON.parse(comment.images) : [],
        likes: comment.likes,
        createdAt: comment.created_at,
        user: {
          id: comment.user_id,
          nickName: comment.user_nick_name,
          avatar: comment.user_avatar,
          isVip: comment.user_is_vip === 1
        },
        replyTo: comment.reply_to ? {
          commentId: comment.reply_to,
          nickName: comment.reply_to_nick_name
        } : null
      }));

      return res.status(200).json({
        success: true,
        data: {
          comments: formattedComments,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    }

    // POST - 发表评论（需要登录）
    if (req.method === 'POST') {
      const authError = await requireAuth(req, res);
      if (authError) return;

      const { recipeId, content, images = [], replyTo } = req.body;

      if (!recipeId || !content) {
        return res.status(400).json({
          success: false,
          error: '参数错误',
          message: '缺少必填字段'
        });
      }

      if (content.length < 1 || content.length > 500) {
        return res.status(400).json({
          success: false,
          error: '内容长度错误',
          message: '评论内容长度应在1-500字之间'
        });
      }

      // 检查食谱是否存在
      const recipe = await queryOne(
        'SELECT id FROM recipes WHERE id = ? AND status = "published"',
        [recipeId]
      );

      if (!recipe) {
        return res.status(404).json({
          success: false,
          error: '食谱不存在',
          message: '未找到该食谱'
        });
      }

      // 如果是回复评论，检查被回复的评论是否存在
      if (replyTo) {
        const replyComment = await queryOne(
          'SELECT id FROM comments WHERE id = ? AND recipe_id = ?',
          [replyTo, recipeId]
        );

        if (!replyComment) {
          return res.status(404).json({
            success: false,
            error: '评论不存在',
            message: '被回复的评论不存在'
          });
        }
      }

      // 创建评论
      const commentId = generateUUID();
      await query(
        `INSERT INTO comments (id, recipe_id, user_id, content, images, reply_to, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [commentId, recipeId, req.user.id, content, JSON.stringify(images), replyTo || null]
      );

      // 更新食谱评论数
      await query(
        'UPDATE recipes SET comments = comments + 1 WHERE id = ?',
        [recipeId]
      );

      // 获取创建的评论详情
      const comment = await queryOne(
        `SELECT 
          c.*,
          u.nick_name as user_nick_name,
          u.avatar as user_avatar,
          u.is_vip as user_is_vip
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ?`,
        [commentId]
      );

      return res.status(201).json({
        success: true,
        message: '评论成功',
        data: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.created_at,
          user: {
            nickName: comment.user_nick_name,
            avatar: comment.user_avatar,
            isVip: comment.user_is_vip === 1
          }
        }
      });
    }

  } catch (error) {
    console.error('评论操作错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误',
      message: error.message
    });
  }
};

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
