// 验证 PostgreSQL 数据库结构
const { sql } = require('@vercel/postgres');

async function verifyDatabase() {
  console.log('🔍 开始验证数据库结构...\n');

  try {
    // 1. 检查扩展
    console.log('📦 检查 UUID 扩展...');
    const extensions = await sql`
      SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp'
    `;
    if (extensions.rows.length > 0) {
      console.log('✅ UUID 扩展已启用\n');
    } else {
      console.log('❌ UUID 扩展未启用\n');
    }

    // 2. 检查表
    console.log('📋 检查数据表...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    const expectedTables = ['users', 'recipes', 'comments', 'favorites', 'likes', 'shopping_lists', 'follows'];
    console.log(`找到 ${tables.rows.length} 个表：`);
    
    const foundTables = tables.rows.map(row => row.table_name);
    expectedTables.forEach(tableName => {
      if (foundTables.includes(tableName)) {
        console.log(`   ✅ ${tableName}`);
      } else {
        console.log(`   ❌ ${tableName} (缺失)`);
      }
    });
    console.log();

    // 3. 检查表字段数量
    console.log('🔢 检查表结构...');
    for (const tableName of foundTables) {
      const columns = await sql.query(
        `SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
        [tableName]
      );
      console.log(`   ${tableName}: ${columns.rows[0].count} 个字段`);
    }
    console.log();

    // 4. 检查索引
    console.log('🔑 检查索引...');
    const indexes = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `;
    console.log(`找到 ${indexes.rows.length} 个索引：`);
    indexes.rows.forEach(row => {
      console.log(`   ✅ ${row.indexname}`);
    });
    console.log();

    // 5. 检查触发器
    console.log('⚡ 检查触发器...');
    const triggers = await sql`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY trigger_name
    `;
    console.log(`找到 ${triggers.rows.length} 个触发器：`);
    triggers.rows.forEach(row => {
      console.log(`   ✅ ${row.trigger_name} (表: ${row.event_object_table})`);
    });
    console.log();

    // 6. 检查触发器函数
    console.log('🔧 检查触发器函数...');
    const functions = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      ORDER BY routine_name
    `;
    console.log(`找到 ${functions.rows.length} 个函数：`);
    functions.rows.forEach(row => {
      console.log(`   ✅ ${row.routine_name}`);
    });
    console.log();

    // 7. 测试插入和查询
    console.log('🧪 测试数据库操作...');
    
    // 测试插入用户
    const testUserId = '00000000-0000-0000-0000-000000000001';
    await sql`
      INSERT INTO users (id, openid, nick_name) 
      VALUES (${testUserId}, 'test_openid_verify', '测试用户')
      ON CONFLICT (openid) DO NOTHING
    `;
    
    // 查询用户
    const testUser = await sql`
      SELECT * FROM users WHERE openid = 'test_openid_verify'
    `;
    
    if (testUser.rows.length > 0) {
      console.log('✅ 数据插入和查询测试成功');
      console.log(`   用户ID: ${testUser.rows[0].id}`);
      console.log(`   昵称: ${testUser.rows[0].nick_name}`);
    } else {
      console.log('❌ 数据操作测试失败');
    }
    console.log();

    // 8. 总结
    console.log('📊 验证总结:');
    console.log(`   ✅ 数据表: ${tables.rows.length}/7`);
    console.log(`   ✅ 索引: ${indexes.rows.length}`);
    console.log(`   ✅ 触发器: ${triggers.rows.length}`);
    console.log(`   ✅ 函数: ${functions.rows.length}`);
    
    const allTablesExist = expectedTables.every(t => foundTables.includes(t));
    if (allTablesExist && tables.rows.length === 7) {
      console.log('\n🎉 数据库结构完整！所有检查通过！');
      return true;
    } else {
      console.log('\n⚠️ 数据库结构不完整，请检查缺失的部分');
      return false;
    }

  } catch (error) {
    console.error('\n❌ 验证过程出错:', error.message);
    console.error('详细错误:', error);
    return false;
  }
}

// 执行验证
verifyDatabase()
  .then((success) => {
    console.log('\n✨ 验证完成！');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n💥 发生错误:', err);
    process.exit(1);
  });
