/**
 * 分析现有数据库结构
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

async function analyzeDatabase() {
  let connection;

  try {
    console.log('🔌 连接数据库...\n');
    connection = await mysql.createConnection(dbConfig);

    // 1. 所有表
    console.log('📊 数据库表列表:');
    console.log('='.repeat(70));
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    for (const tableName of tableNames) {
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  ${tableName.padEnd(20)} ${count[0].count} 条数据`);
    }

    // 2. Users 表结构
    console.log('\n👥 users 表结构:');
    console.log('='.repeat(70));
    const [userColumns] = await connection.query('DESCRIBE users');
    userColumns.forEach(col => {
      console.log(`  ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null} ${col.Key}`);
    });

    const [users] = await connection.query('SELECT * FROM users LIMIT 3');
    console.log('\n用户数据示例:');
    users.forEach((user, i) => {
      console.log(`\n  用户 ${i + 1}:`);
      console.log(`    ID: ${user.id}`);
      console.log(`    openid: ${user.openid}`);
      console.log(`    nickname: ${user.nickname || '(无)'}`);
    });

    // 3. Recipes 表结构
    console.log('\n\n📖 recipes 表结构:');
    console.log('='.repeat(70));
    const [recipeColumns] = await connection.query('DESCRIBE recipes');
    recipeColumns.forEach(col => {
      console.log(`  ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null} ${col.Key}`);
    });

    const [recipes] = await connection.query('SELECT * FROM recipes LIMIT 2');
    console.log('\n食谱数据示例:');
    recipes.forEach((recipe, i) => {
      console.log(`\n  食谱 ${i + 1}:`);
      console.log(`    ID: ${recipe.id}`);
      console.log(`    标题: ${recipe.title}`);
      console.log(`    作者ID: ${recipe.author_id}`);
      console.log(`    分类: ${recipe.category}`);
      console.log(`    难度: ${recipe.difficulty}`);
      console.log(`    时间: ${recipe.cook_time}分钟`);
      console.log(`    点赞: ${recipe.likes}, 浏览: ${recipe.views}, 收藏: ${recipe.collects}`);
    });

    // 4. Categories 表
    console.log('\n\n📂 categories 表结构:');
    console.log('='.repeat(70));
    const [catColumns] = await connection.query('DESCRIBE categories');
    catColumns.forEach(col => {
      console.log(`  ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null} ${col.Key}`);
    });

    const [categories] = await connection.query('SELECT * FROM categories');
    console.log('\n所有分类:');
    categories.forEach(cat => {
      console.log(`  ${cat.id}. ${cat.name} (${cat.recipe_count})`);
    });

    // 5. 分析字段映射关系
    console.log('\n\n🔄 字段映射关系:');
    console.log('='.repeat(70));
    console.log('后端代码字段 → 数据库实际字段\n');
    
    const mappings = [
      { backend: 'user_id (int)', db: 'author_id (char(36))', note: '⚠️  类型和名称都不同' },
      { backend: 'category_id (int)', db: 'category (varchar(50))', note: '⚠️  存储方式不同' },
      { backend: 'description', db: 'introduction', note: '⚠️  名称不同' },
      { backend: 'favorites', db: 'collects', note: '⚠️  名称不同' },
      { backend: 'id (int)', db: 'id (char(36))', note: '⚠️  UUID vs 自增ID' },
      { backend: 'cover_image', db: 'cover_image', note: '✅ 一致' },
      { backend: 'difficulty', db: 'difficulty', note: '✅ 一致' },
      { backend: 'cook_time', db: 'cook_time', note: '✅ 一致' },
      { backend: 'likes', db: 'likes', note: '✅ 一致' },
      { backend: 'views', db: 'views', note: '✅ 一致' },
    ];

    mappings.forEach(m => {
      console.log(`  ${m.backend.padEnd(30)} → ${m.db.padEnd(30)} ${m.note}`);
    });

    // 6. 建议
    console.log('\n\n💡 建议:');
    console.log('='.repeat(70));
    console.log('\n方案1 (推荐): 修改后端代码适配现有数据库');
    console.log('  ✅ 保留现有的 5 个食谱和 2 个用户');
    console.log('  ✅ 无需重新导入数据');
    console.log('  ⚠️  需要修改后端 entity 文件');
    console.log('  ⚠️  需要修改查询逻辑');
    
    console.log('\n方案2: 清空数据库并使用新表结构');
    console.log('  ❌ 会丢失现有的 5 个食谱和 2 个用户');
    console.log('  ✅ 后端代码无需修改');
    console.log('  ✅ 表结构更规范');

    console.log('\n\n推荐选择: 方案1 (修改后端代码)');
    console.log('因为数据库中已有数据，修改后端代码更合理。\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭\n');
    }
  }
}

analyzeDatabase();

