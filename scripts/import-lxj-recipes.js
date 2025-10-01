/**
 * 导入老乡鸡菜谱数据到 PostgreSQL 数据库
 * 从本地 CookLikeHOC 文件夹读取 markdown 文件
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

// 分类映射（中文到系统分类）
const categoryMap = {
  '炒菜': '炒菜',
  '主食': '主食',
  '汤': '汤羹',
  '凉拌': '凉菜',
  '卤菜': '卤味',
  '早餐': '早餐',
  '炖菜': '炖菜',
  '炸品': '炸物',
  '烤类': '烤菜',
  '烫菜': '烫菜',
  '煮锅': '煮锅',
  '蒸菜': '蒸菜',
  '砂锅菜': '砂锅',
  '饮品': '饮品',
  '配料': '配料'
};

// 难度映射（根据步骤数量和复杂度）
function getDifficulty(steps) {
  if (steps.length <= 2) return '简单';
  if (steps.length <= 4) return '中等';
  return '较难';
}

// 估算烹饪时间（根据步骤内容）
function estimateCookTime(steps, title) {
  if (title.includes('面') || title.includes('饭') || title.includes('粥')) {
    return Math.max(15, steps.length * 10);
  }
  if (title.includes('汤') || title.includes('炖')) {
    return Math.max(60, steps.length * 20);
  }
  return Math.max(20, steps.length * 8);
}

// 解析 Markdown 文件
function parseRecipeMarkdown(content, filename, category) {
  const lines = content.split('\n').filter(line => line.trim());
  
  // 提取标题
  const title = lines[0].replace(/^#\s+/, '').trim();
  
  // 查找图片
  let coverImage = '';
  const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (imageMatch) {
    // 使用 Unsplash 随机图片作为封面
    coverImage = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop`;
  } else {
    coverImage = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=600&fit=crop`;
  }
  
  // 提取原料/配料
  const ingredients = [];
  let inIngredients = false;
  let inSteps = false;
  const rawIngredients = [];
  const steps = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测原料/配料部分
    if (line.match(/^##\s*(原料|配料)/)) {
      inIngredients = true;
      inSteps = false;
      continue;
    }
    
    // 检测步骤部分
    if (line.match(/^##\s*步骤/)) {
      inSteps = true;
      inIngredients = false;
      continue;
    }
    
    // 收集原料
    if (inIngredients && line.startsWith('-')) {
      const ingredient = line.replace(/^-\s*/, '').trim();
      if (ingredient && !ingredient.includes('：')) {
        rawIngredients.push(ingredient);
      }
    }
    
    // 收集步骤
    if (inSteps && line.match(/^-\s*\d+\./)) {
      const stepText = line.replace(/^-\s*\d+\.\s*/, '').trim();
      if (stepText) {
        steps.push(stepText);
      }
    }
  }
  
  // 格式化原料为标准格式
  rawIngredients.forEach((item, index) => {
    // 尝试解析原料和用量
    const parts = item.split(/\s+/);
    if (parts.length >= 1) {
      ingredients.push({
        name: parts[0],
        amount: parts.length > 1 ? parts.slice(1).join(' ') : '适量',
        note: ''
      });
    }
  });
  
  // 如果没有提取到原料，添加默认的
  if (ingredients.length === 0) {
    ingredients.push({ name: '请参考图片', amount: '适量', note: '' });
  }
  
  // 格式化步骤
  const formattedSteps = steps.map((step, index) => ({
    order: index + 1,
    description: step,
    image: '',
    duration: Math.ceil(step.length / 10) // 根据步骤长度估算时间
  }));
  
  // 如果没有提取到步骤，添加默认步骤
  if (formattedSteps.length === 0) {
    formattedSteps.push({
      order: 1,
      description: '请参考菜品原料进行制作',
      image: '',
      duration: 30
    });
  }
  
  // 生成简介
  const introduction = `经典${categoryMap[category] || category}菜品，来自老乡鸡菜品溯源报告。${ingredients.length > 0 ? `主要食材包括${ingredients.slice(0, 3).map(i => i.name).join('、')}等。` : ''}`;
  
  return {
    title,
    introduction,
    coverImage,
    category: categoryMap[category] || category,
    difficulty: getDifficulty(formattedSteps),
    cookTime: estimateCookTime(formattedSteps, title),
    servings: 2,
    ingredients,
    steps: formattedSteps,
    tags: [category, '家常菜', '老乡鸡'],
    tips: '本菜谱来自老乡鸡菜品溯源报告，可根据个人口味调整用量。'
  };
}

