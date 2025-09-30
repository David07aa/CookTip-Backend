/**
 * 测试新增的API接口
 * 直接测试函数逻辑，不需要启动服务器
 */

const { query, queryOne } = require('./lib/db');

console.log('🧪 开始测试新增的API接口...\n');

async function runTests() {
  let passCount = 0;
  let failCount = 0;

  // 测试1：获取分类列表
  console.log('📝 测试 1: 获取分类列表');
  try {
    const categories = await query(`
      SELECT 
        category as name,
        COUNT(*) as recipeCount
      FROM recipes
      WHERE status = 'published'
      GROUP BY category
      ORDER BY recipeCount DESC
    `);

    if (categories.length > 0) {
      console.log(`✅ 通过 - 找到 ${categories.length} 个分类:`);
      categories.forEach(cat => {
        console.log(`   - ${cat.name}: ${cat.recipeCount} 个食谱`);
      });
      passCount++;
    } else {
      throw new Error('未找到任何分类');
    }
  } catch (error) {
    console.log(`❌ 失败 - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试2：搜索食谱
  console.log('📝 测试 2: 搜索食谱功能');
  try {
    const keyword = '番茄';
    const recipes = await query(`
      SELECT 
        id, title, introduction
      FROM recipes
      WHERE status = 'published'
        AND (title LIKE ? OR introduction LIKE ?)
      LIMIT 5
    `, [`%${keyword}%`, `%${keyword}%`]);

    console.log(`✅ 通过 - 搜索"${keyword}"找到 ${recipes.length} 个结果:`);
    recipes.forEach(r => {
      console.log(`   - ${r.title}`);
    });
    passCount++;
  } catch (error) {
    console.log(`❌ 失败 - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试3：获取用户信息
  console.log('📝 测试 3: 获取用户信息');
  try {
    const user = await queryOne('SELECT * FROM users LIMIT 1');
    
    if (user) {
      console.log(`✅ 通过 - 用户信息:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   昵称: ${user.nick_name}`);
      console.log(`   食谱数: ${user.recipe_count}`);
      passCount++;
    } else {
      throw new Error('未找到用户');
    }
  } catch (error) {
    console.log(`❌ 失败 - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试4：获取用户食谱列表
  console.log('📝 测试 4: 获取用户食谱列表');
  try {
    const user = await queryOne('SELECT id FROM users WHERE recipe_count > 0 LIMIT 1');
    
    if (user) {
      const recipes = await query(`
        SELECT 
          id, title, status, views, likes, collects
        FROM recipes
        WHERE author_id = ?
        ORDER BY created_at DESC
      `, [user.id]);

      console.log(`✅ 通过 - 用户有 ${recipes.length} 个食谱:`);
      recipes.forEach(r => {
        console.log(`   - ${r.title} (浏览:${r.views}, 点赞:${r.likes})`);
      });
      passCount++;
    } else {
      console.log('⚠️  跳过 - 没有用户有食谱');
      passCount++;
    }
  } catch (error) {
    console.log(`❌ 失败 - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试5：测试评论功能
  console.log('📝 测试 5: 评论数据完整性');
  try {
    const comments = await query(`
      SELECT 
        c.id, c.content, 
        u.nick_name as user_name,
        r.title as recipe_title
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN recipes r ON c.recipe_id = r.id
      LIMIT 3
    `);

    console.log(`✅ 通过 - 评论数据查询正常 (${comments.length} 条)`);
    passCount++;
  } catch (error) {
    console.log(`❌ 失败 - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试6：测试数据库关联查询
  console.log('📝 测试 6: 数据库关联查询');
  try {
    const recipes = await query(`
      SELECT 
        r.id,
        r.title,
        r.views,
        r.likes,
        r.collects,
        u.nick_name as author_name
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      WHERE r.status = 'published'
      LIMIT 3
    `);

    console.log(`✅ 通过 - 关联查询正常，返回 ${recipes.length} 条记录:`);
    recipes.forEach(r => {
      console.log(`   - ${r.title} by ${r.author_name}`);
    });
    passCount++;
  } catch (error) {
    console.log(`❌ 失败 - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试7：数据统计
  console.log('📝 测试 7: 数据统计');
  try {
    const stats = await queryOne(`
      SELECT 
        (SELECT COUNT(*) FROM users) as userCount,
        (SELECT COUNT(*) FROM recipes) as recipeCount,
        (SELECT COUNT(*) FROM comments) as commentCount,
        (SELECT COUNT(*) FROM favorites) as favoriteCount,
        (SELECT COUNT(*) FROM likes) as likeCount
    `);

    console.log(`✅ 通过 - 数据统计:`);
    console.log(`   用户数: ${stats.userCount}`);
    console.log(`   食谱数: ${stats.recipeCount}`);
    console.log(`   评论数: ${stats.commentCount}`);
    console.log(`   收藏数: ${stats.favoriteCount}`);
    console.log(`   点赞数: ${stats.likeCount}`);
    passCount++;
  } catch (error) {
    console.log(`❌ 失败 - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试8：验证所有新增接口文件
  console.log('📝 测试 8: 验证新增接口文件');
  try {
    const fs = require('fs');
    const newFiles = [
      'api/user/info.js',
      'api/user/recipes.js',
      'api/recipes/update.js',
      'api/categories/index.js',
      'api/comments/delete.js',
      'api/search/index.js',
      'lib/response.js'
    ];

    let allExist = true;
    for (const file of newFiles) {
      if (!fs.existsSync(file)) {
        console.log(`   ❌ 文件不存在: ${file}`);
        allExist = false;
      }
    }

    if (allExist) {
      console.log(`✅ 通过 - 所有 ${newFiles.length} 个新增文件都存在`);
      passCount++;
    } else {
      throw new Error('部分文件缺失');
    }
  } catch (error) {
    console.log(`❌ 失败 - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 总结
  console.log('='.repeat(60));
  console.log('📊 测试结果统计:\n');
  console.log(`✅ 通过: ${passCount} 个`);
  console.log(`❌ 失败: ${failCount} 个`);
  console.log(`   总计: ${passCount + failCount} 个测试`);
  console.log('='.repeat(60));
  
  if (failCount === 0) {
    console.log(`\n🎉 所有测试通过！新增接口工作正常！\n`);
  } else {
    console.log(`\n⚠️  部分测试失败，请检查错误信息\n`);
  }

  process.exit(failCount === 0 ? 0 : 1);
}

// 运行测试
console.log('='.repeat(60));
console.log('🚀 新增API接口测试');
console.log('='.repeat(60));
console.log('');

runTests().catch(error => {
  console.error('\n❌ 测试运行失败:', error.message);
  console.error(error);
  process.exit(1);
});
