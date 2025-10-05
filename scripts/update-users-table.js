/**
 * 更新 users 表结构 - 添加微信登录必需字段
 * 执行方式：node scripts/update-users-table.js
 */

const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

async function updateUsersTable() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 开始更新 users 表结构...\n');

    // 添加缺失的字段
    const migrations = [
      {
        name: 'session_key',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS session_key VARCHAR(255);`,
        description: '微信会话密钥'
      },
      {
        name: 'union_id',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS union_id VARCHAR(100);`,
        description: '微信 unionid'
      },
      {
        name: 'phone',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);`,
        description: '手机号'
      },
      {
        name: 'email',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100);`,
        description: '邮箱'
      },
      {
        name: 'gender',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS gender SMALLINT DEFAULT 0;`,
        description: '性别 (0-未知, 1-男, 2-女)'
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const migration of migrations) {
      try {
        console.log(`📝 添加字段: ${migration.name} (${migration.description})`);
        await pool.query(migration.sql);
        console.log(`✅ ${migration.name} 添加成功\n`);
        successCount++;
      } catch (error) {
        console.error(`❌ ${migration.name} 添加失败:`, error.message, '\n');
        errorCount++;
      }
    }

    // 创建索引
    console.log('📝 创建索引...');
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);`);
      console.log('✅ idx_users_phone 索引创建成功');
      
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
      console.log('✅ idx_users_email 索引创建成功\n');
      
      successCount += 2;
    } catch (error) {
      console.error('❌ 创建索引失败:', error.message, '\n');
      errorCount++;
    }

    // 验证表结构
    console.log('🔍 验证表结构...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 users 表当前结构:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`✅ 更新完成！成功 ${successCount} 项，失败 ${errorCount} 项\n`);

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 执行迁移
updateUsersTable().catch(console.error);

