const { pool } = require('../lib/db');

/**
 * 健康检查端点
 * GET /api/health
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '仅支持GET请求'
    });
  }

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
      dbPort: process.env.DB_PORT || 'NOT_SET',
      dbName: process.env.DB_NAME || 'NOT_SET',
      dbUser: process.env.DB_USER || 'NOT_SET'
    },
    database: 'checking...'
  };

  // 测试数据库连接
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
};
