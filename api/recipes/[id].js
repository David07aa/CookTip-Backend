const { query, queryOne } = require('../../lib/db');

/**
 * 获取食谱详情
 * GET /api/recipes/[id]
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '方法不允许',
      message: '仅支持GET请求'
    });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: '参数错误',
      message: '缺少食谱ID'
    });
  }

  try {
    // 获取食谱详情
    const recipe = await queryOne(
      `SELECT 
        r.*,
        u.id as author_id,
        u.nick_name as author_nick_name,
        u.avatar as author_avatar,
        u.bio as author_bio,
        u.followers as author_followers,
        u.is_vip as author_is_vip
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE r.id = ? AND r.status = 'published'`,
      [id]
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: '食谱不存在',
        message: '未找到该食谱或已被删除'
      });
    }

    // 增加浏览量（异步，不等待结果）
    query('UPDATE recipes SET views = views + 1 WHERE id = ?', [id])
      .catch(err => console.error('更新浏览量失败:', err));

    // 格式化返回数据
    const formattedRecipe = {
      id: recipe.id,
      title: recipe.title,
      coverImage: recipe.cover_image,
      introduction: recipe.introduction,
      cookTime: recipe.cook_time,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      taste: recipe.taste,
      category: recipe.category,
      tags: recipe.tags ? JSON.parse(recipe.tags) : [],
      ingredients: recipe.ingredients ? JSON.parse(recipe.ingredients) : [],
      steps: recipe.steps ? JSON.parse(recipe.steps) : [],
      tips: recipe.tips,
      nutrition: recipe.nutrition ? JSON.parse(recipe.nutrition) : null,
      views: recipe.views + 1, // 返回增加后的浏览量
      likes: recipe.likes,
      collects: recipe.collects,
      comments: recipe.comments,
      shares: recipe.shares,
      isRecommended: recipe.is_recommended === 1,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
      author: {
        id: recipe.author_id,
        nickName: recipe.author_nick_name,
        avatar: recipe.author_avatar,
        bio: recipe.author_bio,
        followers: recipe.author_followers,
        isVip: recipe.author_is_vip === 1
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
