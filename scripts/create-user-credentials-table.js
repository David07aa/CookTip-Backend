const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createUserCredentialsTable() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com',
    port: 23831,
    user: 'root',
    password: '050710Xzl',
    database: 'cooktip',
    multipleStatements: true
  });

  try {
    console.log('🔗 连接数据库成功！\n');

    // 读取 SQL 文件
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/migrations/2025-10-17-create-user-credentials.sql'),
      'utf8'
    );

    console.log('📋 开始创建 user_credentials 表...\n');
    console.log('='.repeat(60));

    // 执行 SQL
    const [results] = await connection.query(sql);
    
    // 显示结果
    if (Array.isArray(results)) {
      results.forEach(result => {
        if (Array.isArray(result) && result.length > 0) {
          console.log(JSON.stringify(result, null, 2));
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ user_credentials 表创建成功！\n');

    // 验证表结构
    const [columns] = await connection.execute('DESCRIBE user_credentials');
    console.log('📊 user_credentials 表结构：');
    console.log('字段名'.padEnd(20) + '类型'.padEnd(25) + '键');
    console.log('-'.repeat(60));
    columns.forEach(col => {
      console.log(
        col.Field.padEnd(20) + 
        col.Type.padEnd(25) + 
        (col.Key || '-')
      );
    });

    // 统计数据
    const [stats] = await connection.execute(`
      SELECT 
        type as '认证类型',
        COUNT(*) as '数量',
        SUM(CASE WHEN is_main THEN 1 ELSE 0 END) as '主账号数',
        SUM(CASE WHEN is_verified THEN 1 ELSE 0 END) as '已验证数'
      FROM user_credentials
      GROUP BY type
    `);

    console.log('\n📊 凭证数据统计：');
    console.log(stats);

    // 显示示例数据
    const [sampleData] = await connection.execute(`
      SELECT 
        c.id,
        c.user_id,
        u.nickname,
        c.type,
        c.account,
        c.is_main,
        c.is_verified
      FROM user_credentials c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.user_id, c.is_main DESC
      LIMIT 10
    `);

    console.log('\n👤 凭证示例数据：');
    sampleData.forEach(data => {
      console.log(`  用户: ${data.nickname} (ID: ${data.user_id})`);
      console.log(`    - 类型: ${data.type}, 账号: ${data.account}, 主账号: ${data.is_main ? '是' : '否'}, 已验证: ${data.is_verified ? '是' : '否'}`);
    });

    console.log('\n🎉 完成！');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

console.log('🚀 创建 user_credentials 表');
console.log('='.repeat(60));
console.log('此操作将：');
console.log('  1. 创建 user_credentials 表');
console.log('  2. 迁移现有用户的认证信息');
console.log('  3. 支持多账号绑定功能');
console.log('\n开始执行...\n');

createUserCredentialsTable();

