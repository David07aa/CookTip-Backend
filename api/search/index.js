const { sql } = require('../../lib/db');

/**
 * 搜索食谱
 * GET /api/search?keyword=xxx&page=1&pageSize=10&category=中餐&difficulty=简单
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
    const {
      keyword,
      page = 1,
      pageSize = 10,
      category,
      difficulty
    } = req.query;

    if (!keyword) {
      return res.status(400).json({
        code: 400,
        message: '缺少搜索关键词',
        data: null
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limitNum = parseInt(pageSize);

    // 构建查询条件
    const whereClauses = [];
    const params = [];
    let paramIndex = 1;

    // 添加发布状态条件
    whereClauses.push(`r.status = 'published'`);

    // 添加关键词搜索条件
    whereClauses.push(`(r.title ILIKE $${paramIndex} OR r.introduction ILIKE $${paramIndex})`);
    params.push(`%${keyword}%`);
    paramIndex++;

    // 添加分类筛选
    if (category) {
      whereClauses.push(`r.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    // 添加难度筛选
    if (difficulty) {
      whereClauses.push(`r.difficulty = $${paramIndex}`);
      params.push(difficulty);
      paramIndex++;
    }

    const whereSQL = whereClauses.filter(c => c).join(' AND ');

    // 查询总数
    const countQuery = `SELECT COUNT(*)::int as total FROM recipes r WHERE ${whereSQL}`;
    const countResult = await sql.query(countQuery, params);
    const total = countResult.rows[0]?.total || 0;

    // 查询搜索结果
    const listQuery = `
      SELECT 
        r.id as "recipeId",
        r.title,
        r.introduction,
        r.cover_image as "coverImage",
        r.likes as "likeCount",
        r.collects as "collectCount",
        u.nick_name as "authorNickName"
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE ${whereSQL}
      ORDER BY r.views DESC, r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const listResult = await sql.query(listQuery, [...params, limitNum, offset]);

    // 格式化返回数据
    const formattedResults = listResult.rows.map(item => ({
      recipeId: item.recipeId,
      title: item.title,
      introduction: item.introduction,
      coverImage: item.coverImage,
      author: {
        nickName: item.authorNickName
      },
      likeCount: item.likeCount,
      collectCount: item.collectCount
    }));

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: {
        list: formattedResults,
        total,
        page: parseInt(page),
        pageSize: limitNum
      }
    });

  } catch (error) {
    console.error('========== 搜索接口错误 ==========');
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('请求查询:', req.query);
    console.error('=====================================');
    
    res.status(500).json({
      code: 500,
      message: process.env.NODE_ENV === 'production' ? '服务器错误' : error.message,
      data: process.env.NODE_ENV === 'production' ? null : {
        error: error.message,
        stack: error.stack
      }
    });
  }
};