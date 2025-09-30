// 直接测试数据库连接
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('开始测试数据库连接...');
  console.log('配置:', {
    host: 'mysql3.sqlpub.com',
    port: 3308,
    database: 'onefoodlibrary',
    user: 'david_x'
  });

  try {
    // 测试1：基本连接
    console.log('\n测试1：基本连接...');
    const connection1 = await mysql.createConnection({
      host: 'mysql3.sqlpub.com',
      port: 3308,
      database: 'onefoodlibrary',
      user: 'david_x',
      password: 'NVRvnX3rP88UyUET'
    });
    console.log('✅ 基本连接成功！');
    await connection1.end();

  } catch (error) {
    console.error('❌ 测试1失败:', error.message);
    console.error('错误代码:', error.code);
    console.error('SQL状态:', error.sqlState);
  }

  try {
    // 测试2：禁用SSL
    console.log('\n测试2：禁用SSL连接...');
    const connection2 = await mysql.createConnection({
      host: 'mysql3.sqlpub.com',
      port: 3308,
      database: 'onefoodlibrary',
      user: 'david_x',
      password: 'NVRvnX3rP88UyUET',
      ssl: false
    });
    console.log('✅ 禁用SSL连接成功！');
    await connection2.end();

  } catch (error) {
    console.error('❌ 测试2失败:', error.message);
  }

  try {
    // 测试3：使用连接池
    console.log('\n测试3：使用连接池...');
    const pool = mysql.createPool({
      host: 'mysql3.sqlpub.com',
      port: 3308,
      database: 'onefoodlibrary',
      user: 'david_x',
      password: 'NVRvnX3rP88UyUET',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });
    const connection3 = await pool.getConnection();
    console.log('✅ 连接池连接成功！');
    connection3.release();
    await pool.end();

  } catch (error) {
    console.error('❌ 测试3失败:', error.message);
  }
}

testConnection().then(() => {
  console.log('\n测试完成！');
  process.exit(0);
}).catch(err => {
  console.error('\n测试异常:', err);
  process.exit(1);
});
