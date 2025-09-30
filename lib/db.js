const { sql } = require('@vercel/postgres');

// Vercel 会自动注入 POSTGRES_URL 等环境变量
// 无需手动配置连接

// 日志输出
console.log('数据库配置:', {
  hasPostgresUrl: !!process.env.POSTGRES_URL,
  hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL
});

// 查询封装
async function query(sqlQuery, params = []) {
  try {
    const result = await sql.query(sqlQuery, params);
    return result.rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 获取单条记录
async function queryOne(sqlQuery, params = []) {
  const rows = await query(sqlQuery, params);
  return rows.length > 0 ? rows[0] : null;
}

// 测试连接
async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ 数据库连接成功！当前时间:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

module.exports = {
  sql,
  query,
  queryOne,
  testConnection
};