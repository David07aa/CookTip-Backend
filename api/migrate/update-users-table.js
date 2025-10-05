const { Pool } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: '只支持 POST 请求' 
    });
  }

  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('开始更新 users 表结构...');

    // 添加缺失的字段
    const migrations = [
      {
        name: 'session_key',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS session_key VARCHAR(255);`
      },
      {
        name: 'union_id',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS union_id VARCHAR(100);`
      },
      {
        name: 'phone',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);`
      },
      {
        name: 'email',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100);`
      },
      {
        name: 'gender',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS gender SMALLINT DEFAULT 0;`
      }
    ];

    const results = [];

    for (const migration of migrations) {
      try {
        console.log(`添加字段: ${migration.name}`);
        await pool.query(migration.sql);
        results.push({
          field: migration.name,
          status: 'success',
          message: `字段 ${migration.name} 添加成功`
        });
      } catch (error) {
        console.error(`添加字段 ${migration.name} 失败:`, error);
        results.push({
          field: migration.name,
          status: 'error',
          message: error.message
        });
      }
    }

    // 创建索引
    try {
      console.log('创建索引...');
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
      results.push({
        field: 'indexes',
        status: 'success',
        message: '索引创建成功'
      });
    } catch (error) {
      console.error('创建索引失败:', error);
      results.push({
        field: 'indexes',
        status: 'error',
        message: error.message
      });
    }

    console.log('users 表结构更新完成');

    res.status(200).json({
      success: true,
      message: 'users 表结构更新完成',
      results
    });

  } catch (error) {
    console.error('迁移失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    await pool.end();
  }
};

