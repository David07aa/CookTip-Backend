/**
 * 测试云托管数据库连接
 * 快速验证数据库配置是否正确
 */

const mysql = require('mysql2/promise');

// 云托管数据库配置（内网地址）
const DB_CONFIG = {
  host: '10.32.104.73',
  port: 3306,
  user: 'root',
  password: '050710Xzl',
  database: 'cooktip',
  charset: 'utf8mb4'
};

async function testConnection() {
  let connection;
  
  console.log('🔍 开始测试数据库连接...\n');
  console.log('配置信息:');
  console.log(`  主机: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`  数据库: ${DB_CONFIG.database}`);
  console.log(`  用户: ${DB_CONFIG.user}`);
  console.log('');
  
  try {
    // 测试 1: 连接数据库
    console.log('📡 测试 1: 尝试连接数据库...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功！\n');
    
    // 测试 2: 检查数据库是否存在
    console.log('📊 测试 2: 检查数据库...');
    const [databases] = await connection.query('SHOW DATABASES LIKE "cooktip"');
    if (databases.length > 0) {
      console.log('✅ 数据库 "cooktip" 存在\n');
    } else {
      console.log('❌ 数据库 "cooktip" 不存在！\n');
      return;
    }
    
    // 测试 3: 检查表结构
    console.log('📋 测试 3: 检查数据表...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ 找到 ${tables.length} 个数据表:`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
    });
    console.log('');
    
    // 测试 4: 检查数据
    console.log('📦 测试 4: 检查数据量...');
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`   用户数: ${users[0].count}`);
    
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
    console.log(`   分类数: ${categories[0].count}`);
    
    const [recipes] = await connection.query('SELECT COUNT(*) as count FROM recipes');
    console.log(`   食谱数: ${recipes[0].count}`);
    console.log('');
    
    // 测试 5: 读取示例数据
    console.log('🍳 测试 5: 读取示例数据...');
    const [sampleRecipes] = await connection.query('SELECT id, title FROM recipes LIMIT 3');
    console.log('   示例食谱:');
    sampleRecipes.forEach((recipe, index) => {
      console.log(`   ${index + 1}. ${recipe.title}`);
    });
    console.log('');
    
    console.log('═══════════════════════════════════════');
    console.log('✅ 所有测试通过！数据库配置正确！');
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.log('\n❌ 数据库连接失败！\n');
    console.error('错误类型:', error.code || 'UNKNOWN');
    console.error('错误信息:', error.message);
    console.log('');
    
    // 提供具体的解决建议
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('💡 可能原因:');
      console.log('   1. 数据库地址或端口配置错误');
      console.log('   2. 数据库实例未运行');
      console.log('   3. 网络连接问题（本地无法访问内网地址）');
      console.log('');
      console.log('🔧 解决方案:');
      console.log('   - 检查数据库实例是否正常运行');
      console.log('   - 确认使用的是内网地址（云托管内部）');
      console.log('   - 本地测试需要使用外网地址');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 可能原因:');
      console.log('   - 数据库用户名或密码错误');
      console.log('');
      console.log('🔧 解决方案:');
      console.log('   - 检查 DB_USERNAME 和 DB_PASSWORD 配置');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 可能原因:');
      console.log('   - 数据库名称错误或数据库不存在');
      console.log('');
      console.log('🔧 解决方案:');
      console.log('   - 运行 init-cloudbase-db.js 创建数据库');
    }
    
    process.exit(1);
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 连接已关闭\n');
    }
  }
}

// 如果是本地运行，提示切换到外网地址
if (DB_CONFIG.host === '10.32.104.73') {
  console.log('\n⚠️  注意: 当前使用内网地址，仅在云托管内部可用');
  console.log('   如果本地测试，请修改为外网地址:');
  console.log('   host: "sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com"');
  console.log('   port: 23831\n');
}

testConnection();

