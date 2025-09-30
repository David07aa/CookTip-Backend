const { query, queryOne } = require('../../lib/db');

/**
 * 获取用户信息
 * GET /api/users/[id]
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
      message: '缺少用户ID'
    });
  }

  try {
    // 获取用户信息
    const user = await queryOne(
      'SELECT id, nick_name, avatar, bio, is_vip, followers, following, total_likes, recipe_count, created_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
        message: '未找到该用户'
      });
    }

    // 获取用户的食谱列表（最新的6个）
    const recipes = await query(
      `SELECT id, title, cover_image, views, likes, collects, created_at 
       FROM recipes 
       WHERE author_id = ? AND status = 'published' 
       ORDER BY created_at DESC 
       LIMIT 6`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          nickName: user.nick_name,
          avatar: user.avatar,
          bio: user.bio,
          isVip: user.is_vip === 1,
          followers: user.followers,
          following: user.following,
          totalLikes: user.total_likes,
          recipeCount: user.recipe_count,
          createdAt: user.created_at
        },
        recentRecipes: recipes.map(r => ({
          id: r.id,
          title: r.title,
          coverImage: r.cover_image,
          views: r.views,
          likes: r.likes,
          collects: r.collects,
          createdAt: r.created_at
        }))
      }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误',
      message: error.message
    });
  }
};
