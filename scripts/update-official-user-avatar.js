/**
 * 更新"老乡鸡官方"用户的头像为存储桶 LOGO
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// 老乡鸡 LOGO URL
const LOGO_URL = 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/LXJLOGO/LxjLogo.png';

async function main() {
  console.log('🔧 开始更新老乡鸡官方用户头像...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // 1. 查找"老乡鸡官方"用户
    console.log('📋 步骤 1: 查找"老乡鸡官方"用户...');
    const [users] = await connection.execute(`
      SELECT id, nickname, avatar 
      FROM users 
      WHERE nickname = '老乡鸡官方'
    `);

    if (users.length === 0) {
      console.log('   ⚠️  未找到"老乡鸡官方"用户\n');
      return;
    }

    console.log(`   找到 ${users.length} 个用户\n`);
    users.forEach(user => {
      console.log(`   - ID: ${user.id}`);
      console.log(`     昵称: ${user.nickname}`);
      console.log(`     当前头像: ${user.avatar}\n`);
    });

    // 2. 更新头像
    console.log('🔄 步骤 2: 更新头像为存储桶 LOGO...');
    const [result] = await connection.execute(`
      UPDATE users 
      SET avatar = ? 
      WHERE nickname = '老乡鸡官方'
    `, [LOGO_URL]);

    console.log(`   ✅ 成功更新 ${result.affectedRows} 个用户的头像\n`);

    // 3. 验证更新结果
    console.log('✅ 步骤 3: 验证更新结果...');
    const [updatedUsers] = await connection.execute(`
      SELECT id, nickname, avatar 
      FROM users 
      WHERE nickname = '老乡鸡官方'
    `);

    console.log('   更新后的用户信息:\n');
    updatedUsers.forEach(user => {
      console.log(`   - ID: ${user.id}`);
      console.log(`     昵称: ${user.nickname}`);
      console.log(`     新头像: ${user.avatar}\n`);
    });

    console.log('🎊 更新完成！\n');

  } catch (error) {
    console.error('❌ 更新失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 运行脚本
main().catch(err => {
  console.error('执行失败:', err);
  process.exit(1);
});

