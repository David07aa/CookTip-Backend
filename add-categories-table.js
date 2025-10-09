/**
 * 添加缺失的 categories 表
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

async function addCategoriesTable() {
  let connection;

  try {
    console.log('🔌 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接成功！\n');

    // 1. 检查 categories 表是否存在
    const [tables] = await connection.query("SHOW TABLES LIKE 'categories'");
    
    if (tables.length > 0) {
      console.log('⚠️  categories 表已存在');
      
      // 检查数据
      const [count] = await connection.query('SELECT COUNT(*) as count FROM categories');
      console.log(`📊 现有分类数据: ${count[0].count} 条\n`);
      
      if (count[0].count > 0) {
        console.log('📂 现有分类列表:');
        const [categories] = await connection.query('SELECT id, name, recipe_count FROM categories ORDER BY sort_order');
        categories.forEach(cat => {
          console.log(`  ${cat.id}. ${cat.name} (${cat.recipe_count} 个食谱)`);
        });
        
        console.log('\n✅ categories 表和数据都已存在，无需操作');
        return;
      }
    } else {
      console.log('📝 创建 categories 表...');
      
      // 创建 categories 表
      await connection.query(`
        CREATE TABLE categories (
          id INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
          name VARCHAR(50) NOT NULL COMMENT '分类名称',
          icon VARCHAR(255) DEFAULT NULL COMMENT '图标URL',
          description VARCHAR(200) DEFAULT NULL COMMENT '描述',
          recipe_count INT DEFAULT 0 COMMENT '食谱数量',
          sort_order INT DEFAULT 0 COMMENT '排序',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表'
      `);
      
      console.log('✅ categories 表创建成功！\n');
    }

    // 2. 插入初始分类数据
    console.log('📝 插入初始分类数据...');
    
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
          console.log(`  ⚠️  ${cat.name} (已存在，跳过)`);
        } else {
          console.log(`  ❌ ${cat.name} (错误: ${err.message})`);
        }
      }
    }

    // 3. 验证
    console.log('\n🔍 验证结果...');
    const [finalCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
    console.log(`✅ 分类总数: ${finalCount[0].count} 条\n`);

    const [allCategories] = await connection.query('SELECT id, name, recipe_count FROM categories ORDER BY sort_order');
    console.log('📂 所有分类:');
    allCategories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name} (${cat.recipe_count} 个食谱)`);
    });

    console.log('\n🎉 categories 表添加完成！');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

addCategoriesTable();

