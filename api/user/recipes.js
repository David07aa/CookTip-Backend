const { sql } = require('../../lib/db');
const { optionalAuth } = require('../../middleware/auth');

/**
 * 获取用户发布的食谱
 * GET /api/user/recipes?userId=xxx&page=1&pageSize=10&status=published
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
      code: 405,
      message: '仅支持GET请求',
      data: null
    });
  }

  try {
    // 可选认证（如果有token则获取用户信息）
    await optionalAuth(req);

    const {
      userId,
      page = 1,
      pageSize = 10,
      status = 'all' // draft, published, all
    } = req.query;

    // 如果没有指定userId，使用当前登录用户
    const targetUserId = userId || (req.user ? req.user.id : null);

    if (!targetUserId) {
      return res.status(400).json({
        code: 400,
        message: '缺少userId参数',
        data: null
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 构建查询条件
    const whereClauses = [`author_id = $1::uuid`];
    const params = [targetUserId];
    let paramIndex = 2;

    // 如果不是查看自己的食谱，只能看已发布的
    if (!req.user || req.user.id !== targetUserId) {
      whereClauses.push(`status = $${paramIndex}`);
      params.push('published');
      paramIndex++;
    } else if (status !== 'all') {
      whereClauses.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereSQL = whereClauses.join(' AND ');

    // 查询总数
    const countQuery = `SELECT COUNT(*)::int as total FROM recipes WHERE ${whereSQL}`;
    const countResult = await sql.query(countQuery, params);
    const total = countResult.rows[0].total;

    // 查询食谱列表
    const listQuery = `
      SELECT 
        id as "recipeId",
        title,
        cover_image as "coverImage",
        views as "viewCount",
        likes as "likeCount",
        collects as "collectCount",
        status,
        created_at as "createdAt"
      FROM recipes
      WHERE ${whereSQL}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const listResult = await sql.query(listQuery, [...params, limit, offset]);
    const recipes = listResult.rows;

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: {
        list: recipes,
        total,
        page: parseInt(page),
        pageSize: limit
      }
    });

  } catch (error) {
    console.error('获取用户食谱错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};