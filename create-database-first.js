/**
 * 第一步：创建 cooktip 数据库
 */

const mysql = require('mysql2/promise');

// 连接配置（不指定数据库）
const DB_CONFIG = {
  host: 'sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com',
  port: 23831,
  user: 'root',
  password: '050710Xzl',
  charset: 'utf8mb4'
};

async function createDatabase() {
  let connection;
  
  try {
    console.log('🚀 开始创建数据库...\n');
    console.log('🔗 连接云托管数据库...');
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 连接成功！\n');
    
    // 创建数据库
    console.log('📦 创建数据库 cooktip...');
    await connection.query('CREATE DATABASE IF NOT EXISTS cooktip DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ 数据库 cooktip 创建成功！\n');
    
    // 验证
    const [databases] = await connection.query('SHOW DATABASES LIKE "cooktip"');
    if (databases.length > 0) {
      console.log('✅ 验证成功：数据库 cooktip 已存在\n');
    }
    
    console.log('📌 下一步：运行 node init-cloudbase-db.js 创建表结构\n');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 连接已关闭');
    }
  }
}

createDatabase();

