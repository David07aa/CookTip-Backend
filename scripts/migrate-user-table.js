const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrateUserTable() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com',
    port: 23831,
    user: 'root',
    password: '050710Xzl',
    database: 'cooktip',
    multipleStatements: true
  });

  try {
    console.log('🔗 正在连接数据库...\n');

    // 读取迁移脚本
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/2025-10-17-extend-user-table.sql'),
      'utf8'
    );

    console.log('📋 开始执行迁移脚本...\n');
    console.log('='.repeat(60));

    // 执行迁移（分步执行）
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // 跳过注释和空语句
      if (statement.startsWith('--') || statement.length < 5) {
        continue;
      }

      try {
        const [results] = await connection.execute(statement);
        
        // 如果是 SELECT 语句，显示结果
        if (statement.toUpperCase().trim().startsWith('SELECT')) {
          if (Array.isArray(results) && results.length > 0) {
            console.log(JSON.stringify(results, null, 2));
          }
        } else {
          console.log(`✅ 执行成功: ${statement.substring(0, 50)}...`);
        }
      } catch (err) {
        // 某些错误可以忽略（如字段已存在）
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log(`⚠️ 跳过: ${err.message}`);
        } else {
          console.error(`❌ 执行失败: ${statement.substring(0, 50)}...`);
          console.error(`   错误: ${err.message}`);
          throw err;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 迁移完成！\n');

    // 最终验证
    console.log('📊 最终验证结果：');
    console.log('='.repeat(60));

    // 显示新表结构
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('\n新的 users 表结构：');
    console.log('字段名'.padEnd(20) + '类型'.padEnd(20) + '键');
    console.log('-'.repeat(60));
    columns.forEach(col => {
      console.log(
        col.Field.padEnd(20) + 
        col.Type.padEnd(20) + 
        (col.Key || 'N/A')
      );
    });

    // 统计数据
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [backupCountResult] = await connection.execute('SELECT COUNT(*) as count FROM users_backup_20251017');
    
    console.log('\n数据完整性：');
    console.log(`  当前用户数: ${countResult[0].count}`);
    console.log(`  备份用户数: ${backupCountResult[0].count}`);
    console.log(`  状态: ${countResult[0].count === backupCountResult[0].count ? '✅ 完整' : '⚠️ 不一致'}`);

    // 显示示例数据
    const [sampleData] = await connection.execute(`
      SELECT id, openid, nickname, username, email, phone, is_verified, recipe_count 
      FROM users 
      LIMIT 3
    `);
    console.log('\n用户数据示例：');
    console.log(JSON.stringify(sampleData, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ 迁移成功！');
    console.log('\n📝 重要提示：');
    console.log('  1. 原有数据已备份到 users_backup_20251017 表');
    console.log('  2. 微信登录功能保持不变');
    console.log('  3. 新增字段均为可选，不影响现有业务');
    console.log('  4. 如需回滚，执行: node scripts/rollback-user-table.js');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('\n🔧 解决方案：');
    console.error('  1. 检查数据库连接');
    console.error('  2. 检查数据库权限');
    console.error('  3. 如需回滚，执行: node scripts/rollback-user-table.js');
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// 执行前确认
console.log('⚠️  用户表扩展迁移');
console.log('='.repeat(60));
console.log('此操作将：');
console.log('  1. 备份现有 users 表数据');
console.log('  2. 添加新字段：username, email, phone, password_hash, is_verified');
console.log('  3. 创建相关索引');
console.log('  4. ✅ 保留所有现有数据和微信登录功能');
console.log('\n正在执行迁移...\n');

migrateUserTable();

