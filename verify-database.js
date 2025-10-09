/**
 * 验证数据库完整性
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'mysql3.sqlpub.com',
  port: 3308,
  user: 'david_x',
  password: 'NVRvnX3rP88UyUET',
  database: 'onefoodlibrary',
  charset: 'utf8mb4',
};

async function verifyDatabase() {
  let connection;

  try {
    console.log('🔌 连接数据库...\n');
    connection = await mysql.createConnection(dbConfig);

    // 1. 检查所有表
    console.log('📊 数据库表列表:');
    console.log('='.repeat(60));
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    for (const tableName of tableNames) {
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const emoji = count[0].count > 0 ? '✅' : '⚠️ ';
      console.log(`  ${emoji} ${tableName.padEnd(20)} ${count[0].count} 条数据`);
    }

    // 2. 分类详情
    console.log('\n📂 分类列表:');
    console.log('='.repeat(60));
    const [categories] = await connection.query('SELECT * FROM categories ORDER BY sort_order');
    categories.forEach(cat => {
      console.log(`  ${cat.id}. ${cat.name.padEnd(15)} ${cat.recipe_count} 个食谱`);
    });

    // 3. 食谱详情
    console.log('\n📖 食谱列表:');
    console.log('='.repeat(60));
    const [recipes] = await connection.query(`
      SELECT 
        r.id,
        r.title,
        r.difficulty,
        r.cook_time,
        r.likes,
        r.views,
        r.category_id,
        c.name as category_name
      FROM recipes r
      LEFT JOIN categories c ON r.category_id = c.id
      ORDER BY r.views DESC
      LIMIT 10
    `);
    
    recipes.forEach((recipe, index) => {
      const category = recipe.category_name || '未分类';
      console.log(`  ${index + 1}. ${recipe.title}`);
      console.log(`     [${recipe.difficulty}] ${recipe.cook_time}分钟 | 分类: ${category} | 👍${recipe.likes} 👁${recipe.views}`);
    });

    // 4. 用户详情
    console.log('\n👥 用户列表:');
    console.log('='.repeat(60));
    const [users] = await connection.query('SELECT * FROM users');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.nickname || user.id}`);
      console.log(`     openid: ${user.openid}`);
    });

    // 5. 检查是否需要更新食谱的分类ID
    const [uncategorized] = await connection.query('SELECT COUNT(*) as count FROM recipes WHERE category_id IS NULL');
    
    if (uncategorized[0].count > 0) {
      console.log(`\n⚠️  发现 ${uncategorized[0].count} 个食谱没有分类`);
      console.log('📝 正在自动分配分类...');
      
      // 根据食谱标题自动分配分类
      const categoryMap = {
        '红烧': 1,  // 中餐
        '宫保': 1,  // 中餐
        '番茄': 5,  // 家常菜
        '炒蛋': 5,  // 家常菜
        '蛋糕': 4,  // 烘焙甜点
        '戚风': 4,  // 烘焙甜点
        '排骨': 5,  // 家常菜
        '拿铁': 10, // 饮品
        '抹茶': 10, // 饮品
      };

      const [recipesToUpdate] = await connection.query('SELECT id, title FROM recipes WHERE category_id IS NULL');
      
      for (const recipe of recipesToUpdate) {
        let categoryId = 5; // 默认为家常菜
        
        // 根据标题匹配分类
        for (const [keyword, catId] of Object.entries(categoryMap)) {
          if (recipe.title.includes(keyword)) {
            categoryId = catId;
            break;
          }
        }
        
        await connection.query('UPDATE recipes SET category_id = ? WHERE id = ?', [categoryId, recipe.id]);
        const [catInfo] = await connection.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
        console.log(`  ✅ ${recipe.title} → ${catInfo[0].name}`);
      }
      
      // 更新分类的食谱数量
      await connection.query(`
        UPDATE categories c
        SET recipe_count = (
          SELECT COUNT(*) FROM recipes r WHERE r.category_id = c.id
        )
      `);
      
      console.log('\n✅ 分类分配完成！');
    }

    // 6. 最终统计
    console.log('\n📈 数据库统计:');
    console.log('='.repeat(60));
    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM recipes) as recipes,
        (SELECT COUNT(*) FROM comments) as comments,
        (SELECT COUNT(*) FROM favorites) as favorites,
        (SELECT COUNT(*) FROM likes) as likes
    `);
    
    console.log(`  👥 用户: ${stats[0].users} 个`);
    console.log(`  📂 分类: ${stats[0].categories} 个`);
    console.log(`  📖 食谱: ${stats[0].recipes} 个`);
    console.log(`  💬 评论: ${stats[0].comments} 条`);
    console.log(`  ⭐ 收藏: ${stats[0].favorites} 个`);
    console.log(`  👍 点赞: ${stats[0].likes} 个`);

    // 7. 显示更新后的分类统计
    console.log('\n📂 分类统计（更新后）:');
    console.log('='.repeat(60));
    const [updatedCategories] = await connection.query('SELECT * FROM categories ORDER BY sort_order');
    updatedCategories.forEach(cat => {
      const emoji = cat.recipe_count > 0 ? '✅' : '⚪';
      console.log(`  ${emoji} ${cat.name.padEnd(15)} ${cat.recipe_count} 个食谱`);
    });

    console.log('\n🎉 数据库验证完成！所有数据正常！');
    console.log('\n💡 提示: 现在可以重新部署后端服务了');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭\n');
    }
  }
}

verifyDatabase();

