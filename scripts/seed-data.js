const mysql = require('mysql2/promise');

// 数据库配置
const config = {
  host: process.env.DB_HOST || 'mysql3.sqlpub.com',
  port: parseInt(process.env.DB_PORT) || 3308,
  database: process.env.DB_NAME || 'onefoodlibrary',
  user: process.env.DB_USER || 'david_x',
  password: process.env.DB_PASSWORD || 'NVRvnX3rP88UyUET'
};

/**
 * 插入测试数据
 */
async function seedData() {
  let connection;
  
  try {
    console.log('🌱 开始插入测试数据...\n');
    
    // 连接数据库
    console.log('🔄 正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功！\n');

    // 1. 创建测试用户
    console.log('👤 创建测试用户...');
    const userId1 = generateUUID();
    const userId2 = generateUUID();

    await connection.execute(
      `INSERT INTO users (id, openid, nick_name, avatar, bio, created_at, updated_at) VALUES
      (?, 'test_openid_001', '美食达人小王', 'https://i.pravatar.cc/300?img=1', '热爱烹饪，分享美食，享受生活！', NOW(), NOW()),
      (?, 'test_openid_002', '厨艺新手小李', 'https://i.pravatar.cc/300?img=2', '正在学习做菜，希望能做出好吃的菜肴~', NOW(), NOW())`,
      [userId1, userId2]
    );
    console.log('   ✓ 已创建 2 个测试用户\n');

    // 2. 创建测试食谱
    console.log('📖 创建测试食谱...');
    
    const recipes = [
      {
        id: generateUUID(),
        title: '番茄炒蛋',
        coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        introduction: '经典家常菜，简单易做，营养丰富。鲜嫩的鸡蛋配上酸甜的番茄，是一道百吃不厌的美味。',
        authorId: userId1,
        cookTime: 15,
        difficulty: '简单',
        servings: 2,
        taste: '酸甜',
        category: '中餐',
        tags: ['家常菜', '快手菜', '下饭菜'],
        ingredients: [
          { name: '鸡蛋', amount: '3个' },
          { name: '番茄', amount: '2个' },
          { name: '食用油', amount: '适量' },
          { name: '盐', amount: '适量' },
          { name: '白糖', amount: '1小勺' }
        ],
        steps: [
          { step: 1, description: '鸡蛋打入碗中，加少许盐打散', image: '' },
          { step: 2, description: '番茄洗净切块', image: '' },
          { step: 3, description: '锅中热油，倒入蛋液，炒至凝固盛出', image: '' },
          { step: 4, description: '锅中再加少许油，放入番茄翻炒出汁', image: '' },
          { step: 5, description: '加入炒好的鸡蛋，加盐和糖调味，翻炒均匀即可', image: '' }
        ],
        tips: '番茄要选择熟透的，口感更好。炒鸡蛋时油温要高，快速翻炒。',
        nutrition: { calories: '180kcal', protein: '12g', fat: '10g', carbs: '8g' }
      },
      {
        id: generateUUID(),
        title: '宫保鸡丁',
        coverImage: 'https://images.unsplash.com/photo-1603073163308-9e6a53b7e9b4?w=800',
        introduction: '川菜经典名菜，麻辣鲜香，鸡肉嫩滑，花生酥脆，色香味俱全。',
        authorId: userId1,
        cookTime: 25,
        difficulty: '中等',
        servings: 3,
        taste: '麻辣',
        category: '中餐',
        tags: ['川菜', '下饭菜', '宴客菜'],
        ingredients: [
          { name: '鸡胸肉', amount: '300g' },
          { name: '花生米', amount: '100g' },
          { name: '干辣椒', amount: '10个' },
          { name: '花椒', amount: '1小勺' },
          { name: '葱姜蒜', amount: '适量' },
          { name: '料酒', amount: '1勺' },
          { name: '酱油', amount: '2勺' },
          { name: '醋', amount: '1勺' },
          { name: '白糖', amount: '1勺' },
          { name: '淀粉', amount: '适量' }
        ],
        steps: [
          { step: 1, description: '鸡胸肉切丁，加料酒、酱油、淀粉腌制15分钟', image: '' },
          { step: 2, description: '调制宫保汁：酱油、醋、糖、淀粉、水混合', image: '' },
          { step: 3, description: '热油炸花生米至金黄，捞出备用', image: '' },
          { step: 4, description: '鸡丁下锅快速滑炒至变色，盛出', image: '' },
          { step: 5, description: '锅中留油，爆香干辣椒和花椒', image: '' },
          { step: 6, description: '加入葱姜蒜爆香，倒入鸡丁翻炒', image: '' },
          { step: 7, description: '淋入宫保汁，翻炒均匀，最后加入花生米即可', image: '' }
        ],
        tips: '鸡肉一定要嫩，腌制时间不要太长。花椒和干辣椒不要炒糊，保持小火。',
        nutrition: { calories: '380kcal', protein: '28g', fat: '18g', carbs: '25g' }
      },
      {
        id: generateUUID(),
        title: '戚风蛋糕',
        coverImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
        introduction: '口感轻盈细腻，松软如云朵，是烘焙入门必学的基础蛋糕。',
        authorId: userId2,
        cookTime: 60,
        difficulty: '中等',
        servings: 8,
        taste: '香甜',
        category: '烘焙',
        tags: ['甜品', '蛋糕', '下午茶'],
        ingredients: [
          { name: '鸡蛋', amount: '5个' },
          { name: '低筋面粉', amount: '90g' },
          { name: '细砂糖', amount: '70g（蛋白）+ 20g（蛋黄）' },
          { name: '玉米油', amount: '50ml' },
          { name: '牛奶', amount: '50ml' },
          { name: '柠檬汁', amount: '几滴' }
        ],
        steps: [
          { step: 1, description: '分离蛋黄和蛋白，蛋白放入无水无油的盆中', image: '' },
          { step: 2, description: '蛋黄加糖、油、牛奶搅拌均匀，筛入低筋面粉拌匀', image: '' },
          { step: 3, description: '蛋白加柠檬汁，分三次加糖打发至硬性发泡', image: '' },
          { step: 4, description: '取1/3蛋白霜与蛋黄糊混合，再倒回蛋白盆中翻拌均匀', image: '' },
          { step: 5, description: '倒入8寸模具，震出气泡', image: '' },
          { step: 6, description: '烤箱预热150度，烤60分钟', image: '' },
          { step: 7, description: '出炉立即倒扣，完全冷却后脱模', image: '' }
        ],
        tips: '打发蛋白是关键，要打到提起打蛋器有小尖角。翻拌时要轻柔，避免消泡。倒扣冷却很重要，防止塌陷。',
        nutrition: { calories: '220kcal', protein: '6g', fat: '12g', carbs: '22g' }
      },
      {
        id: generateUUID(),
        title: '红烧排骨',
        coverImage: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800',
        introduction: '色泽红亮，肉质酥烂，咸甜适中，是一道经典的传统家常菜。',
        authorId: userId1,
        cookTime: 45,
        difficulty: '简单',
        servings: 4,
        taste: '咸鲜',
        category: '中餐',
        tags: ['家常菜', '硬菜', '下饭菜'],
        ingredients: [
          { name: '排骨', amount: '500g' },
          { name: '生姜', amount: '3片' },
          { name: '葱', amount: '2根' },
          { name: '八角', amount: '2个' },
          { name: '桂皮', amount: '1小块' },
          { name: '料酒', amount: '2勺' },
          { name: '生抽', amount: '3勺' },
          { name: '老抽', amount: '1勺' },
          { name: '冰糖', amount: '10颗' },
          { name: '盐', amount: '适量' }
        ],
        steps: [
          { step: 1, description: '排骨冷水下锅焯水，撇去浮沫，捞出洗净', image: '' },
          { step: 2, description: '锅中少油，放入冰糖小火炒糖色', image: '' },
          { step: 3, description: '下排骨翻炒上色', image: '' },
          { step: 4, description: '加入葱姜、八角、桂皮爆香', image: '' },
          { step: 5, description: '倒入料酒、生抽、老抽翻炒', image: '' },
          { step: 6, description: '加热水没过排骨，大火烧开转小火炖30分钟', image: '' },
          { step: 7, description: '大火收汁，汤汁浓稠即可出锅', image: '' }
        ],
        tips: '炒糖色时要小火，糖融化起泡即可，不要炒糊。收汁时要勤翻动，防止粘锅。',
        nutrition: { calories: '450kcal', protein: '32g', fat: '28g', carbs: '15g' }
      },
      {
        id: generateUUID(),
        title: '抹茶拿铁',
        coverImage: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800',
        introduction: '清新的抹茶配上香浓的牛奶，一杯治愈系的饮品，完美的下午茶时光。',
        authorId: userId2,
        cookTime: 10,
        difficulty: '简单',
        servings: 1,
        taste: '香甜',
        category: '饮品',
        tags: ['饮品', '抹茶', '下午茶'],
        ingredients: [
          { name: '抹茶粉', amount: '5g' },
          { name: '牛奶', amount: '200ml' },
          { name: '热水', amount: '30ml' },
          { name: '蜂蜜/糖', amount: '适量' }
        ],
        steps: [
          { step: 1, description: '抹茶粉加入热水，用打蛋器充分搅拌至无颗粒', image: '' },
          { step: 2, description: '牛奶加热至70度左右', image: '' },
          { step: 3, description: '将热牛奶倒入抹茶液中', image: '' },
          { step: 4, description: '加入蜂蜜或糖调味', image: '' },
          { step: 5, description: '用奶泡器打出奶泡（可选）', image: '' }
        ],
        tips: '抹茶粉要选择优质的，味道更纯正。可以冰镇后饮用，夏天更爽口。',
        nutrition: { calories: '150kcal', protein: '7g', fat: '5g', carbs: '20g' }
      }
    ];

    for (const recipe of recipes) {
      await connection.execute(
        `INSERT INTO recipes (
          id, title, cover_image, introduction, author_id, cook_time, 
          difficulty, servings, taste, category, tags, ingredients, 
          steps, tips, nutrition, views, likes, collects, status, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())`,
        [
          recipe.id,
          recipe.title,
          recipe.coverImage,
          recipe.introduction,
          recipe.authorId,
          recipe.cookTime,
          recipe.difficulty,
          recipe.servings,
          recipe.taste,
          recipe.category,
          JSON.stringify(recipe.tags),
          JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.steps),
          recipe.tips,
          JSON.stringify(recipe.nutrition),
          Math.floor(Math.random() * 500) + 50, // 随机浏览量
          Math.floor(Math.random() * 100) + 10, // 随机点赞数
          Math.floor(Math.random() * 50) + 5,   // 随机收藏数
        ]
      );
      console.log(`   ✓ 已创建食谱: ${recipe.title}`);
    }

    // 更新用户的食谱数量
    await connection.execute(
      'UPDATE users SET recipe_count = (SELECT COUNT(*) FROM recipes WHERE author_id = users.id)'
    );

    console.log('\n✅ 测试数据插入完成！\n');
    console.log('📊 数据统计:');
    console.log('   - 用户: 2 个');
    console.log('   - 食谱: 5 个');
    console.log('   - 分类: 中餐(3), 烘焙(1), 饮品(1)');
    console.log('\n🎉 现在可以测试 API 了！');

  } catch (error) {
    console.error('\n❌ 插入测试数据失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }

  process.exit(0);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 执行
console.log('='.repeat(60));
console.log('🌱 一家食谱 - 测试数据生成脚本');
console.log('='.repeat(60));
console.log('');

seedData();
