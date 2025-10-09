/**
 * 更新数据库中的图片URL到对象存储
 * 
 * 对象存储信息：
 * - 存储桶：796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091
 * - 地域：ap-shanghai
 * - 基础URL：https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com
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

    // 获取所有需要更新的食谱
    console.log('🔍 查询需要更新的食谱...\n');
    const [recipes] = await connection.execute(`
      SELECT id, title, cover_image 
      FROM recipes 
      WHERE cover_image LIKE '%/uploads/images/laoxiangji/%' 
         OR cover_image LIKE '%/images/laoxiangji/%'
         OR cover_image LIKE 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/%'
    `);

    if (recipes.length === 0) {
      console.log('✅ 没有找到需要更新的记录');
      await connection.end();
      return;
    }

    console.log(`📊 找到 ${recipes.length} 条需要更新的记录\n`);

    // 更新每条记录
    let successCount = 0;
    let errorCount = 0;

    for (const recipe of recipes) {
      try {
        // 提取文件名
        // /uploads/images/laoxiangji/大排面.png → 大排面.png
        // /images/laoxiangji/大排面.png → 大排面.png
        // https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/大排面.png → 大排面.png
        const filename = recipe.cover_image.split('/').pop();
        
        // 生成新的URL
        const newUrl = `${STORAGE_BASE_URL}/laoxiangji/${filename}`;
        
        // 更新数据库
        await connection.execute(
          'UPDATE recipes SET cover_image = ? WHERE id = ?',
          [newUrl, recipe.id]
        );
        
        console.log(`✅ [${recipe.id}] ${recipe.title}`);
        console.log(`   旧: ${recipe.cover_image}`);
        console.log(`   新: ${newUrl}\n`);
        
        successCount++;
      } catch (error) {
        console.error(`❌ [${recipe.id}] ${recipe.title} - 更新失败:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 更新统计：');
    console.log(`   ✅ 成功：${successCount} 条`);
    console.log(`   ❌ 失败：${errorCount} 条`);
    console.log(`   📝 总计：${recipes.length} 条`);
    console.log('='.repeat(60) + '\n');

    // 验证更新结果
    console.log('🔍 验证更新结果...\n');
    const [updated] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM recipes 
      WHERE cover_image LIKE 'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com%'
    `);

    console.log(`✅ 当前使用对象存储的食谱数量：${updated[0].count}\n`);

    // 显示示例URL
    const [samples] = await connection.execute(`
      SELECT id, title, cover_image 
      FROM recipes 
      WHERE cover_image LIKE 'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage%' 
      LIMIT 5
    `);

    if (samples.length > 0) {
      console.log('📋 示例URL（前5条）：\n');
      samples.forEach((r, index) => {
        console.log(`${index + 1}. ${r.title}`);
        console.log(`   ${r.cover_image}\n`);
      });
    }

    console.log('✅ 数据库更新完成！\n');
    console.log('📌 下一步：');
    console.log('   1. 在浏览器中测试示例URL是否能访问');
    console.log('   2. 在小程序中配置域名白名单');
    console.log('   3. 运行验证脚本：node verify-storage-urls.js');
    console.log('   4. 更新 Dockerfile 移除 uploads 目录\n');

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
console.log('🚀 开始更新数据库中的图片URL...\n');
updateDatabase().catch(error => {
  console.error('💥 程序执行失败:', error);
  process.exit(1);
});

