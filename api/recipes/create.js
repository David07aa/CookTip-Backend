const { query, queryOne } = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

/**
 * 创建食谱
 * POST /api/recipes/create
 * 需要登录
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '方法不允许',
      message: '仅支持POST请求'
    });
  }

  // 验证认证
  const authError = await requireAuth(req, res);
  if (authError) return;

  try {
    const {
      title,
      coverImage,
      introduction,
      cookTime,
      difficulty,
      servings,
      taste,
      category,
      tags = [],
      ingredients,
      steps,
      tips,
      nutrition
    } = req.body;

    // 验证必填字段
    if (!title || !coverImage || !introduction || !cookTime || !difficulty || !servings || !category || !ingredients || !steps) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: '缺少必填字段'
      });
    }

    // 生成食谱ID
    const recipeId = generateUUID();

    // 插入食谱
    await query(
      `INSERT INTO recipes (
        id, title, cover_image, introduction, author_id, cook_time, 
        difficulty, servings, taste, category, tags, ingredients, 
        steps, tips, nutrition, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())`,
      [
        recipeId,
        title,
        coverImage,
        introduction,
        req.user.id,
        parseInt(cookTime),
        difficulty,
        parseInt(servings),
        taste || null,
        category,
        JSON.stringify(tags),
        JSON.stringify(ingredients),
        JSON.stringify(steps),
        tips || null,
        nutrition ? JSON.stringify(nutrition) : null
      ]
    );

    // 更新用户食谱数量
    await query(
      'UPDATE users SET recipe_count = recipe_count + 1, updated_at = NOW() WHERE id = ?',
      [req.user.id]
    );

    // 获取创建的食谱
    const recipe = await queryOne(
      'SELECT * FROM recipes WHERE id = ?',
      [recipeId]
    );

    res.status(201).json({
      success: true,
      message: '食谱创建成功',
      data: {
        id: recipe.id,
        title: recipe.title,
        coverImage: recipe.cover_image,
        createdAt: recipe.created_at
      }
    });

  } catch (error) {
    console.error('创建食谱错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误',
      message: error.message
    });
  }
};

// 生成UUID辅助函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
