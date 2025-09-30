const { query, queryOne } = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

/**
 * 更新和删除食谱
 * PUT /api/recipes/[id] - 更新食谱
 * DELETE /api/recipes/[id] - 删除食谱
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 验证认证
  const authError = await requireAuth(req, res);
  if (authError) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      code: 400,
      message: '缺少食谱ID',
      data: null
    });
  }

  try {
    // 检查食谱是否存在且属于当前用户
    const recipe = await queryOne(
      'SELECT id, author_id FROM recipes WHERE id = ?',
      [id]
    );

    if (!recipe) {
      return res.status(404).json({
        code: 404,
        message: '食谱不存在',
        data: null
      });
    }

    if (recipe.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权操作此食谱',
        data: null
      });
    }

    // PUT - 更新食谱
    if (req.method === 'PUT') {
      const {
        title,
        description,
        coverImage,
        category,
        difficulty,
        cookTime,
        servings,
        taste,
        tags,
        ingredients,
        steps,
        status
      } = req.body;

      const updates = [];
      const params = [];

      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }

      if (description !== undefined) {
        updates.push('introduction = ?');
        params.push(description);
      }

      if (coverImage !== undefined) {
        updates.push('cover_image = ?');
        params.push(coverImage);
      }

      if (category !== undefined) {
        updates.push('category = ?');
        params.push(category);
      }

      if (difficulty !== undefined) {
        updates.push('difficulty = ?');
        params.push(difficulty);
      }

      if (cookTime !== undefined) {
        updates.push('cook_time = ?');
        params.push(parseInt(cookTime));
      }

      if (servings !== undefined) {
        updates.push('servings = ?');
        params.push(parseInt(servings));
      }

      if (taste !== undefined) {
        updates.push('taste = ?');
        params.push(taste);
      }

      if (tags !== undefined) {
        updates.push('tags = ?');
        params.push(JSON.stringify(tags));
      }

      if (ingredients !== undefined) {
        updates.push('ingredients = ?');
        params.push(JSON.stringify(ingredients));
      }

      if (steps !== undefined) {
        updates.push('steps = ?');
        params.push(JSON.stringify(steps));
      }

      if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '没有需要更新的字段',
          data: null
        });
      }

      updates.push('updated_at = NOW()');
      params.push(id);

      await query(
        `UPDATE recipes SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: null
      });
    }

    // DELETE - 删除食谱
    if (req.method === 'DELETE') {
      await query('DELETE FROM recipes WHERE id = ?', [id]);

      // 更新用户食谱数量
      await query(
        'UPDATE users SET recipe_count = GREATEST(recipe_count - 1, 0) WHERE id = ?',
        [req.user.id]
      );

      return res.status(200).json({
        code: 200,
        message: '删除成功',
        data: null
      });
    }

    return res.status(405).json({
      code: 405,
      message: '方法不允许',
      data: null
    });

  } catch (error) {
    console.error('食谱操作错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};
