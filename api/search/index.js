const { query } = require('../../lib/db');

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

    // 构建查询条件
    let whereClauses = [
      'r.status = ?',
      '(r.title LIKE ? OR r.introduction LIKE ?)'
    ];
    let params = ['published', `%${keyword}%`, `%${keyword}%`];

    if (category) {
      whereClauses.push('r.category = ?');
      params.push(category);
    }

    if (difficulty) {
      whereClauses.push('r.difficulty = ?');
      params.push(difficulty);
    }

    const whereSQL = whereClauses.join(' AND ');

    // 查询总数
    const countSQL = `SELECT COUNT(*) as total FROM recipes r WHERE ${whereSQL}`;
    const [countResult] = await query(countSQL, params);
    const total = countResult.total;

    // 查询搜索结果
    const sql = `
      SELECT 
        r.id as recipeId,
        r.title,
        r.introduction as description,
        r.cover_image as coverImage,
        r.likes as likeCount,
        r.collects as collectCount,
        u.nick_name as authorNickName
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE ${whereSQL}
      ORDER BY r.views DESC, r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const results = await query(sql, [...params, parseInt(pageSize), offset]);

    // 格式化返回数据
    const formattedResults = results.map(item => ({
      recipeId: item.recipeId,
      title: item.title,
      description: item.description,
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
        pageSize: parseInt(pageSize)
      }
    });

  } catch (error) {
    console.error('搜索食谱错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
};
