/**
 * 检查数据库中当前的图片URL格式
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'mysql3.sqlpub.com',
  port: 3308,
  user: 'david_x',
  password: 'NVRvnX3rP88UyUET',
  database: 'onefoodlibrary',
  charset: 'utf8mb4'
};

async function checkCurrentUrls() {
  let connection;
  
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('🔗 数据库连接成功！\n');

    // 获取所有食谱的图片URL示例
    const [recipes] = await connection.execute(`
      SELECT id, title, cover_image 
      FROM recipes 
      WHERE cover_image IS NOT NULL AND cover_image != ''
      ORDER BY id 
      LIMIT 20
    `);

    console.log('📋 当前数据库中的图片URL格式（前20条）：\n');
    console.log('='.repeat(80));
    
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. [ID: ${recipe.id}] ${recipe.title}`);
      console.log(`   URL: ${recipe.cover_image}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log(`\n共显示 ${recipes.length} 条记录\n`);

    // 统计URL格式分布
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN cover_image IS NULL OR cover_image = '' THEN 1 END) as no_image,
        COUNT(CASE WHEN cover_image LIKE 'http%' THEN 1 END) as http_urls,
        COUNT(CASE WHEN cover_image LIKE '/%' THEN 1 END) as relative_urls,
        COUNT(CASE WHEN cover_image NOT LIKE 'http%' AND cover_image NOT LIKE '/%' AND cover_image IS NOT NULL AND cover_image != '' THEN 1 END) as other_format
      FROM recipes
    `);

    console.log('📊 URL格式统计：');
    console.log(`   总食谱数：${stats[0].total}`);
    console.log(`   无图片：${stats[0].no_image}`);
    console.log(`   HTTP(S) URL：${stats[0].http_urls}`);
    console.log(`   相对路径 (/)：${stats[0].relative_urls}`);
    console.log(`   其他格式：${stats[0].other_format}`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

checkCurrentUrls();

