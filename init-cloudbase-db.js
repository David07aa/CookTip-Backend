/**
 * 初始化微信云托管数据库
 * 1. 创建表结构
 * 2. 插入初始分类数据
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// 云托管数据库配置
const DB_CONFIG = {
  host: 'sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com', // 外网地址
  port: 23831,
  user: 'root',
  password: '050710Xzl',
  database: 'cooktip',
  charset: 'utf8mb4',
  multipleStatements: true // 允许执行多条SQL
};

async function initDatabase() {
  let connection;
  
  try {
    console.log('🚀 开始初始化微信云托管数据库...\n');
    console.log('=' .repeat(60));
    
    // 检查配置
    if (!DB_CONFIG.user || !DB_CONFIG.password) {
      console.error('❌ 错误：请先配置数据库账号密码！');
      console.log('\n请编辑 init-cloudbase-db.js 文件：');
      console.log('  DB_CONFIG.user = "您的数据库账号"');
      console.log('  DB_CONFIG.password = "您的数据库密码"\n');
      process.exit(1);
    }
    
    // 连接数据库
    console.log('🔗 连接云托管数据库...');
    console.log(`   地址：${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   数据库：${DB_CONFIG.database}\n`);
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功！\n');
    
    console.log('=' .repeat(60));
    console.log('\n📦 第一步：读取初始化SQL脚本...\n');
    
    // 读取 init.sql 文件
    const initSQL = await fs.readFile('./database/init.sql', 'utf8');
    console.log('✅ SQL脚本读取成功\n');
    
    console.log('=' .repeat(60));
    console.log('\n🔨 第二步：创建数据库表结构...\n');
    
    // 执行初始化SQL
    await connection.query(initSQL);
    console.log('✅ 表结构创建成功！\n');
    
    // 验证表是否创建成功
    console.log('=' .repeat(60));
    console.log('\n🔍 第三步：验证表结构...\n');
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log('已创建的表：');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });
    
    console.log('\n=' .repeat(60));
    console.log('✅ 数据库初始化完成！\n');
    
    console.log('📊 数据库信息：');
    console.log(`   外网地址：${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   内网地址：10.32.104.73:3306`);
    console.log(`   数据库名：${DB_CONFIG.database}`);
    console.log(`   表数量：${tables.length}\n`);
    
    console.log('📌 下一步：');
    console.log('   1. 运行数据迁移脚本：node migrate-to-cloudbase.js');
    console.log('   2. 或手动填充测试数据\n');
    
  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n可能原因：');
      console.error('  - 数据库地址错误');
      console.error('  - 网络连接问题');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n可能原因：');
      console.error('  - 数据库账号或密码错误');
      console.error('  - 账号没有足够的权限');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n可能原因：');
      console.error('  - 数据库 cooktip 不存在');
      console.error('  - 请先在云数据库控制台创建数据库');
    }
    
    console.error('\n详细错误:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行初始化
initDatabase();

