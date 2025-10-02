const { sql } = require('../lib/db');

/**
 * 数据库诊断接口
 * GET /api/test-db
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
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

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      nodeEnv: process.env.NODE_ENV
    },
    tests: []
  };

  try {
    // 测试 1: 数据库连接
    try {
      const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
      diagnostics.tests.push({
        name: '数据库连接',
        status: 'success',
        result: {
          time: result.rows[0].current_time,
          version: result.rows[0].pg_version
        }
      });
    } catch (error) {
      diagnostics.tests.push({
        name: '数据库连接',
        status: 'error',
        error: error.message
      });
      return res.status(500).json({
        code: 500,
        message: '数据库连接失败',
        data: diagnostics
      });
    }

    // 测试 2: 查询recipes表结构
    try {
      const result = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'recipes'
        ORDER BY ordinal_position
      `;
      diagnostics.tests.push({
        name: 'recipes表结构',
        status: 'success',
        result: result.rows
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'recipes表结构',
        status: 'error',
        error: error.message
      });
    }

    // 测试 3: 查询recipes总数
    try {
      const result = await sql`
        SELECT COUNT(*)::int as total FROM recipes
      `;
      diagnostics.tests.push({
        name: 'recipes总数',
        status: 'success',
        result: result.rows[0]
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'recipes总数',
        status: 'error',
        error: error.message
      });
    }

    // 测试 4: 查询published状态的recipes
    try {
      const result = await sql`
        SELECT COUNT(*)::int as total FROM recipes WHERE status = 'published'
      `;
      diagnostics.tests.push({
        name: 'published状态的recipes',
        status: 'success',
        result: result.rows[0]
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'published状态的recipes',
        status: 'error',
        error: error.message
      });
    }

    // 测试 5: 查询前3个recipes
    try {
      const result = await sql`
        SELECT id, title, category, status 
        FROM recipes 
        LIMIT 3
      `;
      diagnostics.tests.push({
        name: '前3个recipes',
        status: 'success',
        result: result.rows
      });
    } catch (error) {
      diagnostics.tests.push({
        name: '前3个recipes',
        status: 'error',
        error: error.message
      });
    }

    // 测试 6: 测试实际查询（模拟recipes接口的查询）
    try {
      const page = 1;
      const limit = 5;
      const offset = 0;
      
      const countQuery = `SELECT COUNT(*)::int as total FROM recipes WHERE status = 'published'`;
      const countResult = await sql.query(countQuery, []);
      
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
        WHERE r.status = 'published'
        ORDER BY r.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const listResult = await sql.query(listQuery, [limit, offset]);
      
      diagnostics.tests.push({
        name: '实际查询测试',
        status: 'success',
        result: {
          total: countResult.rows[0].total,
          returned: listResult.rows.length,
          samples: listResult.rows.map(r => ({
            id: r.id,
            title: r.title,
            category: r.category
          }))
        }
      });
    } catch (error) {
      diagnostics.tests.push({
        name: '实际查询测试',
        status: 'error',
        error: error.message,
        stack: error.stack
      });
    }

    res.status(200).json({
      code: 200,
      message: 'Diagnostics completed',
      data: diagnostics
    });

  } catch (error) {
    diagnostics.tests.push({
      name: '总体执行',
      status: 'error',
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      code: 500,
      message: '诊断执行错误',
      data: diagnostics
    });
  }
};

