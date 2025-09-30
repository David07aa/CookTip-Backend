const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'mysql3.sqlpub.com',
  port: parseInt(process.env.DB_PORT || '3308'),
  database: process.env.DB_NAME || 'onefoodlibrary',
  user: process.env.DB_USER || 'david_x',
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 1, // Vercel Serverless 每个函数最多1个连接
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  authPlugins: {
    mysql_native_password: () => () => Buffer.from([])
  },
  // 兼容不同的 MySQL 认证方式
  insecureAuth: true
};

// 日志输出（生产环境）
console.log('数据库配置:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  hasPassword: !!dbConfig.password
});

// 创建连接池（适合 Vercel Serverless）
const pool = mysql.createPool(dbConfig);

// 查询封装
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 获取单条记录
async function queryOne(sql, params = []) {
  const results = await query(sql, params);
  return results[0] || null;
}

// 事务封装
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 测试连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功！');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  query,
  queryOne,
  transaction,
  testConnection
};
