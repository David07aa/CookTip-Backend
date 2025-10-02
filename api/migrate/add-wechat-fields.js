// 数据库迁移：添加微信登录字段
const { sql } = require('../../lib/db');

module.exports = async (req, res) => {
  // 仅允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: '仅支持 GET 请求'
    });
  }

  try {
    console.log('🔄 开始更新数据库 schema...');

    // 1. 添加 session_key 字段
    console.log('1. 添加 session_key 字段...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS session_key VARCHAR(100)
    `;
    console.log('✅ session_key 字段添加成功');

    // 2. 添加 union_id 字段
    console.log('2. 添加 union_id 字段...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS union_id VARCHAR(100)
    `;
    console.log('✅ union_id 字段添加成功');

    // 3. 为 union_id 添加索引
    console.log('3. 为 union_id 添加索引...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_union_id ON users(union_id)
    `;
    console.log('✅ 索引添加成功');

    // 4. 验证字段
    console.log('4. 验证表结构...');
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('openid', 'session_key', 'union_id')
      ORDER BY column_name
    `;

    const fields = result.rows.map(col => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === 'YES'
    }));

    console.log('✅ 微信相关字段验证完成');

    return res.status(200).json({
      success: true,
      message: '数据库 schema 更新完成',
      data: {
        fields: fields,
        message: '已成功添加微信登录相关字段'
      }
    });

  } catch (error) {
    console.error('❌ 更新失败:', error);
    return res.status(500).json({
      success: false,
      message: '数据库更新失败',
      error: error.message
    });
  }
};

