const mysql = require('mysql2/promise');

async function addSessionKeyField() {
  console.log('='.repeat(100));
  console.log('数据库迁移：添加 session_key 字段到 users 表');
  console.log('='.repeat(100));

  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com',
    port: 23831,
    user: 'root',
    password: '050710Xzl',
    database: 'cooktip'
  });

  console.log('\n✅ 数据库连接成功\n');

  try {
    // 步骤1：检查字段是否已存在
    console.log('步骤1：检查 session_key 字段是否存在...');
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cooktip'
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'session_key'
    `);

    if (columns.length > 0) {
      console.log('   ℹ️  session_key 字段已存在，无需添加\n');
      
      // 查看当前表结构
      const [structure] = await connection.execute('DESC users');
      console.log('📋 当前 users 表结构：');
      console.table(structure);
      
      await connection.end();
      return;
    }

    console.log('   ➕ session_key 字段不存在，准备添加...\n');

    // 步骤2：添加字段
    console.log('步骤2：添加 session_key 字段...');
    
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN session_key VARCHAR(200) NULL 
      COMMENT '微信session_key，用于解密敏感数据' 
      AFTER avatar
    `);

    console.log('   ✅ session_key 字段添加成功！\n');

    // 步骤3：验证字段是否添加成功
    console.log('步骤3：验证表结构...');
    
    const [newStructure] = await connection.execute('DESC users');
    console.log('\n📋 更新后的 users 表结构：');
    console.table(newStructure);

    // 步骤4：检查现有用户数据
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 现有用户数: ${userCount[0].count}`);
    
    if (userCount[0].count > 0) {
      console.log('   ℹ️  提示：现有用户的 session_key 为 NULL，会在下次登录时更新\n');
    }

    console.log('='.repeat(100));
    console.log('✅ 数据库迁移完成！');
    console.log('='.repeat(100));
    console.log('\n💡 说明：');
    console.log('   - session_key 用于存储微信返回的会话密钥');
    console.log('   - 可用于解密 wx.getUserProfile 等接口返回的敏感数据');
    console.log('   - 每次用户登录时会自动更新此字段\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await connection.end();
    console.log('✅ 数据库连接已关闭\n');
  }
}

// 执行迁移
addSessionKeyField();

