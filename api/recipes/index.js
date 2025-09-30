const { query, queryOne, pool } = require('../../lib/db');
const { requireAuth } = require('../../middleware/auth');

/**
 * 食谱列表和创建
 * GET /api/recipes - 获取列表
 * GET /api/recipes?health=check - 健康检查
 * POST /api/recipes - 创建食谱（需要登录）
 */
module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 健康检查
  if (req.method === 'GET' && req.query.health === 'check') {
    const healthStatus = {
      api: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        hasDBHost: !!process.env.DB_HOST,
        hasDBPort: !!process.env.DB_PORT,
        hasDBName: !!process.env.DB_NAME,
        hasDBUser: !!process.env.DB_USER,
        hasDBPassword: !!process.env.DB_PASSWORD,
        dbHost: process.env.DB_HOST || 'NOT_SET',
        dbPort: process.env.DB_PORT || 'NOT_SET'
      },
      database: 'checking...'
    };

    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      
      healthStatus.database = 'connected';
      healthStatus.success = true;
      
      return res.status(200).json(healthStatus);
    } catch (error) {
      healthStatus.database = 'error';
      healthStatus.databaseError = error.message;
      healthStatus.success = false;
      
      return res.status(500).json(healthStatus);
    }
  }

  // POST - 创建食谱
  if (req.method === 'POST') {
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

      if (!title || !coverImage || !introduction || !cookTime || !difficulty || !servings || !category || !ingredients || !steps) {
        return res.status(400).json({
          success: false,
          error: '参数错误',
          message: '缺少必填字段'
        });
      }

      const recipeId = generateUUID();

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

      await query(
        'UPDATE users SET recipe_count = recipe_count + 1, updated_at = NOW() WHERE id = ?',
        [req.user.id]
      );

      const recipe = await queryOne(
        'SELECT * FROM recipes WHERE id = ?',
        [recipeId]
      );

      return res.status(201).json({
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
      return res.status(500).json({
        success: false,
        error: '服务器错误',
        message: error.message
      });
    }
  }

  // GET - 获取食谱列表
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '方法不允许',
      message: '仅支持GET和POST请求'
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

// 生成UUID辅助函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
