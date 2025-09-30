const { sql } = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

/**
 * 点赞功能
 * POST /api/likes - 点赞食谱
 * DELETE /api/likes?recipeId=xxx - 取消点赞
 * GET /api/likes/check?recipeId=xxx - 检查是否已点赞
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
    // GET - 检查是否已点赞
    if (req.method === 'GET') {
      const { recipeId } = req.query;

      if (!recipeId) {
        return res.status(400).json({
          success: false,
          error: '参数错误',
          message: '缺少recipeId参数'
        });
      }

      const likeResult = await sql`
        SELECT id FROM likes WHERE user_id = ${req.user.id}::uuid AND recipe_id = ${recipeId}::uuid
      `;

      return res.status(200).json({
        success: true,
        data: {
          liked: likeResult.rows.length > 0
        }
      });
    }

    // POST - 点赞
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
        SELECT id, author_id FROM recipes WHERE id = ${recipeId}::uuid AND status = 'published'
      `;

      if (recipeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '食谱不存在',
          message: '未找到该食谱'
        });
      }

      const recipe = recipeResult.rows[0];

      // 检查是否已点赞
      const existingResult = await sql`
        SELECT id FROM likes WHERE user_id = ${req.user.id}::uuid AND recipe_id = ${recipeId}::uuid
      `;

      if (existingResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: '已点赞',
          message: '您已经点赞过这个食谱了'
        });
      }

      // 添加点赞
      const insertResult = await sql`
        INSERT INTO likes (user_id, recipe_id) 
        VALUES (${req.user.id}::uuid, ${recipeId}::uuid)
        RETURNING id
      `;

      const likeId = insertResult.rows[0].id;

      // 更新食谱点赞数
      await sql`
        UPDATE recipes SET likes = likes + 1 WHERE id = ${recipeId}::uuid
      `;

      // 更新作者总获赞数
      if (recipe.author_id) {
        await sql`
          UPDATE users SET total_likes = total_likes + 1 WHERE id = ${recipe.author_id}::uuid
        `;
      }

      return res.status(201).json({
        success: true,
        message: '点赞成功',
        data: {
          likeId,
          recipeId
        }
      });
    }

    // DELETE - 取消点赞
    if (req.method === 'DELETE') {
      const { recipeId } = req.query;

      if (!recipeId) {
        return res.status(400).json({
          success: false,
          error: '参数错误',
          message: '缺少recipeId参数'
        });
      }

      // 获取食谱作者信息
      const recipeResult = await sql`
        SELECT author_id FROM recipes WHERE id = ${recipeId}::uuid
      `;

      // 删除点赞
      const deleteResult = await sql`
        DELETE FROM likes 
        WHERE user_id = ${req.user.id}::uuid AND recipe_id = ${recipeId}::uuid
        RETURNING id
      `;

      if (deleteResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '未点赞',
          message: '您还没有点赞这个食谱'
        });
      }

      // 更新食谱点赞数
      await sql`
        UPDATE recipes SET likes = GREATEST(likes - 1, 0) WHERE id = ${recipeId}::uuid
      `;

      // 更新作者总获赞数
      if (recipeResult.rows.length > 0 && recipeResult.rows[0].author_id) {
        await sql`
          UPDATE users SET total_likes = GREATEST(total_likes - 1, 0) WHERE id = ${recipeResult.rows[0].author_id}::uuid
        `;
      }

      return res.status(200).json({
        success: true,
        message: '取消点赞成功'
      });
    }

  } catch (error) {
    console.error('点赞操作错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误',
      message: error.message
    });
  }
};