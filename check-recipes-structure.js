const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRecipesStructure() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    console.log('📋 检查 recipes 表结构：\n');
    const [columns] = await connection.query('DESCRIBE recipes');
    console.table(columns);

    console.log('\n📊 检查 recipes 数据：\n');
    const [recipes] = await connection.query('SELECT * FROM recipes LIMIT 3');
    console.log(`共有 ${recipes.length} 条记录\n`);
    if (recipes.length > 0) {
      console.log('第一条记录的字段：');
      console.log(Object.keys(recipes[0]));
      console.log('\n记录详情：');
      recipes.forEach((r, i) => {
        console.log(`\n记录 ${i + 1}:`);
        console.log(JSON.stringify(r, null, 2));
      });
    }
  } finally {
    await connection.end();
  }
}

checkRecipesStructure().catch(console.error);

