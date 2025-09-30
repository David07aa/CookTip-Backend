const { sql } = require('../../lib/db');
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
      const limitNum = parseInt(limit);

      const favoritesResult = await sql`
        SELECT 
          f.id as favorite_id,
          f.created_at as favorited_at,
          r.*,
          u.nick_name as author_nick_name,
          u.avatar as author_avatar
        FROM favorites f
        LEFT JOIN recipes r ON f.recipe_id = r.id
        LEFT JOIN users u ON r.author_id = u.id
        WHERE f.user_id = ${req.user.id}::uuid
        ORDER BY f.created_at DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;

      const formattedFavorites = favoritesResult.rows.map(fav => ({
        favoriteId: fav.favorite_id,
        favoritedAt: fav.favorited_at,
        recipe: {
          id: fav.id,
          title: fav.title,
          coverImage: fav.cover_image,
          introduction: fav.description,
          cookTime: fav.cook_time,
          difficulty: fav.difficulty,
          category: fav.category,
          views: fav.views,
          likes: fav.likes,
          collects: fav.favorites,
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
          limit: limitNum
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
      const recipeResult = await sql`
        SELECT id FROM recipes WHERE id = ${recipeId}::uuid AND status = 'published'
      `;

      if (recipeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '食谱不存在',
          message: '未找到该食谱'
        });
      }

      // 检查是否已收藏
      const existingResult = await sql`
        SELECT id FROM favorites WHERE user_id = ${req.user.id}::uuid AND recipe_id = ${recipeId}::uuid
      `;

      if (existingResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: '已收藏',
          message: '您已经收藏过这个食谱了'
        });
      }

      // 添加收藏
      const insertResult = await sql`
        INSERT INTO favorites (user_id, recipe_id) 
        VALUES (${req.user.id}::uuid, ${recipeId}::uuid)
        RETURNING id
      `;

      const favoriteId = insertResult.rows[0].id;

      // 更新食谱收藏数
      await sql`
        UPDATE recipes SET favorites = favorites + 1 WHERE id = ${recipeId}::uuid
      `;

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
      const deleteResult = await sql`
        DELETE FROM favorites 
        WHERE user_id = ${req.user.id}::uuid AND recipe_id = ${recipeId}::uuid
        RETURNING id
      `;

      if (deleteResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '未收藏',
          message: '您还没有收藏这个食谱'
        });
      }

      // 更新食谱收藏数
      await sql`
        UPDATE recipes SET favorites = GREATEST(favorites - 1, 0) WHERE id = ${recipeId}::uuid
      `;

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