// 主导入函数
async function importRecipes() {
  console.log('🚀 开始导入老乡鸡菜谱...\n');
  
  const basePath = path.join(__dirname, '..', 'LXJGithub', 'CookLikeHOC-main', 'CookLikeHOC-main');
  
  try {
    // 1. 清空现有食谱数据
    console.log('🗑️  清空现有食谱数据...');
    await sql`DELETE FROM comments`;
    await sql`DELETE FROM favorites`;
    await sql`DELETE FROM likes`;
    await sql`DELETE FROM recipes`;
    console.log('✅ 现有数据已清空\n');
    
    // 2. 获取或创建默认用户（老乡鸡官方）
    console.log('👤 准备用户账号...');
    let userId;
    const userResult = await sql`
      SELECT id FROM users WHERE nick_name = '老乡鸡官方'
    `;
    
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      const newUser = await sql`
        INSERT INTO users (openid, nick_name, avatar, bio)
        VALUES (
          'lxj_official',
          '老乡鸡官方',
          'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200',
          '老乡鸡官方菜谱，传承经典美食'
        )
        RETURNING id
      `;
      userId = newUser.rows[0].id;
    }
    console.log(`✅ 用户ID: ${userId}\n`);
    
    // 3. 遍历所有分类文件夹
    const categories = Object.keys(categoryMap);
    let totalRecipes = 0;
    let successCount = 0;
    let failCount = 0;
    
    for (const category of categories) {
      const categoryPath = path.join(basePath, category);
      
      // 检查文件夹是否存在
      if (!fs.existsSync(categoryPath)) {
        console.log(`⚠️  跳过不存在的分类: ${category}`);
        continue;
      }
      
      console.log(`📁 处理分类: ${category}`);
      
      // 读取分类下的所有 .md 文件（排除 README.md）
      const files = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.md') && file !== 'README.md');
      
      console.log(`   找到 ${files.length} 个菜谱文件`);
      
      for (const file of files) {
        totalRecipes++;
        const filePath = path.join(categoryPath, file);
        
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const recipe = parseRecipeMarkdown(content, file, category);
          
          // 插入到数据库
          await sql`
            INSERT INTO recipes (
              author_id,
              title,
              cover_image,
              introduction,
              category,
              difficulty,
              cook_time,
              servings,
              ingredients,
              steps,
              tags,
              tips,
              status
            ) VALUES (
              ${userId}::uuid,
              ${recipe.title},
              ${recipe.coverImage},
              ${recipe.introduction},
              ${recipe.category},
              ${recipe.difficulty},
              ${recipe.cookTime},
              ${recipe.servings},
              ${JSON.stringify(recipe.ingredients)}::jsonb,
              ${JSON.stringify(recipe.steps)}::jsonb,
              ${JSON.stringify(recipe.tags)}::jsonb,
              ${recipe.tips},
              'published'
            )
          `;
          
          successCount++;
          console.log(`   ✅ ${recipe.title}`);
          
        } catch (error) {
          failCount++;
          console.log(`   ❌ ${file}: ${error.message}`);
        }
      }
      
      console.log('');
    }
    
    // 4. 更新用户的食谱数
    await sql`
      UPDATE users 
      SET recipe_count = ${successCount}
      WHERE id = ${userId}::uuid
    `;
    
    // 5. 统计信息
    console.log('═'.repeat(60));
    console.log('📊 导入统计');
    console.log('═'.repeat(60));
    console.log(`总计处理: ${totalRecipes} 个菜谱`);
    console.log(`✅ 成功导入: ${successCount} 个`);
    console.log(`❌ 失败: ${failCount} 个`);
    console.log(`成功率: ${((successCount / totalRecipes) * 100).toFixed(2)}%`);
    
    // 6. 验证导入结果
    console.log('\n📊 数据库统计:');
    const stats = await sql`
      SELECT 
        category,
        COUNT(*)::int as count
      FROM recipes
      WHERE status = 'published'
      GROUP BY category
      ORDER BY count DESC
    `;
    
    stats.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} 个菜谱`);
    });
    
    const totalCount = await sql`SELECT COUNT(*)::int as total FROM recipes`;
    console.log(`\n  总计: ${totalCount.rows[0].total} 个菜谱`);
    
    console.log('\n✨ 导入完成！');
    
  } catch (error) {
    console.error('\n❌ 导入失败:', error);
    throw error;
  }
}

// 运行导入
importRecipes()
  .then(() => {
    console.log('\n🎉 所有操作完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 发生错误:', error);
    process.exit(1);
  });

