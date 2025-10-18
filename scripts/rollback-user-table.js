const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function rollbackUserTable() {
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

    // 读取回滚脚本
    const rollbackSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/2025-10-17-rollback-user-table.sql'),
      'utf8'
    );

    console.log('📋 开始执行回滚脚本...\n');
    console.log('='.repeat(60));

    // 执行回滚（分步执行）
    const statements = rollbackSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.startsWith('--') || statement.length < 5) {
        continue;
      }

      try {
        const [results] = await connection.execute(statement);
        
        if (statement.toUpperCase().trim().startsWith('SELECT')) {
          if (Array.isArray(results) && results.length > 0) {
            console.log(JSON.stringify(results, null, 2));
          }
        } else {
          console.log(`✅ 执行成功: ${statement.substring(0, 50)}...`);
        }
      } catch (err) {
        if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY' || err.code === 'ER_BAD_FIELD_ERROR') {
          console.log(`⚠️ 跳过: ${err.message}`);
        } else {
          console.error(`❌ 执行失败: ${statement.substring(0, 50)}...`);
          console.error(`   错误: ${err.message}`);
          throw err;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 回滚完成！\n');

    // 验证回滚结果
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('回滚后的 users 表结构：');
    console.log('字段名'.padEnd(20) + '类型'.padEnd(20) + '键');
    console.log('-'.repeat(60));
    columns.forEach(col => {
      console.log(
        col.Field.padEnd(20) + 
        col.Type.padEnd(20) + 
        (col.Key || 'N/A')
      );
    });

    console.log('\n✅ 回滚成功！users 表已恢复到迁移前状态\n');

  } catch (error) {
    console.error('\n❌ 回滚失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

console.log('⚠️  用户表回滚操作');
console.log('='.repeat(60));
console.log('此操作将删除迁移时添加的字段和索引');
console.log('正在执行回滚...\n');

rollbackUserTable();

