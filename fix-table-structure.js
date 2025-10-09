/**
 * 修复表结构 - 添加缺失的字段
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

async function fixTableStructure() {
  let connection;

  try {
    console.log('🔌 连接数据库...\n');
    connection = await mysql.createConnection(dbConfig);

    // 1. 检查 recipes 表结构
    console.log('📊 检查 recipes 表结构...');
    console.log('='.repeat(60));
    const [columns] = await connection.query('DESCRIBE recipes');
    
    const fieldNames = columns.map(col => col.Field);
    console.log('现有字段:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // 2. 需要添加的字段
    const fieldsToAdd = {
      'category_id': {
        sql: 'ADD COLUMN category_id INT DEFAULT NULL COMMENT \'分类ID\' AFTER user_id',
        check: !fieldNames.includes('category_id')
      },
    };

    console.log('\n📝 检查需要添加的字段...');
    let hasChanges = false;

    for (const [fieldName, config] of Object.entries(fieldsToAdd)) {
      if (config.check) {
        console.log(`  ⚠️  缺少字段: ${fieldName}`);
        hasChanges = true;
      } else {
        console.log(`  ✅ 已存在: ${fieldName}`);
      }
    }

    // 3. 添加缺失的字段
    if (hasChanges) {
      console.log('\n🔧 正在修复表结构...');
      
      for (const [fieldName, config] of Object.entries(fieldsToAdd)) {
        if (config.check) {
          try {
            await connection.query(`ALTER TABLE recipes ${config.sql}`);
            console.log(`  ✅ 添加字段: ${fieldName}`);
          } catch (err) {
            console.log(`  ❌ 添加失败: ${fieldName} (${err.message})`);
          }
        }
      }

      // 4. 添加索引
      console.log('\n📌 添加索引...');
      try {
        await connection.query('ALTER TABLE recipes ADD INDEX idx_category_id (category_id)');
        console.log('  ✅ 添加索引: idx_category_id');
      } catch (err) {
        if (!err.message.includes('Duplicate key name')) {
          console.log(`  ⚠️  ${err.message}`);
        } else {
          console.log('  ✅ 索引已存在');
        }
      }

      console.log('\n✅ 表结构修复完成！');
    } else {
      console.log('\n✅ 表结构完整，无需修复');
    }

    // 5. 显示修复后的表结构
    console.log('\n📊 修复后的 recipes 表结构:');
    console.log('='.repeat(60));
    const [newColumns] = await connection.query('DESCRIBE recipes');
    newColumns.forEach((col, index) => {
      const key = col.Key ? ` [${col.Key}]` : '';
      console.log(`  ${index + 1}. ${col.Field.padEnd(20)} ${col.Type}${key}`);
    });

    // 6. 自动分配分类
    console.log('\n🏷️  自动分配食谱分类...');
    const [uncategorized] = await connection.query('SELECT COUNT(*) as count FROM recipes WHERE category_id IS NULL');
    
    if (uncategorized[0].count > 0) {
      console.log(`发现 ${uncategorized[0].count} 个未分类食谱\n`);
      
      const categoryMap = {
        '红烧': 1,    // 中餐
        '宫保': 1,    // 中餐
        '番茄': 5,    // 家常菜
        '炒蛋': 5,    // 家常菜
        '蛋糕': 4,    // 烘焙甜点
        '戚风': 4,    // 烘焙甜点
        '排骨': 5,    // 家常菜
        '拿铁': 10,   // 饮品
        '抹茶': 10,   // 饮品
        '咖啡': 10,   // 饮品
        '鸡': 1,      // 中餐
        '丁': 1,      // 中餐
      };

      const [recipesToUpdate] = await connection.query('SELECT id, title FROM recipes WHERE category_id IS NULL');
      
      for (const recipe of recipesToUpdate) {
        let categoryId = 5; // 默认为家常菜
        
        // 根据标题匹配分类
        for (const [keyword, catId] of Object.entries(categoryMap)) {
          if (recipe.title.includes(keyword)) {
            categoryId = catId;
            break;
          }
        }
        
        await connection.query('UPDATE recipes SET category_id = ? WHERE id = ?', [categoryId, recipe.id]);
        const [catInfo] = await connection.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
        console.log(`  ✅ ${recipe.title.padEnd(20)} → ${catInfo[0].name}`);
      }
      
      // 更新分类的食谱数量
      await connection.query(`
        UPDATE categories c
        SET recipe_count = (
          SELECT COUNT(*) FROM recipes r WHERE r.category_id = c.id
        )
      `);
      
      console.log('\n✅ 分类分配完成！');
    } else {
      console.log('所有食谱都已分类');
    }

    // 7. 显示最终结果
    console.log('\n📂 分类统计:');
    console.log('='.repeat(60));
    const [categories] = await connection.query(`
      SELECT 
        c.id,
        c.name,
        c.recipe_count,
        COUNT(r.id) as actual_count
      FROM categories c
      LEFT JOIN recipes r ON r.category_id = c.id
      GROUP BY c.id, c.name, c.recipe_count
      ORDER BY c.sort_order
    `);
    
    categories.forEach(cat => {
      const emoji = cat.recipe_count > 0 ? '✅' : '⚪';
      console.log(`  ${emoji} ${cat.name.padEnd(15)} ${cat.recipe_count} 个食谱`);
    });

    console.log('\n🎉 所有修复完成！数据库已就绪！');
    console.log('\n💡 提示: 现在可以测试 API 接口了');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭\n');
    }
  }
}

fixTableStructure();

