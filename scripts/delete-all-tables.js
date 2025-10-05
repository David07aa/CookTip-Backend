// 删除所有数据表脚本
// 警告：这会删除所有数据！

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.production' });

async function deleteAllTables() {
  console.log('========================================');
  console.log('  ⚠️  数据库完全删除脚本');
  console.log('========================================');
  console.log('');
  console.log('警告：即将删除所有数据表和数据！');
  console.log('');
  
  // 使用 POSTGRES_URL 或 DATABASE_URL
  const dbUrl = (process.env.POSTGRES_URL || process.env.DATABASE_URL || '').trim().replace(/\\r\\n/g, '');
  
  if (!dbUrl) {
    throw new Error('未找到数据库连接字符串！请检查环境变量。');
  }
  
  console.log('数据库连接: ' + dbUrl.substring(0, 30) + '...');
  console.log('');
  
  const sql = neon(dbUrl);
  
  try {
    console.log('正在连接到数据库...');
    
    // 获取所有表
    console.log('');
    console.log('【1】获取所有数据表...');
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    console.log(`找到 ${tables.length} 个数据表：`);
    tables.forEach(table => {
      console.log(`  - ${table.tablename}`);
    });
    console.log('');
    
    if (tables.length === 0) {
      console.log('✅ 数据库中没有表，无需删除。');
      return;
    }
    
    // 删除所有表
    console.log('【2】删除所有数据表...');
    console.log('');
    
    for (const table of tables) {
      const tableName = table.tablename;
      console.log(`删除表: ${tableName}...`);
      
      try {
        // 直接使用字符串拼接（表名不能用参数化查询）
        await sql([`DROP TABLE IF EXISTS "${tableName}" CASCADE`]);
        console.log(`  ✅ ${tableName} 已删除`);
      } catch (error) {
        console.log(`  ❌ ${tableName} 删除失败: ${error.message}`);
      }
    }
    
    console.log('');
    console.log('【3】验证删除结果...');
    
    const remainingTables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `;
    
    console.log('');
    if (remainingTables.length === 0) {
      console.log('✅ 所有数据表已成功删除！');
      console.log('');
      console.log('========================================');
      console.log('  数据库已清空');
      console.log('========================================');
      console.log('');
      console.log('下一步操作：');
      console.log('1. 重新设计数据库结构');
      console.log('2. 创建新的 schema.sql');
      console.log('3. 运行初始化脚本');
      console.log('4. 导入初始数据');
      console.log('');
    } else {
      console.log('⚠️  还有以下表未删除：');
      remainingTables.forEach(table => {
        console.log(`  - ${table.tablename}`);
      });
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ 执行失败:', error.message);
    console.error('');
    throw error;
  }
}

// 执行删除
deleteAllTables()
  .then(() => {
    console.log('脚本执行完成。');
    process.exit(0);
  })
  .catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });

