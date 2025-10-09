const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

console.log('🚀 开始导入老乡鸡食谱到数据库...\n');

// 读取提取的食谱数据
const recipesData = JSON.parse(fs.readFileSync('laoxiangji-recipes-data.json', 'utf8'));

// 分类映射（老乡鸡 -> 数据库分类ID）
const categoryMapping = {
  '主食': 1,
  '凉拌': 2,
  '卤菜': 3,
  '早餐': 4,
  '汤': 5,
  '炒菜': 6,
  '炖菜': 7,
  '炸品': 8,
  '烤类': 9,
  '烫菜': 10,
  '煮锅': 11,
  '蒸菜': 12,
  '砂锅菜': 13,
  '配料': 14,
  '饮品': 15
};

// 难度映射（根据步骤数量和配料数量判断）
function getDifficulty(ingredients, steps) {
  const ingredientCount = ingredients?.length || 0;
  const stepCount = steps?.length || 0;
  const totalComplexity = ingredientCount + stepCount * 2;
  
  if (totalComplexity <= 5) return '简单';
  if (totalComplexity <= 15) return '中等';
  return '困难';
}

// 估算烹饪时间（根据步骤内容）
function estimateCookTime(steps) {
  if (!steps || steps.length === 0) return 30;
  
  const stepsText = steps.join(' ').toLowerCase();
  
  // 查找时间相关的关键词
  const timeMatches = stepsText.match(/(\d+)\s*(分钟|秒|小时|min|分)/g);
  if (timeMatches && timeMatches.length > 0) {
    let totalMinutes = 0;
    timeMatches.forEach(match => {
      const num = parseInt(match);
      if (match.includes('小时')) {
        totalMinutes += num * 60;
      } else if (match.includes('秒')) {
        totalMinutes += Math.ceil(num / 60);
      } else {
        totalMinutes += num;
      }
    });
    return Math.min(Math.max(totalMinutes, 10), 180); // 限制在10-180分钟
  }
  
  // 根据步骤数估算
  return Math.min(steps.length * 8 + 15, 90);
}

// 格式化配料为 JSON
function formatIngredients(ingredients) {
  if (!ingredients || ingredients.length === 0) return [];
  
  return ingredients.map(ing => {
    // 尝试提取食材名称和用量
    const match = ing.match(/^(.+?)(?:\s*[（(](.+?)[）)])?(?:\s*[:：]?\s*(.+))?$/);
    if (match) {
      return {
        name: match[1].trim(),
        amount: match[2] || match[3] || '适量'
      };
    }
    return {
      name: ing,
      amount: '适量'
    };
  });
}

// 格式化步骤为 JSON
function formatSteps(steps) {
  if (!steps || steps.length === 0) return [];
  
  return steps.map((step, index) => {
    // 移除步骤编号（如果有）
    let description = step.replace(/^\d+[\.\、]\s*/, '').trim();
    
    return {
      step: index + 1,
      description,
      image: ''
    };
  });
}

// 生成默认图片URL（使用 Unsplash 占位图）
function getImageUrl(imagePath, title) {
  if (!imagePath) {
    // 使用食物相关的占位图
    return `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80`;
  }
  
  // 将本地图片路径转换为相对路径
  // 在实际部署时，需要将 images 文件夹上传到静态资源服务器
  return `/images/laoxiangji/${imagePath}`;
}

