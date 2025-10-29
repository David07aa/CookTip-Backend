/**
 * 修复数据库中的 example.com 示例URL
 * 将所有示例URL替换为实际的CDN URL
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com',
  port: parseInt(process.env.DB_PORT) || 28641,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'CookTip',
};

const CDN_BASE_URL = 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com';
const DEFAULT_AVATAR = `${CDN_BASE_URL}/laoxiangji/userImage/Defaultavatar.png`;

async function fixExampleUrls() {
  let connection;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查受影响的记录数
    console.log('\n📊 检查受影响的记录...');
    
    const [userResults] = await connection.execute(
      `SELECT COUNT(*) as count FROM users WHERE avatar LIKE '%example.com%'`
    );
    console.log(`  - 用户表: ${userResults[0].count} 条记录包含示例URL`);
    
    const [recipeResults] = await connection.execute(
      `SELECT COUNT(*) as count FROM recipes WHERE cover_image LIKE '%example.com%' OR steps LIKE '%example.com%'`
    );
    console.log(`  - 食谱表: ${recipeResults[0].count} 条记录包含示例URL`);
    
    const [categoryResults] = await connection.execute(
      `SELECT COUNT(*) as count FROM categories WHERE icon LIKE '%example.com%'`
    );
    console.log(`  - 分类表: ${categoryResults[0].count} 条记录包含示例URL`);
    
    // 2. 更新用户头像
    console.log('\n🔧 更新用户头像...');
    const [userUpdate] = await connection.execute(
      `UPDATE users SET avatar = ? WHERE avatar LIKE '%example.com%'`,
      [DEFAULT_AVATAR]
    );
    console.log(`  ✅ 已更新 ${userUpdate.affectedRows} 个用户头像`);
    
    // 3. 更新食谱封面
    console.log('\n🔧 更新食谱封面...');
    
    // 红烧肉
    await connection.execute(
      `UPDATE recipes 
       SET cover_image = ? 
       WHERE cover_image LIKE '%example.com%' AND title LIKE '%红烧肉%'`,
      ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800']
    );
    
    // 西红柿炒蛋
    await connection.execute(
      `UPDATE recipes 
       SET cover_image = ? 
       WHERE cover_image LIKE '%example.com%' AND title LIKE '%西红柿炒蛋%'`,
      ['https://images.unsplash.com/photo-1603073545352-f53f2070e40e?w=800']
    );
    
    // 戚风蛋糕
    await connection.execute(
      `UPDATE recipes 
       SET cover_image = ? 
       WHERE cover_image LIKE '%example.com%' AND title LIKE '%戚风蛋糕%'`,
      ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800']
    );
    
    // 其他食谱使用默认封面
    const [recipeCoverUpdate] = await connection.execute(
      `UPDATE recipes 
       SET cover_image = ? 
       WHERE cover_image LIKE '%example.com%'`,
      ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800']
    );
    console.log(`  ✅ 已更新 ${recipeCoverUpdate.affectedRows} 个食谱封面`);
    
    // 4. 更新食谱步骤图片（清空 example.com 的URL）
    console.log('\n🔧 更新食谱步骤图片...');
    const [recipes] = await connection.execute(
      `SELECT id, steps FROM recipes WHERE steps LIKE '%example.com%'`
    );
    
    let stepsUpdateCount = 0;
    for (const recipe of recipes) {
      try {
        const steps = JSON.parse(recipe.steps);
        const updatedSteps = steps.map(step => ({
          ...step,
          image: step.image && step.image.includes('example.com') ? '' : step.image
        }));
        
        await connection.execute(
          `UPDATE recipes SET steps = ? WHERE id = ?`,
          [JSON.stringify(updatedSteps), recipe.id]
        );
        stepsUpdateCount++;
      } catch (error) {
        console.error(`  ⚠️ 更新食谱 ${recipe.id} 的步骤图片失败:`, error.message);
      }
    }
    console.log(`  ✅ 已更新 ${stepsUpdateCount} 个食谱的步骤图片`);
    
    // 5. 更新分类图标
    console.log('\n🔧 更新分类图标...');
    const [categories] = await connection.execute(
      `SELECT id, name FROM categories WHERE icon LIKE '%example.com%'`
    );
    
    for (const category of categories) {
      const iconPath = `/images/category/${category.name.toLowerCase()}.png`;
      await connection.execute(
        `UPDATE categories SET icon = ? WHERE id = ?`,
        [iconPath, category.id]
      );
    }
    console.log(`  ✅ 已更新 ${categories.length} 个分类图标`);
    
    // 6. 验证更新结果
    console.log('\n📊 验证更新结果...');
    
    const [verifyUsers] = await connection.execute(
      `SELECT COUNT(*) as count FROM users WHERE avatar LIKE '%example.com%'`
    );
    console.log(`  - 用户表剩余示例URL: ${verifyUsers[0].count}`);
    
    const [verifyRecipes] = await connection.execute(
      `SELECT COUNT(*) as count FROM recipes WHERE cover_image LIKE '%example.com%' OR steps LIKE '%example.com%'`
    );
    console.log(`  - 食谱表剩余示例URL: ${verifyRecipes[0].count}`);
    
    const [verifyCategories] = await connection.execute(
      `SELECT COUNT(*) as count FROM categories WHERE icon LIKE '%example.com%'`
    );
    console.log(`  - 分类表剩余示例URL: ${verifyCategories[0].count}`);
    
    const totalRemaining = verifyUsers[0].count + verifyRecipes[0].count + verifyCategories[0].count;
    
    if (totalRemaining === 0) {
      console.log('\n✅ 所有示例URL已成功替换！');
    } else {
      console.log(`\n⚠️ 仍有 ${totalRemaining} 条记录包含示例URL，需要手动检查`);
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
fixExampleUrls();

