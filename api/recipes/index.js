const { query } = require('../../lib/db');

/**
 * 获取食谱列表
 * GET /api/recipes?page=1&limit=10&category=中餐&difficulty=简单&sort=-created_at
 */
module.exports = async (req, res) => {
  // 设置CORS
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

  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      taste,
      keyword,
      sort = '-created_at'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 构建查询条件
    let whereClauses = ['r.status = ?'];
    let params = ['published'];

    if (category) {
      whereClauses.push('r.category = ?');
      params.push(category);
    }

    if (difficulty) {
      whereClauses.push('r.difficulty = ?');
      params.push(difficulty);
    }

    if (taste) {
      whereClauses.push('r.taste = ?');
      params.push(taste);
    }

    if (keyword) {
      whereClauses.push('(r.title LIKE ? OR r.introduction LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereSQL = whereClauses.join(' AND ');

    // 排序字段
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
    const allowedSortFields = ['created_at', 'views', 'likes', 'collects', 'cook_time'];
    const sortColumn = allowedSortFields.includes(sortField) ? sortField : 'created_at';

    // 查询总数
    const countSQL = `
      SELECT COUNT(*) as total
      FROM recipes r
      WHERE ${whereSQL}
    `;
    const [countResult] = await query(countSQL, params);
    const total = countResult.total;

    // 查询食谱列表
    const sql = `
      SELECT 
        r.*,
        u.id as author_id,
        u.nick_name as author_nick_name,
        u.avatar as author_avatar,
        u.followers as author_followers
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE ${whereSQL}
      ORDER BY r.${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const recipes = await query(sql, [...params, parseInt(limit), offset]);

    // 格式化返回数据
    const formattedRecipes = recipes.map(recipe => ({
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
      views: recipe.views,
      likes: recipe.likes,
      collects: recipe.collects,
      comments: recipe.comments,
      shares: recipe.shares,
      isRecommended: recipe.is_recommended === 1,
      createdAt: recipe.created_at,
      author: {
        id: recipe.author_id,
        nickName: recipe.author_nick_name,
        avatar: recipe.author_avatar,
        followers: recipe.author_followers
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        recipes: formattedRecipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('获取食谱列表错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误',
      message: error.message
    });
  }
};
