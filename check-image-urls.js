const mysql = require('mysql2/promise');

async function checkImageUrls() {
  console.log('📊 开始检查数据库中的图片URL...\n');

  // 数据库配置（SQLPub）
  const dbConfig = {
    host: 'mysql3.sqlpub.com',
    port: 3308,
    user: 'david_x',
    password: 'NVRvnX3rP88UyUET',
    database: 'onefoodlibrary',
    charset: 'utf8mb4'
  };

  let connection;

  try {
    console.log('🔌 正在连接数据库...');
    console.log(`   主机: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   数据库: ${dbConfig.database}\n`);

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！\n');

    // 1. 查询食谱总数
    const [countResult] = await connection.query('SELECT COUNT(*) as total FROM recipes');
    console.log(`📦 食谱总数: ${countResult[0].total}\n`);

    // 2. 查询前10个食谱的图片URL
    console.log('📷 前10个食谱的图片URL：');
    console.log('='.repeat(80));
    const [recipes] = await connection.query(`
      SELECT id, title, cover_image 
      FROM recipes 
      ORDER BY id ASC 
      LIMIT 10
    `);
    
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ID:${recipe.id} | ${recipe.title}`);
      console.log(`   图片: ${recipe.cover_image || '无图片'}`);
      console.log('-'.repeat(80));
    });

    // 3. 统计有图片和无图片的食谱数量
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN cover_image IS NOT NULL AND cover_image != '' THEN 1 ELSE 0 END) as has_image,
        SUM(CASE WHEN cover_image IS NULL OR cover_image = '' THEN 1 ELSE 0 END) as no_image
      FROM recipes
    `);
    
    console.log('\n📊 图片统计：');
    console.log(`   总食谱数: ${stats[0].total}`);
    console.log(`   有图片: ${stats[0].has_image}`);
    console.log(`   无图片: ${stats[0].no_image}`);

    // 4. 查询图片路径的格式
    console.log('\n🔍 图片路径格式分析：');
    const [imageFormats] = await connection.query(`
      SELECT DISTINCT 
        SUBSTRING_INDEX(cover_image, '/', 1) as format_type,
        COUNT(*) as count
      FROM recipes 
      WHERE cover_image IS NOT NULL AND cover_image != ''
      GROUP BY format_type
      ORDER BY count DESC
    `);
    
    imageFormats.forEach(format => {
      console.log(`   ${format.format_type}: ${format.count}个`);
    });

    // 5. 查询老乡鸡食谱的图片
    console.log('\n🍗 老乡鸡食谱图片示例（前5个）：');
    const [laoxiangjiRecipes] = await connection.query(`
      SELECT id, title, cover_image 
      FROM recipes 
      WHERE cover_image LIKE '%laoxiangji%'
      LIMIT 5
    `);
    
    if (laoxiangjiRecipes.length > 0) {
      laoxiangjiRecipes.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.title}`);
        console.log(`      ${recipe.cover_image}`);
      });
    } else {
      console.log('   ⚠️  未找到包含 laoxiangji 路径的图片');
    }

    // 6. 查询所有不同的图片路径前缀
    console.log('\n📁 图片路径前缀统计：');
    const [prefixes] = await connection.query(`
      SELECT 
        SUBSTRING_INDEX(SUBSTRING_INDEX(cover_image, '/', 3), '/', -1) as prefix,
        COUNT(*) as count
      FROM recipes 
      WHERE cover_image IS NOT NULL AND cover_image != ''
      GROUP BY prefix
      ORDER BY count DESC
      LIMIT 10
    `);
    
    prefixes.forEach(prefix => {
      console.log(`   /${prefix}/...: ${prefix.count}个`);
    });

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示: 无法连接到数据库，请检查：');
      console.error('   1. 数据库地址和端口是否正确');
      console.error('   2. 您的IP是否在白名单中');
      console.error('   3. 数据库账号密码是否正确');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 提示: 访问被拒绝，请检查：');
      console.error('   1. 数据库账号是否正确');
      console.error('   2. 数据库密码是否正确');
      console.error('   3. 账号是否有访问权限');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 数据库连接已关闭');
    }
  }
}

// 运行检查
checkImageUrls().catch(console.error);

