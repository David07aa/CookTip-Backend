const { sql } = require('../../lib/db');
const { optionalAuth, requireAuth } = require('../../middleware/auth');

/**
 * 食谱列表和创建接口
 * GET /api/recipes - 获取食谱列表（支持分页、筛选、排序）
 * POST /api/recipes - 创建食谱（需要登录）
 */
module.exports = async (req, res) => {
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
      database: 'Neon PostgreSQL',
      environment: {
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
        hasJWTSecret: !!process.env.JWT_SECRET,
        hasWeChatAppId: !!process.env.WECHAT_APPID,
        hasWeChatSecret: !!process.env.WECHAT_SECRET
      },
      connection: 'checking...'
    };

    try {
      const result = await sql`SELECT NOW() as current_time, version() as pg_version`;

      healthStatus.connection = 'connected';
      healthStatus.serverTime = result.rows[0].current_time;
      healthStatus.postgresVersion = result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1];
      healthStatus.success = true;

      return res.status(200).json(healthStatus);
    } catch (error) {
      healthStatus.connection = 'error';
      healthStatus.error = error.message;
      healthStatus.success = false;

      return res.status(500).json(healthStatus);
    }
  }

  try {
    // GET - 获取食谱列表
    if (req.method === 'GET') {
      // 可选认证（用于判断收藏、点赞状态）
      await optionalAuth(req, res);

      const {
        page = 1,
        limit = 10,
        category,
        difficulty,
        cookTime,
        sortBy = 'created_at',
        order = 'DESC',
        userId,
        keyword
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);

      // 构建查询条件
      const conditions = [`status = 'published'`];
      const params = [];
      let paramIndex = 1;

      if (category) {
        conditions.push(`category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }

      if (difficulty) {
        conditions.push(`difficulty = $${paramIndex}`);
        params.push(difficulty);
        paramIndex++;
      }

      if (cookTime) {
        conditions.push(`cook_time <= $${paramIndex}`);
        params.push(parseInt(cookTime));
        paramIndex++;
      }

      if (userId) {
        conditions.push(`author_id = $${paramIndex}::uuid`);
        params.push(userId);
        paramIndex++;
      }

      if (keyword) {
        conditions.push(`(title ILIKE $${paramIndex} OR introduction ILIKE $${paramIndex})`);
        params.push(`%${keyword}%`);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // 验证排序字段
      const validSortFields = ['created_at', 'views', 'likes', 'collects'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // 查询总数
      const countQuery = `SELECT COUNT(*)::int as total FROM recipes ${whereClause}`;
      const countResult = await sql.query(countQuery, params);
      const total = countResult.rows[0]?.total || 0;

      // 查询列表
      // 注意：sortField 已经过验证，安全地插入到 SQL 中
      const listQuery = `
        SELECT 
          r.id,
          r.title,
          r.cover_image as "coverImage",
          r.introduction,
          r.difficulty,
          r.cook_time as "cookTime",
          r.servings,
          r.category,
          r.views,
          r.likes,
          r.collects,
          r.created_at as "createdAt",
          u.id as "authorId",
          u.nick_name as "authorName",
          u.avatar as "authorAvatar"
        FROM recipes r
        LEFT JOIN users u ON r.author_id = u.id
        ${whereClause}
        ORDER BY r.${sortField} ${sortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const listResult = await sql.query(listQuery, [...params, limitNum, offset]);
      const recipes = listResult.rows || [];

      // 如果用户已登录，查询收藏和点赞状态
      if (req.user) {
        for (const recipe of recipes) {
          const favoriteResult = await sql`
            SELECT id FROM favorites 
            WHERE user_id = ${req.user.id}::uuid AND recipe_id = ${recipe.id}::uuid
          `;
          recipe.isFavorited = favoriteResult.rows.length > 0;

          const likeResult = await sql`
            SELECT id FROM likes 
            WHERE user_id = ${req.user.id}::uuid AND recipe_id = ${recipe.id}::uuid
          `;
          recipe.isLiked = likeResult.rows.length > 0;
        }
      } else {
        recipes.forEach(recipe => {
          recipe.isFavorited = false;
          recipe.isLiked = false;
        });
      }

      return res.status(200).json({
        code: 200,
        message: 'Success',
        data: {
          list: recipes,
          pagination: {
            page: parseInt(page),
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    }

    // POST - 创建食谱
    if (req.method === 'POST') {
      // 必须登录
      const authError = await requireAuth(req, res);
      if (authError) return;

      const {
        title,
        coverImage,
        introduction,
        difficulty,
        cookTime,
        servings,
        category,
        ingredients,
        steps,
        tips,
        tags,
        nutrition
      } = req.body;

      // 验证必填字段
      if (!title || !coverImage || !introduction || !difficulty || !cookTime || !category) {
        return res.status(400).json({
          code: 400,
          message: '缺少必填字段',
          data: null
        });
      }

      // 插入食谱
      const result = await sql`
        INSERT INTO recipes (
          author_id,
          title,
          cover_image,
          introduction,
          difficulty,
          cook_time,
          servings,
          category,
          ingredients,
          steps,
          tips,
          tags,
          nutrition,
          status
        ) VALUES (
          ${req.user.id}::uuid,
          ${title},
          ${coverImage},
          ${introduction},
          ${difficulty},
          ${cookTime},
          ${servings || 2},
          ${category},
          ${JSON.stringify(ingredients || [])}::jsonb,
          ${JSON.stringify(steps || [])}::jsonb,
          ${tips || ''},
          ${JSON.stringify(tags || [])}::jsonb,
          ${JSON.stringify(nutrition || {})}::jsonb,
          'published'
        )
        RETURNING id, title, created_at as "createdAt"
      `;

      const recipe = result.rows[0];

      // 更新用户食谱数
      await sql`
        UPDATE users 
        SET recipe_count = recipe_count + 1
        WHERE id = ${req.user.id}::uuid
      `;

      return res.status(201).json({
        code: 201,
        message: '食谱创建成功',
        data: recipe
      });
    }

    return res.status(405).json({
      code: 405,
      message: '方法不允许',
      data: null
    });

  } catch (error) {
    console.error('========== 食谱接口错误 ==========');
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('请求方法:', req.method);
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