async function migrateData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    console.log('📊 1. 备份现有数据...');
    
    // 导出现有食谱到备份文件
    const [oldRecipes] = await connection.query('SELECT * FROM recipes');
    fs.writeFileSync(
      `backup-recipes-${Date.now()}.json`,
      JSON.stringify(oldRecipes, null, 2)
    );
    console.log(`   ✅ 已备份 ${oldRecipes.length} 个旧食谱`);

    // 开始事务
    await connection.beginTransaction();

    console.log('\n🗑️  2. 清空现有数据...');
    
    // 清空关联表
    await connection.query('DELETE FROM comments');
    console.log('   ✅ 清空 comments 表');
    
    await connection.query('DELETE FROM favorites');
    console.log('   ✅ 清空 favorites 表');
    
    await connection.query('DELETE FROM likes');
    console.log('   ✅ 清空 likes 表');
    
    await connection.query('DELETE FROM shopping_list');
    console.log('   ✅ 清空 shopping_list 表');
    
    // 清空食谱表
    await connection.query('DELETE FROM recipes');
    console.log('   ✅ 清空 recipes 表');
    
    // 重置自增ID
    await connection.query('ALTER TABLE recipes AUTO_INCREMENT = 1');

    console.log('\n📁 3. 更新分类表...');
    
    // 清空现有分类
    await connection.query('DELETE FROM categories');
    await connection.query('ALTER TABLE categories AUTO_INCREMENT = 1');
    
    // 插入老乡鸡的分类
    const categories = [
      { id: 1, name: '主食', icon: 'https://example.com/icons/staple.png', sort_order: 1 },
      { id: 2, name: '凉拌', icon: 'https://example.com/icons/cold-dish.png', sort_order: 2 },
      { id: 3, name: '卤菜', icon: 'https://example.com/icons/braised.png', sort_order: 3 },
      { id: 4, name: '早餐', icon: 'https://example.com/icons/breakfast.png', sort_order: 4 },
      { id: 5, name: '汤', icon: 'https://example.com/icons/soup.png', sort_order: 5 },
      { id: 6, name: '炒菜', icon: 'https://example.com/icons/stir-fry.png', sort_order: 6 },
      { id: 7, name: '炖菜', icon: 'https://example.com/icons/stew.png', sort_order: 7 },
      { id: 8, name: '炸品', icon: 'https://example.com/icons/fried.png', sort_order: 8 },
      { id: 9, name: '烤类', icon: 'https://example.com/icons/roasted.png', sort_order: 9 },
      { id: 10, name: '烫菜', icon: 'https://example.com/icons/blanched.png', sort_order: 10 },
      { id: 11, name: '煮锅', icon: 'https://example.com/icons/boiled.png', sort_order: 11 },
      { id: 12, name: '蒸菜', icon: 'https://example.com/icons/steamed.png', sort_order: 12 },
      { id: 13, name: '砂锅菜', icon: 'https://example.com/icons/casserole.png', sort_order: 13 },
      { id: 14, name: '配料', icon: 'https://example.com/icons/condiment.png', sort_order: 14 },
      { id: 15, name: '饮品', icon: 'https://example.com/icons/drink.png', sort_order: 15 }
    ];
    
    for (const cat of categories) {
      await connection.query(
        'INSERT INTO categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)',
        [cat.id, cat.name, cat.icon, cat.sort_order]
      );
    }
    console.log(`   ✅ 插入 ${categories.length} 个分类`);

    console.log('\n📝 4. 导入老乡鸡食谱...');
    
    // 创建默认用户（老乡鸡官方）
    let userId = 1;
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE id = 1');
    if (existingUsers.length === 0) {
      await connection.query(
        `INSERT INTO users (id, openid, nickname, avatar, created_at) 
         VALUES (1, 'laoxiangji_official', '老乡鸡官方', 'https://example.com/logo.png', NOW())`
      );
      console.log('   ✅ 创建老乡鸡官方账号');
    }
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const recipe of recipesData.recipes) {
      try {
        const categoryId = categoryMapping[recipe.category];
        if (!categoryId) {
          console.log(`   ⚠️  跳过（分类不存在）: ${recipe.title}`);
          skippedCount++;
          continue;
        }
        
        const ingredients = formatIngredients(recipe.ingredients);
        const steps = formatSteps(recipe.steps);
        const difficulty = getDifficulty(recipe.ingredients, recipe.steps);
        const cookTime = estimateCookTime(recipe.steps);
        const coverImage = getImageUrl(recipe.imagePath, recipe.title);
        
        // 提取标签（从分类和配料中）
        const tags = [recipe.category];
        
        // 默认营养成分
        const nutrition = {
          calories: '300kcal',
          protein: '15g',
          fat: '10g',
          carbs: '40g'
        };
        
        await connection.query(
          `INSERT INTO recipes (
            user_id, category_id, title, cover_image, description,
            difficulty, cook_time, servings, taste,
            ingredients, steps, tips, tags, nutrition,
            likes, favorites, comments, views, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            userId,
            categoryId,
            recipe.title,
            coverImage,
            `${recipe.category}美食 - ${recipe.title}`,
            difficulty,
            cookTime,
            4, // 默认4人份
            '', // 口味留空
            JSON.stringify(ingredients),
            JSON.stringify(steps),
            '', // 小贴士留空
            JSON.stringify(tags),
            JSON.stringify(nutrition),
            0, // likes
            0, // favorites
            0, // comments
            0, // views
            'published'
          ]
        );
        
        insertedCount++;
        
        if (insertedCount % 20 === 0) {
          console.log(`   已导入 ${insertedCount}/${recipesData.recipes.length} 个食谱...`);
        }
        
      } catch (error) {
        console.error(`   ❌ 插入失败: ${recipe.title}`, error.message);
        skippedCount++;
      }
    }
    
    // 提交事务
    await connection.commit();
    
    console.log(`\n✅ 导入完成！`);
    console.log(`   成功: ${insertedCount} 个`);
    console.log(`   跳过: ${skippedCount} 个`);
    
    // 验证数据
    console.log('\n🔍 5. 验证数据...');
    const [finalRecipes] = await connection.query('SELECT COUNT(*) as count FROM recipes');
    const [finalCategories] = await connection.query('SELECT categories.id, categories.name, COUNT(recipes.id) as recipe_count FROM categories LEFT JOIN recipes ON categories.id = recipes.category_id GROUP BY categories.id ORDER BY categories.id');
    
    console.log(`   数据库中的食谱总数: ${finalRecipes[0].count}`);
    console.log('\n   各分类食谱数量:');
    finalCategories.forEach(cat => {
      console.log(`      ${cat.name.padEnd(10)}: ${cat.recipe_count} 个`);
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('\n❌ 导入失败，已回滚:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrateData()
  .then(() => {
    console.log('\n🎉 老乡鸡食谱导入成功！');
  })
  .catch(error => {
    console.error('\n💥 导入过程出错:', error);
    process.exit(1);
  });

