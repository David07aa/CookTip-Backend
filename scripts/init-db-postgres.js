// PostgreSQL 数据库初始化脚本
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  console.log('🚀 开始初始化 PostgreSQL 数据库...\n');

  try {
    // 读取 schema 文件
    const schemaPath = path.join(__dirname, 'schema-postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📝 执行数据库结构创建...');
    
    // 执行 schema（PostgreSQL 支持一次执行多条语句）
    await sql.query(schema);
    
    console.log('✅ 数据库结构创建成功！\n');

    // 验证表是否创建成功
    console.log('🔍 验证创建的表...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log(`\n✅ 成功创建 ${tables.rows.length} 个表：`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🎉 数据库初始化完成！');

  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

// 执行初始化
initDatabase()
  .then(() => {
    console.log('\n✨ 所有操作完成！');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 发生错误:', err);
    process.exit(1);
  });
