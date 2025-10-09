/**
 * 从备份中恢复数据到新表结构
 * 提取旧备份中的5个食谱和2个用户，转换后插入新表
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

// 备份中的原始数据
const backupUsers = [
  {
    id: '17e09256-465e-4df3-8ca7-eafd816aa129',
    openid: 'test_openid_002',
    nick_name: '厨艺新手小李',
    avatar: 'https://i.pravatar.cc/300?img=2',
    bio: '正在学习做菜，希望能做出好吃的菜肴~',
    recipe_count: 2
  },
  {
    id: '2565ea32-9aa8-4d00-bcda-ea70b681b111',
    openid: 'test_openid_001',
    nick_name: '美食达人小王',
    avatar: 'https://i.pravatar.cc/300?img=1',
    bio: '热爱烹饪，分享美食，享受生活！',
    recipe_count: 3
  }
];

const backupRecipes = [
  {
    id: '018dd488-e930-4b04-b89b-ab98214af966',
    title: '红烧排骨',
    cover_image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800',
    introduction: '色泽红亮，肉质酥烂，咸甜适中，是一道经典的传统家常菜。',
    author_id: '2565ea32-9aa8-4d00-bcda-ea70b681b111',
    cook_time: 45,
    difficulty: '简单',
    servings: 4,
    taste: '咸鲜',
    category: '中餐',
    tags: ["家常菜", "硬菜", "下饭菜"],
    ingredients: [
      {"name": "排骨", "amount": "500g"},
      {"name": "生姜", "amount": "3片"},
      {"name": "葱", "amount": "2根"},
      {"name": "八角", "amount": "2个"},
      {"name": "桂皮", "amount": "1小块"},
      {"name": "料酒", "amount": "2勺"},
      {"name": "生抽", "amount": "3勺"},
      {"name": "老抽", "amount": "1勺"},
      {"name": "冰糖", "amount": "10颗"},
      {"name": "盐", "amount": "适量"}
    ],
    steps: [
      {"step": 1, "image": "", "description": "排骨冷水下锅焯水，撇去浮沫，捞出洗净"},
      {"step": 2, "image": "", "description": "锅中少油，放入冰糖小火炒糖色"},
      {"step": 3, "image": "", "description": "下排骨翻炒上色"},
      {"step": 4, "image": "", "description": "加入葱姜、八角、桂皮爆香"},
      {"step": 5, "image": "", "description": "倒入料酒、生抽、老抽翻炒"},
      {"step": 6, "image": "", "description": "加热水没过排骨，大火烧开转小火炖30分钟"},
      {"step": 7, "image": "", "description": "大火收汁，汤汁浓稠即可出锅"}
    ],
    tips: '炒糖色时要小火，糖融化起泡即可，不要炒糊。收汁时要勤翻动，防止粘锅。',
    nutrition: {"fat": "28g", "carbs": "15g", "protein": "32g", "calories": "450kcal"},
    views: 375,
    likes: 39,
    collects: 52,
    comments: 0,
    shares: 0
  },
  {
    id: '266cb5e8-9800-4f4c-abd9-230341a41896',
    title: '戚风蛋糕',
    cover_image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    introduction: '口感轻盈细腻，松软如云朵，是烘焙入门必学的基础蛋糕。',
    author_id: '17e09256-465e-4df3-8ca7-eafd816aa129',
    cook_time: 60,
    difficulty: '中等',
    servings: 8,
    taste: '香甜',
    category: '烘焙',
    tags: ["甜品", "蛋糕", "下午茶"],
    ingredients: [
      {"name": "鸡蛋", "amount": "5个"},
      {"name": "低筋面粉", "amount": "90g"},
      {"name": "细砂糖", "amount": "70g（蛋白）+ 20g（蛋黄）"},
      {"name": "玉米油", "amount": "50ml"},
      {"name": "牛奶", "amount": "50ml"},
      {"name": "柠檬汁", "amount": "几滴"}
    ],
    steps: [
      {"step": 1, "image": "", "description": "分离蛋黄和蛋白，蛋白放入无水无油的盆中"},
      {"step": 2, "image": "", "description": "蛋黄加糖、油、牛奶搅拌均匀，筛入低筋面粉拌匀"},
      {"step": 3, "image": "", "description": "蛋白加柠檬汁，分三次加糖打发至硬性发泡"},
      {"step": 4, "image": "", "description": "取1/3蛋白霜与蛋黄糊混合，再倒回蛋白盆中翻拌均匀"},
      {"step": 5, "image": "", "description": "倒入8寸模具，震出气泡"},
      {"step": 6, "image": "", "description": "烤箱预热150度，烤60分钟"},
      {"step": 7, "image": "", "description": "出炉立即倒扣，完全冷却后脱模"}
    ],
    tips: '打发蛋白是关键，要打到提起打蛋器有小尖角。翻拌时要轻柔，避免消泡。倒扣冷却很重要，防止塌陷。',
    nutrition: {"fat": "12g", "carbs": "22g", "protein": "6g", "calories": "220kcal"},
    views: 421,
    likes: 36,
    collects: 33,
    comments: 0,
    shares: 0
  },
  {
    id: '327e5c39-5e25-448c-b664-4054453b6401',
    title: '番茄炒蛋',
    cover_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    introduction: '经典家常菜，简单易做，营养丰富。鲜嫩的鸡蛋配上酸甜的番茄，是一道百吃不厌的美味。',
    author_id: '2565ea32-9aa8-4d00-bcda-ea70b681b111',
    cook_time: 15,
    difficulty: '简单',
    servings: 2,
    taste: '酸甜',
    category: '中餐',
    tags: ["家常菜", "快手菜", "下饭菜"],
    ingredients: [
      {"name": "鸡蛋", "amount": "3个"},
      {"name": "番茄", "amount": "2个"},
      {"name": "食用油", "amount": "适量"},
      {"name": "盐", "amount": "适量"},
      {"name": "白糖", "amount": "1小勺"}
    ],
    steps: [
      {"step": 1, "image": "", "description": "鸡蛋打入碗中，加少许盐打散"},
      {"step": 2, "image": "", "description": "番茄洗净切块"},
      {"step": 3, "image": "", "description": "锅中热油，倒入蛋液，炒至凝固盛出"},
      {"step": 4, "image": "", "description": "锅中再加少许油，放入番茄翻炒出汁"},
      {"step": 5, "image": "", "description": "加入炒好的鸡蛋，加盐和糖调味，翻炒均匀即可"}
    ],
    tips: '番茄要选择熟透的，口感更好。炒鸡蛋时油温要高，快速翻炒。',
    nutrition: {"fat": "10g", "carbs": "8g", "protein": "12g", "calories": "180kcal"},
    views: 187,
    likes: 107,
    collects: 43,
    comments: 0,
    shares: 0
  },
  {
    id: '5708f619-3d4f-4278-8e68-a8a21c47b2fc',
    title: '抹茶拿铁',
    cover_image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800',
    introduction: '清新的抹茶配上香浓的牛奶，一杯治愈系的饮品，完美的下午茶时光。',
    author_id: '17e09256-465e-4df3-8ca7-eafd816aa129',
    cook_time: 10,
    difficulty: '简单',
    servings: 1,
    taste: '香甜',
    category: '饮品',
    tags: ["饮品", "抹茶", "下午茶"],
    ingredients: [
      {"name": "抹茶粉", "amount": "5g"},
      {"name": "牛奶", "amount": "200ml"},
      {"name": "热水", "amount": "30ml"},
      {"name": "蜂蜜/糖", "amount": "适量"}
    ],
    steps: [
      {"step": 1, "image": "", "description": "抹茶粉加入热水，用打蛋器充分搅拌至无颗粒"},
      {"step": 2, "image": "", "description": "牛奶加热至70度左右"},
      {"step": 3, "image": "", "description": "将热牛奶倒入抹茶液中"},
      {"step": 4, "image": "", "description": "加入蜂蜜或糖调味"},
      {"step": 5, "image": "", "description": "用奶泡器打出奶泡（可选）"}
    ],
    tips: '抹茶粉要选择优质的，味道更纯正。可以冰镇后饮用，夏天更爽口。',
    nutrition: {"fat": "5g", "carbs": "20g", "protein": "7g", "calories": "150kcal"},
    views: 206,
    likes: 107,
    collects: 6,
    comments: 0,
    shares: 0
  },
  {
    id: 'e4069657-16fc-4237-bb18-6c2d2351911f',
    title: '宫保鸡丁',
    cover_image: 'https://images.unsplash.com/photo-1603073163308-9e6a53b7e9b4?w=800',
    introduction: '川菜经典名菜，麻辣鲜香，鸡肉嫩滑，花生酥脆，色香味俱全。',
    author_id: '2565ea32-9aa8-4d00-bcda-ea70b681b111',
    cook_time: 25,
    difficulty: '中等',
    servings: 3,
    taste: '麻辣',
    category: '中餐',
    tags: ["川菜", "下饭菜", "宴客菜"],
    ingredients: [
      {"name": "鸡胸肉", "amount": "300g"},
      {"name": "花生米", "amount": "100g"},
      {"name": "干辣椒", "amount": "10个"},
      {"name": "花椒", "amount": "1小勺"},
      {"name": "葱姜蒜", "amount": "适量"},
      {"name": "料酒", "amount": "1勺"},
      {"name": "酱油", "amount": "2勺"},
      {"name": "醋", "amount": "1勺"},
      {"name": "白糖", "amount": "1勺"},
      {"name": "淀粉", "amount": "适量"}
    ],
    steps: [
      {"step": 1, "image": "", "description": "鸡胸肉切丁，加料酒、酱油、淀粉腌制15分钟"},
      {"step": 2, "image": "", "description": "调制宫保汁：酱油、醋、糖、淀粉、水混合"},
      {"step": 3, "image": "", "description": "热油炸花生米至金黄，捞出备用"},
      {"step": 4, "image": "", "description": "鸡丁下锅快速滑炒至变色，盛出"},
      {"step": 5, "image": "", "description": "锅中留油，爆香干辣椒和花椒"},
      {"step": 6, "image": "", "description": "加入葱姜蒜爆香，倒入鸡丁翻炒"},
      {"step": 7, "image": "", "description": "淋入宫保汁，翻炒均匀，最后加入花生米即可"}
    ],
    tips: '鸡肉一定要嫩，腌制时间不要太长。花椒和干辣椒不要炒糊，保持小火。',
    nutrition: {"fat": "18g", "carbs": "25g", "protein": "28g", "calories": "380kcal"},
    views: 257,
    likes: 90,
    collects: 29,
    comments: 0,
    shares: 0
  }
];

const log = (message, emoji = '📝') => console.log(`${emoji} ${message}`);

async function restoreFromBackup() {
  let connection;
  const userIdMap = new Map(); // oldUUID → newID

  try {
    log('连接数据库...', '🔌');
    connection = await mysql.createConnection(dbConfig);
    log('连接成功！\n', '✅');

    // ============================================
    // 步骤 1: 清空现有数据（保留表结构）
    // ============================================
    log('清空现有数据...', '🗑️');
    console.log('='.repeat(70));

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DELETE FROM shopping_list');
    await connection.query('DELETE FROM likes');
    await connection.query('DELETE FROM favorites');
    await connection.query('DELETE FROM comments');
    await connection.query('DELETE FROM recipes');
    await connection.query('DELETE FROM users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    log('现有数据已清空\n', '✅');

    // ============================================
    // 步骤 2: 插入用户数据
    // ============================================
    log('插入用户数据...', '👥');
    console.log('='.repeat(70));

    for (const user of backupUsers) {
      const [result] = await connection.query(
        `INSERT INTO users (openid, nickname, avatar, bio, recipe_count, follower_count, following_count, favorite_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.openid,
          user.nick_name || '美食爱好者',
          user.avatar || '',
          user.bio || '',
          user.recipe_count || 0,
          0, // follower_count
          0, // following_count
          0  // favorite_count
        ]
      );

      const newUserId = result.insertId;
      userIdMap.set(user.id, newUserId);
      
      log(`  ✅ ${user.nick_name} (UUID: ${user.id} → ID: ${newUserId})`, '');
    }

    // ============================================
    // 步骤 3: 插入食谱数据
    // ============================================
    log('\n插入食谱数据...', '📖');
    console.log('='.repeat(70));

    // 分类名称到ID的映射
    const categoryNameToId = {
      '中餐': 1,
      '西餐': 2,
      '日韩料理': 3,
      '日本料理': 3,
      '韩国料理': 3,
      '烘焙': 4,
      '烘焙甜点': 4,
      '甜点': 4,
      '家常菜': 5,
      '快手菜': 6,
      '素食': 7,
      '汤羹': 8,
      '汤': 8,
      '小吃': 9,
      '饮品': 10,
      '饮料': 10,
    };

    for (const recipe of backupRecipes) {
      // 映射作者ID
      const newAuthorId = userIdMap.get(recipe.author_id);
      if (!newAuthorId) {
        log(`  ⚠️  跳过食谱 "${recipe.title}" (找不到作者)`, '');
        continue;
      }

      // 映射分类
      let categoryId = categoryNameToId[recipe.category] || 5; // 默认为家常菜

      // 插入食谱
      const [result] = await connection.query(
        `INSERT INTO recipes (
          user_id, category_id, title, cover_image, description,
          difficulty, cook_time, servings, taste, ingredients, steps,
          tips, tags, nutrition, likes, favorites, comments, views, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newAuthorId,
          categoryId,
          recipe.title,
          recipe.cover_image || '',
          recipe.introduction || '',
          recipe.difficulty || '简单',
          recipe.cook_time || 30,
          recipe.servings || 2,
          recipe.taste || '',
          JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.steps),
          recipe.tips || '',
          JSON.stringify(recipe.tags),
          JSON.stringify(recipe.nutrition),
          recipe.likes || 0,
          recipe.collects || 0, // collects → favorites
          recipe.comments || 0,
          recipe.views || 0,
          'published'
        ]
      );

      const newRecipeId = result.insertId;
      const [category] = await connection.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
      const categoryName = category && category.length > 0 ? category[0].name : recipe.category;
      
      log(`  ✅ ${recipe.title.padEnd(20)} → ${categoryName} (ID: ${newRecipeId}) | 👍${recipe.likes} 👁${recipe.views}`, '');
    }

    // ============================================
    // 步骤 4: 更新分类统计
    // ============================================
    log('\n更新分类统计...', '📊');
    await connection.query(`
      UPDATE categories c
      SET recipe_count = (
        SELECT COUNT(*) FROM recipes r WHERE r.category_id = c.id
      )
    `);
    log('分类统计更新完成\n', '✅');

    // ============================================
    // 步骤 5: 验证结果
    // ============================================
    log('验证恢复结果...', '🔍');
    console.log('='.repeat(70));

    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM recipes) as recipes
    `);

    log('\n📈 数据统计:', '');
    console.log(`  👥 用户: ${stats[0].users} 个`);
    console.log(`  📂 分类: ${stats[0].categories} 个`);
    console.log(`  📖 食谱: ${stats[0].recipes} 个`);

    // 显示恢复的食谱
    log('\n📖 恢复的食谱列表:', '');
    const [recipes] = await connection.query(`
      SELECT 
        r.id, r.title, r.difficulty, r.cook_time, r.likes, r.views,
        c.name as category_name,
        u.nickname as author_name
      FROM recipes r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.views DESC
    `);

    recipes.forEach((recipe, i) => {
      console.log(`  ${i + 1}. ${recipe.title.padEnd(20)} | 作者: ${recipe.author_name}`);
      console.log(`     分类: ${recipe.category_name.padEnd(10)} [${recipe.difficulty}] ${recipe.cook_time}分钟 | 👍${recipe.likes} 👁${recipe.views}`);
    });

    // 显示分类统计
    log('\n📂 分类统计:', '');
    const [categoryStats] = await connection.query(`
      SELECT id, name, recipe_count 
      FROM categories 
      ORDER BY sort_order
    `);

    categoryStats.forEach(cat => {
      const emoji = cat.recipe_count > 0 ? '✅' : '⚪';
      console.log(`  ${emoji} ${cat.name.padEnd(15)} ${cat.recipe_count} 个食谱`);
    });

    // ============================================
    // 完成
    // ============================================
    log('\n' + '='.repeat(70), '');
    log('🎉 备份数据恢复完成！', '');
    log('='.repeat(70), '');
    
    log(`\n✅ 恢复了 ${backupUsers.length} 个用户`, '');
    log(`✅ 恢复了 ${backupRecipes.length} 个食谱`, '');
    log(`✅ 使用新表结构（自增ID + category_id）`, '');
    log(`✅ 后端代码无需修改\n`, '');

  } catch (error) {
    log(`\n❌ 错误: ${error.message}`, '');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log('🔌 数据库连接已关闭\n', '');
    }
  }
}

// 运行恢复
console.log('\n' + '='.repeat(70));
console.log('🚀 开始从备份恢复数据（转换到新表结构）...');
console.log('='.repeat(70));

restoreFromBackup();

