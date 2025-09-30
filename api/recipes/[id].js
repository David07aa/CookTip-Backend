const { sql } = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

/**
 * 食谱详情、更新、删除
 * GET /api/recipes/[id] - 获取详情
 * PUT /api/recipes/[id] - 更新食谱（需要登录）
 * DELETE /api/recipes/[id] - 删除食谱（需要登录）
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: '参数错误',
      message: '缺少食谱ID'
    });
  }

  // PUT - 更新食谱
  if (req.method === 'PUT') {
    const authError = await requireAuth(req, res);
    if (authError) return;

    try {
      const recipeResult = await sql`
        SELECT id, author_id FROM recipes WHERE id = ${id}::uuid
      `;

      if (recipeResult.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '食谱不存在',
          data: null
        });
      }

      const recipe = recipeResult.rows[0];

      if (recipe.author_id !== req.user.id) {
        return res.status(403).json({
          code: 403,
          message: '无权操作此食谱',
          data: null
        });
      }

      const {
        title, description, coverImage, category, difficulty,
        cookTime, servings, taste, tags, ingredients, steps, status
      } = req.body;

      // 构建更新 SQL
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      if (title !== undefined) {
        setClauses.push(`title = $${paramIndex}`);
        values.push(title);
        paramIndex++;
      }
      if (description !== undefined) {
        setClauses.push(`description = $${paramIndex}`);
        values.push(description);
        paramIndex++;
      }
      if (coverImage !== undefined) {
        setClauses.push(`cover_image = $${paramIndex}`);
        values.push(coverImage);
        paramIndex++;
      }
      if (category !== undefined) {
        setClauses.push(`category = $${paramIndex}`);
        values.push(category);
        paramIndex++;
      }
      if (difficulty !== undefined) {
        setClauses.push(`difficulty = $${paramIndex}`);
        values.push(difficulty);
        paramIndex++;
      }
      if (cookTime !== undefined) {
        setClauses.push(`cook_time = $${paramIndex}`);
        values.push(parseInt(cookTime));
        paramIndex++;
      }
      if (servings !== undefined) {
        setClauses.push(`servings = $${paramIndex}`);
        values.push(parseInt(servings));
        paramIndex++;
      }
      if (taste !== undefined) {
        setClauses.push(`taste = $${paramIndex}`);
        values.push(taste);
        paramIndex++;
      }
      if (tags !== undefined) {
        setClauses.push(`tags = $${paramIndex}::jsonb`);
        values.push(JSON.stringify(tags));
        paramIndex++;
      }
      if (ingredients !== undefined) {
        setClauses.push(`ingredients = $${paramIndex}::jsonb`);
        values.push(JSON.stringify(ingredients));
        paramIndex++;
      }
      if (steps !== undefined) {
        setClauses.push(`steps = $${paramIndex}::jsonb`);
        values.push(JSON.stringify(steps));
        paramIndex++;
      }
      if (status !== undefined) {
        setClauses.push(`status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }

      if (setClauses.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '没有需要更新的字段',
          data: null
        });
      }

      setClauses.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await sql.query(
        `UPDATE recipes SET ${setClauses.join(', ')} WHERE id = $${paramIndex}::uuid`,
        values
      );

      return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: null
      });

    } catch (error) {
      console.error('更新食谱错误:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器错误',
        data: null
      });
    }
  }

  // DELETE - 删除食谱
  if (req.method === 'DELETE') {
    const authError = await requireAuth(req, res);
    if (authError) return;

    try {
      const recipeResult = await sql`
        SELECT id, author_id FROM recipes WHERE id = ${id}::uuid
      `;

      if (recipeResult.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '食谱不存在',
          data: null
        });
      }

      const recipe = recipeResult.rows[0];

      if (recipe.author_id !== req.user.id) {
        return res.status(403).json({
          code: 403,
          message: '无权操作此食谱',
          data: null
        });
      }

      await sql`DELETE FROM recipes WHERE id = ${id}::uuid`;
      await sql`
        UPDATE users 
        SET recipe_count = GREATEST(recipe_count - 1, 0) 
        WHERE id = ${req.user.id}::uuid
      `;

      return res.status(200).json({
        code: 200,
        message: '删除成功',
        data: null
      });

    } catch (error) {
      console.error('删除食谱错误:', error);
      return res.status(500).json({
        code: 500,
        message: '服务器错误',
        data: null
      });
    }
  }

  // GET - 获取食谱详情
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '方法不允许'
    });
  }

  try {
    // 获取食谱详情
    const recipeResult = await sql`
      SELECT 
        r.*,
        u.id as author_id,
        u.nick_name as author_nick_name,
        u.avatar as author_avatar,
        u.bio as author_bio,
        u.followers as author_followers,
        u.is_vip as author_is_vip
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE r.id = ${id}::uuid AND r.status = 'published'
    `;

    if (recipeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '食谱不存在',
        message: '未找到该食谱或已被删除'
      });
    }

    const recipe = recipeResult.rows[0];

    // 增加浏览量（异步，不等待结果）
    sql`UPDATE recipes SET views = views + 1 WHERE id = ${id}::uuid`
      .catch(err => console.error('更新浏览量失败:', err));

    // 格式化返回数据
    const formattedRecipe = {
      id: recipe.id,
      title: recipe.title,
      coverImage: recipe.cover_image,
      introduction: recipe.description,
      cookTime: recipe.cook_time,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      taste: recipe.taste,
      category: recipe.category,
      tags: recipe.tags || [],
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      tips: recipe.tips,
      nutrition: recipe.nutrition_info || null,
      views: recipe.views + 1, // 返回增加后的浏览量
      likes: recipe.likes,
      collects: recipe.favorites,
      comments: recipe.comments,
      shares: recipe.shares,
      isRecommended: recipe.is_recommended,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
      author: {
        id: recipe.author_id,
        nickName: recipe.author_nick_name,
        avatar: recipe.author_avatar,
        bio: recipe.author_bio,
        followers: recipe.author_followers,
        isVip: recipe.author_is_vip
      }
    };

    res.status(200).json({
      success: true,
      data: formattedRecipe
    });

  } catch (error) {
    console.error('获取食谱详情错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误',
      message: error.message
    });
  }
};