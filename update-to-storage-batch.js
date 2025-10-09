/**
 * 批量更新数据库中的图片URL到对象存储（使用SQL批量更新，避免锁超时）
 */

const mysql = require('mysql2/promise');

// 数据库配置
const DB_CONFIG = {
  host: 'mysql3.sqlpub.com',
  port: 3308,
  user: 'david_x',
  password: 'NVRvnX3rP88UyUET',
  database: 'onefoodlibrary',
  charset: 'utf8mb4'
};

// 对象存储基础URL
const STORAGE_BASE_URL = 'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com';

async function updateDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('🔗 数据库连接成功！\n');
    console.log('📦 对象存储信息：');
    console.log(`   存储桶：796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091`);
    console.log(`   地域：ap-shanghai`);
    console.log(`   基础URL：${STORAGE_BASE_URL}\n`);

    // 查询需要更新的记录数量
    console.log('🔍 查询需要更新的食谱...\n');
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM recipes 
      WHERE cover_image LIKE '%/uploads/images/laoxiangji/%' 
         OR cover_image LIKE '%/images/laoxiangji/%'
         OR cover_image LIKE 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/%'
    `);

    const totalCount = countResult[0].count;

    if (totalCount === 0) {
      console.log('✅ 没有找到需要更新的记录');
      await connection.end();
      return;
    }

    console.log(`📊 找到 ${totalCount} 条需要更新的记录\n`);
    console.log('🚀 使用批量更新方式，速度更快...\n');

    // 使用 SQL 的 REPLACE 函数批量更新
    // 将 https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/
    // 替换为对象存储URL
    const [result] = await connection.execute(`
      UPDATE recipes 
      SET cover_image = REPLACE(
        cover_image,
        'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/',
        '${STORAGE_BASE_URL}/laoxiangji/'
      )
      WHERE cover_image LIKE 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/%'
    `);

    console.log(`✅ 批量更新完成！影响 ${result.affectedRows} 条记录\n`);

    // 验证更新结果
    console.log('🔍 验证更新结果...\n');
    const [updated] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM recipes 
      WHERE cover_image LIKE '${STORAGE_BASE_URL}%'
    `);

    console.log(`✅ 当前使用对象存储的食谱数量：${updated[0].count}\n`);

    // 显示示例URL
    const [samples] = await connection.execute(`
      SELECT id, title, cover_image 
      FROM recipes 
      WHERE cover_image LIKE '${STORAGE_BASE_URL}%' 
      ORDER BY id
      LIMIT 5
    `);

    if (samples.length > 0) {
      console.log('📋 示例URL（前5条）：\n');
      samples.forEach((r, index) => {
        console.log(`${index + 1}. [${r.id}] ${r.title}`);
        console.log(`   ${r.cover_image}\n`);
      });
    }

    console.log('='.repeat(60));
    console.log('✅ 数据库更新完成！');
    console.log('='.repeat(60));
    console.log('\n📌 下一步：');
    console.log('   1. 在浏览器中测试示例URL是否能访问');
    console.log('   2. 在小程序中配置域名白名单');
    console.log('   3. 运行验证脚本：node verify-storage-urls.js\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('详细信息:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行更新
console.log('🚀 开始批量更新数据库中的图片URL...\n');
updateDatabase().catch(error => {
  console.error('💥 程序执行失败:', error);
  process.exit(1);
});

