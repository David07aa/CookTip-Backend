/**
 * 插入初始数据
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

async function insertData() {
  let connection;

  try {
    console.log('🔌 连接数据库...\n');
    connection = await mysql.createConnection(dbConfig);

    // 1. 插入分类
    console.log('📂 插入分类数据...');
    console.log('='.repeat(60));
    
    const categories = [
      { name: '中餐', icon: 'https://example.com/icons/chinese.png', description: '传统中式美食', sort_order: 1 },
      { name: '西餐', icon: 'https://example.com/icons/western.png', description: '西式料理', sort_order: 2 },
      { name: '日韩料理', icon: 'https://example.com/icons/asian.png', description: '日本和韩国料理', sort_order: 3 },
      { name: '烘焙甜点', icon: 'https://example.com/icons/dessert.png', description: '蛋糕、面包、甜品', sort_order: 4 },
      { name: '家常菜', icon: 'https://example.com/icons/home.png', description: '简单易做的家常菜', sort_order: 5 },
      { name: '快手菜', icon: 'https://example.com/icons/fast.png', description: '30分钟内完成', sort_order: 6 },
      { name: '素食', icon: 'https://example.com/icons/vegetarian.png', description: '素食料理', sort_order: 7 },
      { name: '汤羹', icon: 'https://example.com/icons/soup.png', description: '各式汤品', sort_order: 8 },
      { name: '小吃', icon: 'https://example.com/icons/snack.png', description: '特色小吃', sort_order: 9 },
      { name: '饮品', icon: 'https://example.com/icons/drink.png', description: '饮料和茶饮', sort_order: 10 },
    ];

    for (const cat of categories) {
      try {
        await connection.query(
          'INSERT INTO categories (name, icon, description, sort_order) VALUES (?, ?, ?, ?)',
          [cat.name, cat.icon, cat.description, cat.sort_order]
        );
        console.log(`  ✅ ${cat.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`  ⚠️  ${cat.name} (已存在)`);
        } else {
          console.log(`  ❌ ${cat.name} (${err.message})`);
        }
      }
    }

    // 2. 插入测试食谱
    console.log('\n📖 插入测试食谱...');
    console.log('='.repeat(60));

    const recipes = [
      {
        user_id: 1,
        category_id: 1,
        title: '红烧肉',
        cover_image: 'https://example.com/recipes/hongshaorou.jpg',
        description: '经典家常菜，肥而不腻，入口即化',
        difficulty: '简单',
        cook_time: 90,
        servings: 4,
        taste: '咸鲜',
        ingredients: JSON.stringify([
          {name: '五花肉', amount: '500克'},
          {name: '冰糖', amount: '30克'},
          {name: '料酒', amount: '2勺'},
          {name: '生抽', amount: '3勺'},
          {name: '老抽', amount: '1勺'}
        ]),
        steps: JSON.stringify([
          {step: 1, description: '五花肉切块，冷水下锅焯水', image: '', tips: '焯水时加入料酒和姜片去腥'},
          {step: 2, description: '锅中放油，加入冰糖炒糖色', image: '', tips: '小火慢炒，糖色变焦糖色即可'}
        ]),
        tips: '炖煮时保持小火，时间越长越入味',
        tags: JSON.stringify(['中餐', '家常菜', '下饭菜']),
        status: 'published'
      },
      {
        user_id: 1,
        category_id: 5,
        title: '西红柿炒蛋',
        cover_image: 'https://example.com/recipes/xihongshi.jpg',
        description: '简单快手，营养美味',
        difficulty: '超简单',
        cook_time: 15,
        servings: 2,
        taste: '酸甜',
        ingredients: JSON.stringify([
          {name: '西红柿', amount: '2个'},
          {name: '鸡蛋', amount: '3个'},
          {name: '白糖', amount: '少许'},
          {name: '盐', amount: '适量'}
        ]),
        steps: JSON.stringify([
          {step: 1, description: '鸡蛋打散，西红柿切块', image: ''},
          {step: 2, description: '先炒鸡蛋，盛出备用', image: ''},
          {step: 3, description: '炒西红柿，加入鸡蛋翻炒', image: ''}
        ]),
        tips: '加少许白糖提味',
        tags: JSON.stringify(['家常菜', '快手菜']),
        status: 'published'
      },
      {
        user_id: 2,
        category_id: 4,
        title: '戚风蛋糕',
        cover_image: 'https://example.com/recipes/cake.jpg',
        description: '松软细腻的完美蛋糕',
        difficulty: '中等',
        cook_time: 60,
        servings: 8,
        taste: '香甜',
        ingredients: JSON.stringify([
          {name: '低筋面粉', amount: '85克'},
          {name: '鸡蛋', amount: '5个'},
          {name: '牛奶', amount: '40克'},
          {name: '玉米油', amount: '40克'},
          {name: '白糖', amount: '70克'}
        ]),
        steps: JSON.stringify([
          {step: 1, description: '分离蛋黄和蛋白', image: ''},
          {step: 2, description: '蛋黄加油奶搅拌均匀', image: ''},
          {step: 3, description: '蛋白打发至硬性发泡', image: ''},
          {step: 4, description: '混合后倒入模具，烤箱160度50分钟', image: ''}
        ]),
        tips: '蛋白一定要打发到位，倒扣晾凉',
        tags: JSON.stringify(['烘焙甜点']),
        status: 'published'
      }
    ];

    for (const recipe of recipes) {
      try {
        await connection.query(
          `INSERT INTO recipes (
            user_id, category_id, title, cover_image, description,
            difficulty, cook_time, servings, taste, ingredients, steps,
            tips, tags, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            recipe.user_id, recipe.category_id, recipe.title, recipe.cover_image,
            recipe.description, recipe.difficulty, recipe.cook_time, recipe.servings,
            recipe.taste, recipe.ingredients, recipe.steps, recipe.tips,
            recipe.tags, recipe.status
          ]
        );
        console.log(`  ✅ ${recipe.title}`);
      } catch (err) {
        console.log(`  ❌ ${recipe.title} (${err.message})`);
      }
    }

    // 3. 更新分类的食谱数量
    console.log('\n📊 更新分类统计...');
    await connection.query(`
      UPDATE categories c
      SET recipe_count = (
        SELECT COUNT(*) FROM recipes r WHERE r.category_id = c.id
      )
    `);
    console.log('  ✅ 完成');

    // 4. 验证
    console.log('\n🔍 验证结果...');
    console.log('='.repeat(60));
    
    const [catCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
    const [recipeCount] = await connection.query('SELECT COUNT(*) as count FROM recipes');
    
    console.log(`\n  ✅ 分类: ${catCount[0].count} 个`);
    console.log(`  ✅ 食谱: ${recipeCount[0].count} 个`);

    // 显示分类统计
    console.log('\n📂 分类统计:');
    const [cats] = await connection.query('SELECT id, name, recipe_count FROM categories ORDER BY sort_order');
    cats.forEach(cat => {
      const emoji = cat.recipe_count > 0 ? '✅' : '⚪';
      console.log(`  ${emoji} ${cat.name.padEnd(15)} ${cat.recipe_count} 个食谱`);
    });

    // 显示食谱
    console.log('\n📖 食谱列表:');
    const [recipes_list] = await connection.query(`
      SELECT r.id, r.title, r.difficulty, r.cook_time, c.name as category
      FROM recipes r
      LEFT JOIN categories c ON r.category_id = c.id
    `);
    recipes_list.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title} [${r.difficulty}] ${r.cook_time}分钟 - ${r.category}`);
    });

    console.log('\n🎉 数据插入完成！\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭\n');
    }
  }
}

insertData();

