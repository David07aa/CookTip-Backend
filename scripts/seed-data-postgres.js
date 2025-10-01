/**
 * PostgreSQL 数据库测试数据种子脚本
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function seedData() {
  console.log('🌱 开始添加测试数据到 PostgreSQL 数据库...\n');

  try {
    // 1. 添加测试用户
    console.log('👤 添加测试用户...');
    const testUsers = [
      { nickname: '美食家小王', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang' },
      { nickname: '厨神张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang' },
      { nickname: '料理达人李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li' }
    ];

    const userIds = [];
    for (const user of testUsers) {
      const result = await sql`
        INSERT INTO users (openid, nick_name, avatar)
        VALUES (${`test_${Date.now()}_${Math.random()}`}, ${user.nickname}, ${user.avatar})
        RETURNING id
      `;
      userIds.push(result.rows[0].id);
    }
    console.log(`✅ 成功添加 ${testUsers.length} 个测试用户\n`);

    // 2. 添加食谱
    console.log('📖 添加食谱数据...');
    const recipes = [
      {
        title: '经典番茄炒蛋',
        description: '家常美味，简单易学的经典菜肴',
        cover_image: 'https://images.unsplash.com/photo-1603046891726-36bfd957e0d4',
        difficulty: '简单',
        cook_time: 15,
        servings: 2,
        category: '家常菜',
        tags: ['快手', '经典', '下饭'],
        ingredients: [
          { name: '鸡蛋', amount: '3个', note: '' },
          { name: '番茄', amount: '2个', note: '中等大小' },
          { name: '盐', amount: '适量', note: '' },
          { name: '糖', amount: '1勺', note: '' },
          { name: '葱花', amount: '少许', note: '' }
        ],
        steps: [
          { order: 1, description: '番茄洗净切块，鸡蛋打散加少许盐', image: '', duration: 3 },
          { order: 2, description: '热锅倒油，炒鸡蛋至金黄盛出', image: '', duration: 3 },
          { order: 3, description: '另起锅炒番茄，加糖和盐', image: '', duration: 5 },
          { order: 4, description: '倒入炒好的鸡蛋，翻炒均匀', image: '', duration: 2 },
          { order: 5, description: '撒葱花出锅', image: '', duration: 1 }
        ]
      },
      {
        title: '黄金炒饭',
        description: '粒粒分明，香气扑鼻的美味炒饭',
        cover_image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b',
        difficulty: '简单',
        cook_time: 20,
        servings: 2,
        category: '主食',
        tags: ['快手', '主食', '剩饭利用'],
        ingredients: [
          { name: '米饭', amount: '2碗', note: '隔夜饭最佳' },
          { name: '鸡蛋', amount: '2个', note: '' },
          { name: '胡萝卜', amount: '半根', note: '切丁' },
          { name: '火腿', amount: '100克', note: '切丁' },
          { name: '青豆', amount: '50克', note: '' },
          { name: '葱', amount: '2根', note: '切葱花' }
        ],
        steps: [
          { order: 1, description: '准备所有食材，米饭打散', image: '', duration: 5 },
          { order: 2, description: '鸡蛋打散，倒入米饭中拌匀', image: '', duration: 2 },
          { order: 3, description: '热锅倒油，炒配菜至断生', image: '', duration: 5 },
          { order: 4, description: '倒入裹好蛋液的米饭，大火快炒', image: '', duration: 6 },
          { order: 5, description: '加盐调味，撒葱花出锅', image: '', duration: 2 }
        ]
      },
      {
        title: '老鸭汤',
        description: '滋补养生的经典汤品',
        cover_image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        difficulty: '中等',
        cook_time: 120,
        servings: 4,
        category: '汤羹',
        tags: ['滋补', '养生', '冬季'],
        ingredients: [
          { name: '老鸭', amount: '半只', note: '约1斤' },
          { name: '冬瓜', amount: '500克', note: '' },
          { name: '薏米', amount: '50克', note: '提前浸泡' },
          { name: '生姜', amount: '5片', note: '' },
          { name: '料酒', amount: '2勺', note: '' },
          { name: '盐', amount: '适量', note: '' }
        ],
        steps: [
          { order: 1, description: '鸭肉洗净切块，焯水去血沫', image: '', duration: 10 },
          { order: 2, description: '砂锅加水，放入鸭肉、薏米、姜片', image: '', duration: 5 },
          { order: 3, description: '大火烧开后转小火炖1.5小时', image: '', duration: 90 },
          { order: 4, description: '加入冬瓜块继续炖20分钟', image: '', duration: 20 },
          { order: 5, description: '加盐调味即可', image: '', duration: 2 }
        ]
      },
      {
        title: '麻婆豆腐',
        description: '麻辣鲜香的经典川菜',
        cover_image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10',
        difficulty: '中等',
        cook_time: 25,
        servings: 3,
        category: '川菜',
        tags: ['下饭', '麻辣', '经典'],
        ingredients: [
          { name: '嫩豆腐', amount: '1盒', note: '约400克' },
          { name: '猪肉末', amount: '100克', note: '' },
          { name: '豆瓣酱', amount: '2勺', note: '' },
          { name: '花椒', amount: '1勺', note: '' },
          { name: '蒜末', amount: '3瓣', note: '' },
          { name: '葱花', amount: '适量', note: '' }
        ],
        steps: [
          { order: 1, description: '豆腐切块，用盐水浸泡5分钟', image: '', duration: 5 },
          { order: 2, description: '热锅炒肉末至变色', image: '', duration: 3 },
          { order: 3, description: '加豆瓣酱炒出红油', image: '', duration: 2 },
          { order: 4, description: '加水烧开，放入豆腐煮5分钟', image: '', duration: 7 },
          { order: 5, description: '撒花椒粉和葱花出锅', image: '', duration: 1 }
        ]
      },
      {
        title: '蒜蓉西兰花',
        description: '清淡健康的素菜',
        cover_image: 'https://images.unsplash.com/photo-1628773822990-202a56274e99',
        difficulty: '简单',
        cook_time: 10,
        servings: 2,
        category: '素菜',
        tags: ['健康', '快手', '素食'],
        ingredients: [
          { name: '西兰花', amount: '1个', note: '' },
          { name: '大蒜', amount: '5瓣', note: '切末' },
          { name: '蚝油', amount: '1勺', note: '' },
          { name: '盐', amount: '少许', note: '' }
        ],
        steps: [
          { order: 1, description: '西兰花切小朵，焯水1分钟', image: '', duration: 3 },
          { order: 2, description: '热锅爆香蒜末', image: '', duration: 2 },
          { order: 3, description: '倒入西兰花快速翻炒', image: '', duration: 3 },
          { order: 4, description: '加蚝油和盐调味出锅', image: '', duration: 2 }
        ]
      }
    ];

    const recipeIds = [];
    for (const recipe of recipes) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      
      const result = await sql`
        INSERT INTO recipes (
          author_id, title, introduction, cover_image, category,
          difficulty, cook_time, servings, ingredients, steps, tags
        )
        VALUES (
          ${userId}, ${recipe.title}, ${recipe.description}, ${recipe.cover_image},
          ${recipe.category}, ${recipe.difficulty}, ${recipe.cook_time}, ${recipe.servings},
          ${JSON.stringify(recipe.ingredients)}::jsonb,
          ${JSON.stringify(recipe.steps)}::jsonb,
          ${JSON.stringify(recipe.tags)}::jsonb
        )
        RETURNING id
      `;
      recipeIds.push(result.rows[0].id);
    }
    console.log(`✅ 成功添加 ${recipes.length} 个食谱\n`);

    // 4. 添加评论
    console.log('💬 添加评论数据...');
    const comments = [
      '做出来很好吃！',
      '步骤很详细，新手也能学会',
      '已经做了好几次了，家人都很喜欢',
      '味道不错，下次还会做',
      '简单易学，强烈推荐！',
      '色香味俱全',
      '跟着做一次就成功了',
      '很实用的菜谱'
    ];

    let commentCount = 0;
    for (const recipeId of recipeIds) {
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numComments; i++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const content = comments[Math.floor(Math.random() * comments.length)];
        await sql`
          INSERT INTO comments (recipe_id, user_id, content)
          VALUES (${recipeId}, ${userId}, ${content})
        `;
        commentCount++;
      }
    }
    console.log(`✅ 成功添加 ${commentCount} 条评论\n`);

    // 5. 添加点赞和收藏
    console.log('❤️ 添加点赞和收藏数据...');
    let likeCount = 0;
    let favoriteCount = 0;

    for (const recipeId of recipeIds) {
      for (const userId of userIds) {
        // 随机点赞
        if (Math.random() > 0.3) {
          await sql`
            INSERT INTO likes (recipe_id, user_id)
            VALUES (${recipeId}, ${userId})
            ON CONFLICT (recipe_id, user_id) DO NOTHING
          `;
          likeCount++;
        }
        // 随机收藏
        if (Math.random() > 0.5) {
          await sql`
            INSERT INTO favorites (recipe_id, user_id)
            VALUES (${recipeId}, ${userId})
            ON CONFLICT (recipe_id, user_id) DO NOTHING
          `;
          favoriteCount++;
        }
      }
    }
    console.log(`✅ 成功添加 ${likeCount} 个点赞`);
    console.log(`✅ 成功添加 ${favoriteCount} 个收藏\n`);

    // 3. 验证数据
    console.log('📊 数据统计：');
    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM recipes) as recipe_count,
        (SELECT COUNT(*) FROM comments) as comment_count,
        (SELECT COUNT(*) FROM likes) as like_count,
        (SELECT COUNT(*) FROM favorites) as favorite_count
    `;
    
    console.log(`  用户数: ${stats.rows[0].user_count}`);
    console.log(`  食谱数: ${stats.rows[0].recipe_count}`);
    console.log(`  评论数: ${stats.rows[0].comment_count}`);
    console.log(`  点赞数: ${stats.rows[0].like_count}`);
    console.log(`  收藏数: ${stats.rows[0].favorite_count}`);

    console.log('\n✅ 测试数据添加完成！');

  } catch (error) {
    console.error('❌ 添加测试数据失败:', error);
    throw error;
  }
}

// 运行
seedData()
  .then(() => {
    console.log('\n🎉 数据库种子数据添加成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 数据库种子数据添加失败:', error);
    process.exit(1);
  });

