const mysql = require('mysql2/promise');

async function checkDatabaseImages() {
  console.log('=== 连接数据库检查图片URL ===\n');

  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com',
    port: 23831,
    user: 'root',
    password: '050710Xzl',
    database: 'cooktip'
  });

  console.log('✅ 数据库连接成功\n');

  // 1. 检查前5条食谱记录
  console.log('📋 前5条食谱记录的图片URL：');
  console.log('='.repeat(100));
  
  const [recipes] = await connection.execute(
    'SELECT id, title, cover_image FROM recipes WHERE cover_image IS NOT NULL LIMIT 5'
  );

  recipes.forEach((recipe, index) => {
    console.log(`\n${index + 1}. ID: ${recipe.id}`);
    console.log(`   标题: ${recipe.title}`);
    console.log(`   封面: ${recipe.cover_image}`);
    
    // 判断URL类型
    if (recipe.cover_image.includes('796a-yjsp-wxxcx')) {
      console.log('   ❌ 类型: 旧云开发存储域名（需要更新）');
    } else if (recipe.cover_image.includes('yjsp-1367462091.cos')) {
      console.log('   ✅ 类型: 新COS域名（已更新）');
    } else if (recipe.cover_image.startsWith('http')) {
      console.log('   ⚠️  类型: 其他完整URL');
    } else {
      console.log('   ✅ 类型: 相对路径（最佳）');
    }
  });

  // 2. 统计各类型URL数量
  console.log('\n\n' + '='.repeat(100));
  console.log('📊 统计信息：');
  console.log('='.repeat(100));
  
  const [stats] = await connection.execute(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN cover_image LIKE '%796a-yjsp-wxxcx%' THEN 1 ELSE 0 END) as old_domain,
      SUM(CASE WHEN cover_image LIKE '%yjsp-1367462091.cos%' THEN 1 ELSE 0 END) as new_domain,
      SUM(CASE WHEN cover_image NOT LIKE 'http%' AND cover_image IS NOT NULL THEN 1 ELSE 0 END) as relative_path,
      SUM(CASE WHEN cover_image IS NULL THEN 1 ELSE 0 END) as null_count
    FROM recipes
  `);

  const stat = stats[0];
  console.log(`\n总记录数: ${stat.total}`);
  console.log(`包含旧域名 (796a-yjsp-wxxcx): ${stat.old_domain} 条 ${stat.old_domain > 0 ? '❌ 需要更新' : '✅'}`);
  console.log(`包含新域名 (yjsp-1367462091.cos): ${stat.new_domain} 条 ${stat.new_domain > 0 ? '✅' : ''}`);
  console.log(`使用相对路径: ${stat.relative_path} 条 ${stat.relative_path > 0 ? '✅ 最佳方案' : ''}`);
  console.log(`空值: ${stat.null_count} 条`);

  // 3. 结论和建议
  console.log('\n\n' + '='.repeat(100));
  console.log('💡 结论和建议：');
  console.log('='.repeat(100));
  
  if (stat.relative_path > 0 && stat.old_domain === 0) {
    console.log('\n✅ 好消息！数据库使用相对路径存储图片URL');
    console.log('   无需更新数据库，只需：');
    console.log('   1. 确保图片已在新COS存储桶中');
    console.log('   2. 更新云托管环境变量 CDN_BASE_URL');
    console.log('   3. 重启云托管服务');
  } else if (stat.old_domain > 0) {
    console.log(`\n❌ 数据库中有 ${stat.old_domain} 条记录使用旧域名`);
    console.log('   需要执行以下操作：');
    console.log('   1. 备份数据库（重要！）');
    console.log('   2. 执行 SQL UPDATE 语句更新URL');
    console.log('   3. 迁移图片文件到新COS');
    console.log('   4. 更新环境变量并重启服务');
    console.log('\n   可以运行: node scripts/update-image-urls.js');
  }

  console.log('\n\n' + '='.repeat(100));

  await connection.end();
  console.log('\n✅ 检查完成');
}

checkDatabaseImages().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});

