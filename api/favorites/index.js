const { query, queryOne } = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

/**
 * 收藏功能
 * GET /api/favorites - 获取收藏列表
 * POST /api/favorites - 添加收藏
 * DELETE /api/favorites?recipeId=xxx - 取消收藏
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 验证认证
  const authError = await requireAuth(req, res);
  if (authError) return;

  try {
    // GET - 获取收藏列表
    if (req.method === 'GET') {
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const favorites = await query(
        `SELECT 
          f.id as favorite_id,
          f.created_at as favorited_at,
          r.*,
          u.nick_name as author_nick_name,
          u.avatar as author_avatar
        FROM favorites f
        LEFT JOIN recipes r ON f.recipe_id = r.id
        LEFT JOIN users u ON r.author_id = u.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?`,
        [req.user.id, parseInt(limit), offset]
      );

      const formattedFavorites = favorites.map(fav => ({
        favoriteId: fav.favorite_id,
        favoritedAt: fav.favorited_at,
        recipe: {
          id: fav.id,
          title: fav.title,
          coverImage: fav.cover_image,
          introduction: fav.introduction,
          cookTime: fav.cook_time,
          difficulty: fav.difficulty,
          category: fav.category,
          views: fav.views,
          likes: fav.likes,
          collects: fav.collects,
          author: {
            nickName: fav.author_nick_name,
            avatar: fav.author_avatar
          }
        }
      }));

      return res.status(200).json({
        success: true,
        data: {
          favorites: formattedFavorites,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    }

    // POST - 添加收藏
    if (req.method === 'POST') {
      const { recipeId } = req.body;

      if (!recipeId) {
        return res.status(400).json({
          success: false,
          error: '参数错误',
          message: '缺少recipeId参数'
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

      // 检查是否已收藏
      const existing = await queryOne(
        'SELECT id FROM favorites WHERE user_id = ? AND recipe_id = ?',
        [req.user.id, recipeId]
      );

      if (existing) {
        return res.status(400).json({
          success: false,
          error: '已收藏',
          message: '您已经收藏过这个食谱了'
        });
      }

      // 添加收藏
      const favoriteId = generateUUID();
      await query(
        'INSERT INTO favorites (id, user_id, recipe_id, created_at) VALUES (?, ?, ?, NOW())',
        [favoriteId, req.user.id, recipeId]
      );

      // 更新食谱收藏数
      await query(
        'UPDATE recipes SET collects = collects + 1 WHERE id = ?',
        [recipeId]
      );

      return res.status(201).json({
        success: true,
        message: '收藏成功',
        data: {
          favoriteId,
          recipeId
        }
      });
    }

    // DELETE - 取消收藏
    if (req.method === 'DELETE') {
      const { recipeId } = req.query;

      if (!recipeId) {
        return res.status(400).json({
          success: false,
          error: '参数错误',
          message: '缺少recipeId参数'
        });
      }

      // 删除收藏
      const result = await query(
        'DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?',
        [req.user.id, recipeId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: '未收藏',
          message: '您还没有收藏这个食谱'
        });
      }

      // 更新食谱收藏数
      await query(
        'UPDATE recipes SET collects = GREATEST(collects - 1, 0) WHERE id = ?',
        [recipeId]
      );

      return res.status(200).json({
        success: true,
        message: '取消收藏成功'
      });
    }

  } catch (error) {
    console.error('收藏操作错误:', error);
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
