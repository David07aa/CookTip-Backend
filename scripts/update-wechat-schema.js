// 更新数据库 schema - 添加微信登录字段
const { sql } = require('../lib/db');
const fs = require('fs');
const path = require('path');

async function updateSchema() {
  try {
    console.log('🔄 开始更新数据库 schema...');

    // 添加 session_key 和 union_id 字段
    console.log('1. 添加 session_key 字段...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS session_key VARCHAR(100)
    `;
    console.log('✅ session_key 字段添加成功');

    console.log('2. 添加 union_id 字段...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS union_id VARCHAR(100)
    `;
    console.log('✅ union_id 字段添加成功');

    console.log('3. 为 union_id 添加索引...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_union_id ON users(union_id)
    `;
    console.log('✅ 索引添加成功');

    // 验证字段
    console.log('\n4. 验证表结构...');
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('openid', 'session_key', 'union_id')
      ORDER BY column_name
    `;

    console.log('\n✅ 微信相关字段：');
    result.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n🎉 数据库 schema 更新完成！');
    process.exit(0);

  } catch (error) {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  }
}

updateSchema();

