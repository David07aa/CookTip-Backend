const mysql = require('mysql2/promise');

async function updateImageUrls() {
  console.log('🔄 开始更新数据库中的图片URL...\n');

  const dbConfig = {
    host: 'mysql3.sqlpub.com',
    port: 3308,
    user: 'david_x',
    password: 'NVRvnX3rP88UyUET',
    database: 'onefoodlibrary',
    charset: 'utf8mb4'
  };

  const BASE_URL = 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com';

  let connection;

  try {
    console.log('🔌 正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！\n');

    // 1. 查看当前图片URL情况
    const [currentRecipes] = await connection.execute(
      'SELECT id, title, cover_image FROM recipes WHERE cover_image LIKE "/images/%" LIMIT 5'
    );

    console.log('📋 当前图片URL示例（更新前）：');
    currentRecipes.forEach((recipe, index) => {
      console.log(`   ${index + 1}. ${recipe.title}`);
      console.log(`      ${recipe.cover_image}\n`);
    });

    // 2. 更新所有以 /images/ 开头的图片路径
    console.log('🔄 正在更新图片URL...');
    
    const [result] = await connection.execute(`
      UPDATE recipes 
      SET cover_image = CONCAT('${BASE_URL}/uploads', cover_image)
      WHERE cover_image LIKE '/images/%'
    `);

    console.log(`✅ 成功更新 ${result.affectedRows} 条记录！\n`);

    // 3. 验证更新结果
    const [updatedRecipes] = await connection.execute(
      'SELECT id, title, cover_image FROM recipes WHERE cover_image LIKE "https://%" LIMIT 5'
    );

    console.log('📋 更新后的图片URL示例：');
    updatedRecipes.forEach((recipe, index) => {
      console.log(`   ${index + 1}. ${recipe.title}`);
      console.log(`      ${recipe.cover_image}\n`);
    });

    // 4. 统计信息
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN cover_image LIKE 'https://%' THEN 1 END) as with_full_url,
        COUNT(CASE WHEN cover_image LIKE '/images/%' THEN 1 END) as with_relative_url
      FROM recipes
    `);

    console.log('📊 更新统计：');
    console.log(`   总食谱数: ${stats[0].total}`);
    console.log(`   完整URL: ${stats[0].with_full_url}`);
    console.log(`   相对路径: ${stats[0].with_relative_url}\n`);

    if (stats[0].with_relative_url === 0) {
      console.log('🎉 所有图片URL已成功更新为完整URL！');
    }

    await connection.end();
    console.log('\n✅ 数据库连接已关闭。');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

// 执行更新
updateImageUrls();

