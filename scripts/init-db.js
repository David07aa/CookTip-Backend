const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 从环境变量或直接配置读取
const config = {
  host: process.env.DB_HOST || 'mysql3.sqlpub.com',
  port: parseInt(process.env.DB_PORT) || 3308,
  database: process.env.DB_NAME || 'onefoodlibrary',
  user: process.env.DB_USER || 'david_x',
  password: process.env.DB_PASSWORD || 'NVRvnX3rP88UyUET'
};

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔄 正在连接数据库...');
    console.log(`   主机: ${config.host}:${config.port}`);
    console.log(`   数据库: ${config.database}`);
    
    // 创建连接
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功！\n');

    // 1. 获取所有表
    console.log('🔍 检查现有表...');
    const [tables] = await connection.execute(
      'SHOW TABLES'
    );
    
    if (tables.length > 0) {
      console.log(`   发现 ${tables.length} 个表:`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
      
      // 2. 删除所有表（按依赖顺序）
      console.log('\n🗑️  正在清除表...');
      
      // 先禁用外键检查
      await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
      
      // 删除所有表
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
        console.log(`   ✓ 已删除表: ${tableName}`);
      }
      
      // 重新启用外键检查
      await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ 表清除完成！\n');
    } else {
      console.log('   没有发现现有表\n');
    }

    // 3. 读取并执行建表SQL
    console.log('📝 正在创建数据表...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // 移除注释并分割SQL语句
    const lines = schema.split('\n');
    let currentStatement = '';
    const statements = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // 跳过空行和注释行
      if (!trimmedLine || trimmedLine.startsWith('--')) {
        continue;
      }
      
      currentStatement += ' ' + line;
      
      // 如果遇到分号，表示一条语句结束
      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // 执行所有CREATE TABLE语句
    for (const statement of statements) {
      if (statement.includes('CREATE TABLE')) {
        const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
        const tableName = match ? match[1] : 'unknown';
        
        try {
          await connection.execute(statement);
          console.log(`   ✓ 已创建表: ${tableName}`);
        } catch (error) {
          console.error(`   ✗ 创建表 ${tableName} 失败:`, error.message);
        }
      }
    }
    
    console.log('✅ 数据表创建完成！\n');

    // 4. 验证表创建
    console.log('🔍 验证表结构...');
    const [newTables] = await connection.execute('SHOW TABLES');
    console.log(`   共创建 ${newTables.length} 个表:`);
    
    for (const table of newTables) {
      const tableName = Object.values(table)[0];
      const [columns] = await connection.execute(
        `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        [config.database, tableName]
      );
      console.log(`   ✓ ${tableName} (${columns[0].count} 列)`);
    }

    console.log('\n✅ 数据库初始化成功！');
    console.log('\n📊 数据库统计:');
    console.log(`   - 数据库名称: ${config.database}`);
    console.log(`   - 表数量: ${newTables.length}`);
    console.log(`   - 状态: 就绪\n`);

  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    console.error('\n错误详情:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行初始化
console.log('='.repeat(60));
console.log('🚀 一家食谱 - 数据库初始化脚本');
console.log('='.repeat(60));
console.log('');

initDatabase();
