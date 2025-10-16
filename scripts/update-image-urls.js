const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateImageUrls() {
  console.log('='.repeat(100));
  console.log('图片URL更新脚本');
  console.log('从云开发存储迁移到腾讯云COS');
  console.log('='.repeat(100));
  
  console.log('\n旧域名: https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com');
  console.log('新域名: https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com\n');

  // 连接数据库
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com',
    port: 23831,
    user: 'root',
    password: '050710Xzl',
    database: 'cooktip'
  });

  console.log('✅ 数据库连接成功\n');

  try {
    // 步骤1：检查当前数据
    console.log('步骤1：检查当前数据...');
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN cover_image LIKE '%796a-yjsp-wxxcx%' THEN 1 ELSE 0 END) as need_update
      FROM recipes
    `);
    
    console.log(`   总记录数: ${stats[0].total}`);
    console.log(`   需要更新: ${stats[0].need_update} 条\n`);

    if (stats[0].need_update === 0) {
      console.log('✅ 所有URL已是最新，无需更新！');
      await connection.end();
      rl.close();
      return;
    }

    // 步骤2：确认操作
    console.log('⚠️  警告：此操作将更新数据库中的图片URL');
    console.log('   建议先确认：');
    console.log('   1. 图片已上传到新COS存储桶');
    console.log('   2. 新COS存储桶权限已设置为"公有读私有写"');
    console.log('   3. 已在浏览器测试新URL可访问\n');

    const confirm1 = await question('   是否继续？(yes/no): ');
    if (confirm1.toLowerCase() !== 'yes') {
      console.log('\n❌ 已取消操作');
      await connection.end();
      rl.close();
      return;
    }

    // 步骤3：备份数据
    console.log('\n步骤2：备份数据...');
    const backupTableName = `recipes_backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
    
    await connection.execute(`DROP TABLE IF EXISTS ${backupTableName}`);
    await connection.execute(`CREATE TABLE ${backupTableName} AS SELECT * FROM recipes`);
    
    const [backupCount] = await connection.execute(`SELECT COUNT(*) as count FROM ${backupTableName}`);
    console.log(`   ✅ 备份完成: ${backupTableName} (${backupCount[0].count} 条记录)\n`);

    // 步骤4：更新URL
    console.log('步骤3：更新图片URL...');
    
    const [updateResult] = await connection.execute(`
      UPDATE recipes 
      SET cover_image = REPLACE(
        cover_image, 
        'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com',
        'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com'
      )
      WHERE cover_image LIKE '%796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com%'
    `);

    console.log(`   ✅ 更新完成: ${updateResult.affectedRows} 条记录\n`);

    // 步骤5：验证结果
    console.log('步骤4：验证更新结果...');
    
    const [afterStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN cover_image LIKE '%796a-yjsp-wxxcx%' THEN 1 ELSE 0 END) as old_domain,
        SUM(CASE WHEN cover_image LIKE '%yjsp-1367462091.cos%' THEN 1 ELSE 0 END) as new_domain
      FROM recipes
      WHERE cover_image IS NOT NULL
    `);

    console.log(`   总记录数: ${afterStats[0].total}`);
    console.log(`   仍使用旧域名: ${afterStats[0].old_domain} 条`);
    console.log(`   使用新域名: ${afterStats[0].new_domain} 条`);

    if (afterStats[0].old_domain === 0) {
      console.log('\n   ✅ 所有URL已成功更新！\n');
    } else {
      console.log(`\n   ⚠️  警告: 仍有 ${afterStats[0].old_domain} 条记录使用旧域名\n`);
    }

    // 显示更新后的示例数据
    console.log('步骤5：查看更新后的示例数据...');
    const [examples] = await connection.execute(
      'SELECT id, title, cover_image FROM recipes WHERE cover_image LIKE "%yjsp-1367462091.cos%" LIMIT 3'
    );

    examples.forEach((recipe, index) => {
      console.log(`\n   ${index + 1}. ${recipe.title}`);
      console.log(`      ${recipe.cover_image}`);
    });

    console.log('\n\n' + '='.repeat(100));
    console.log('✅ 数据库更新完成！');
    console.log('='.repeat(100));
    console.log('\n📝 下一步操作：');
    console.log('   1. 更新云托管环境变量 CDN_BASE_URL');
    console.log('   2. 重启云托管服务');
    console.log('   3. 配置小程序 downloadFile 合法域名');
    console.log('   4. 测试小程序图片加载');
    console.log('\n💾 备份表名: ' + backupTableName);
    console.log('   如需回滚，运行: node scripts/rollback-image-urls.js ' + backupTableName);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await connection.end();
    rl.close();
  }
}

updateImageUrls();

