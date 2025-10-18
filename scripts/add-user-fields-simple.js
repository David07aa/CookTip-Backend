const mysql = require('mysql2/promise');

async function addUserFields() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com',
    port: 23831,
    user: 'root',
    password: '050710Xzl',
    database: 'cooktip'
  });

  try {
    console.log('🔗 连接数据库成功！\n');

    // 添加字段（一个一个执行）
    const alterStatements = [
      {
        sql: "ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE DEFAULT NULL COMMENT '用户名（可选）' AFTER session_key",
        field: 'username'
      },
      {
        sql: "ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE DEFAULT NULL COMMENT '邮箱（可选）' AFTER username",
        field: 'email'
      },
      {
        sql: "ALTER TABLE users ADD COLUMN phone VARCHAR(20) UNIQUE DEFAULT NULL COMMENT '手机号（可选）' AFTER email",
        field: 'phone'
      },
      {
        sql: "ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL COMMENT '密码哈希（可选）' AFTER phone",
        field: 'password_hash'
      },
      {
        sql: "ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false COMMENT '是否已验证' AFTER password_hash",
        field: 'is_verified'
      }
    ];

    console.log('📝 开始添加新字段...\n');

    for (const stmt of alterStatements) {
      try {
        await connection.execute(stmt.sql);
        console.log(`✅ 成功添加字段: ${stmt.field}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  字段已存在: ${stmt.field}`);
        } else {
          console.error(`❌ 添加字段失败: ${stmt.field}`);
          console.error(`   错误: ${err.message}`);
          throw err;
        }
      }
    }

    console.log('\n📝 添加索引...\n');

    const indexStatements = [
      { sql: "CREATE INDEX idx_username ON users(username)", name: 'idx_username' },
      { sql: "CREATE INDEX idx_email ON users(email)", name: 'idx_email' },
      { sql: "CREATE INDEX idx_phone ON users(phone)", name: 'idx_phone' }
    ];

    for (const stmt of indexStatements) {
      try {
        await connection.execute(stmt.sql);
        console.log(`✅ 成功创建索引: ${stmt.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠️  索引已存在: ${stmt.name}`);
        } else {
          console.error(`❌ 创建索引失败: ${stmt.name}`);
          console.error(`   错误: ${err.message}`);
        }
      }
    }

    console.log('\n✅ 迁移完成！\n');

    // 验证结果
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('📊 新的 users 表结构：');
    console.log('字段名'.padEnd(20) + '类型'.padEnd(25) + '键');
    console.log('='.repeat(60));
    columns.forEach(col => {
      console.log(
        col.Field.padEnd(20) + 
        col.Type.padEnd(25) + 
        (col.Key || '-')
      );
    });

    console.log('\n🎉 所有操作完成！');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

addUserFields();

