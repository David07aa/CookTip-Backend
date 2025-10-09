const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  console.log('📊 开始检查数据库状态...\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    // 1. 检查所有表
    console.log('1️⃣ 检查数据库表：');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('现有表：', tables.map(t => Object.values(t)[0]));
    console.log('');

    // 2. 检查 categories 表
    console.log('2️⃣ 检查 categories 表：');
    try {
      const [categories] = await connection.query('SELECT * FROM categories');
      console.log(`✅ categories 表存在，共有 ${categories.length} 条数据`);
      if (categories.length > 0) {
        console.log('分类列表：');
        categories.forEach(cat => {
          console.log(`  - ID: ${cat.id}, 名称: ${cat.name}`);
        });
      }
    } catch (error) {
      console.log('❌ categories 表不存在或查询失败：', error.message);
    }
    console.log('');

    // 3. 检查 recipes 表
    console.log('3️⃣ 检查 recipes 表：');
    try {
      const [recipes] = await connection.query('SELECT id, title, category_id, author_id FROM recipes LIMIT 5');
      console.log(`✅ recipes 表存在，前 5 条记录：`);
      recipes.forEach(r => {
        console.log(`  - ID: ${r.id}, 标题: ${r.title}, 分类ID: ${r.category_id}, 作者ID: ${r.author_id}`);
      });
    } catch (error) {
      console.log('❌ recipes 表查询失败：', error.message);
    }
    console.log('');

    // 4. 检查 users 表
    console.log('4️⃣ 检查 users 表：');
    try {
      const [users] = await connection.query('SELECT id, nickname, openid FROM users LIMIT 5');
      console.log(`✅ users 表存在，共有 ${users.length} 条记录`);
    } catch (error) {
      console.log('❌ users 表查询失败：', error.message);
    }

  } finally {
    await connection.end();
  }
}

checkDatabase().catch(console.error);

