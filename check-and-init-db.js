/**
 * 数据库检查和初始化脚本
 * 功能：
 * 1. 连接到 SQLPub 数据库
 * 2. 检查表是否存在
 * 3. 检查数据是否存在
 * 4. 根据情况执行初始化脚本
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
  host: 'mysql3.sqlpub.com',
  port: 3308,
  user: 'david_x',
  password: 'NVRvnX3rP88UyUET',
  database: 'onefoodlibrary',
  charset: 'utf8mb4',
  multipleStatements: true, // 允许执行多条SQL语句
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkAndInitDatabase() {
  let connection;

  try {
    // 1. 连接数据库
    log('\n🔌 正在连接数据库...', 'cyan');
    connection = await mysql.createConnection(dbConfig);
    log('✅ 数据库连接成功！', 'green');

    // 2. 检查表是否存在
    log('\n📊 检查数据库表...', 'cyan');
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    log(`\n当前数据库中的表 (${tableNames.length} 张):`, 'blue');
    if (tableNames.length > 0) {
      tableNames.forEach(name => log(`  - ${name}`, 'blue'));
    } else {
      log('  ❌ 没有找到任何表', 'red');
    }

    // 3. 检查各表的数据
    const needInit = tableNames.length === 0;
    const needSeed = tableNames.length > 0;

    if (tableNames.length > 0) {
      log('\n📈 检查表中的数据...', 'cyan');
      
      const tablesToCheck = ['users', 'categories', 'recipes', 'comments', 'favorites', 'likes', 'shopping_list'];
      
      for (const tableName of tablesToCheck) {
        if (tableNames.includes(tableName)) {
          try {
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            const count = rows[0].count;
            
            if (count > 0) {
              log(`  ✅ ${tableName}: ${count} 条数据`, 'green');
            } else {
              log(`  ⚠️  ${tableName}: 0 条数据（空表）`, 'yellow');
            }
          } catch (error) {
            log(`  ❌ ${tableName}: 读取失败 (${error.message})`, 'red');
          }
        }
      }

      // 4. 显示分类数据详情
      if (tableNames.includes('categories')) {
        log('\n📂 分类列表详情:', 'cyan');
        const [categories] = await connection.query('SELECT id, name, recipe_count FROM categories ORDER BY sort_order');
        if (categories.length > 0) {
          categories.forEach(cat => {
            log(`  ${cat.id}. ${cat.name} (${cat.recipe_count} 个食谱)`, 'blue');
          });
        } else {
          log('  ⚠️  没有分类数据，需要插入初始数据', 'yellow');
        }
      }

      // 5. 显示食谱数据详情
      if (tableNames.includes('recipes')) {
        log('\n📖 食谱列表详情:', 'cyan');
        const [recipes] = await connection.query('SELECT id, title, difficulty, cook_time, likes, views FROM recipes LIMIT 10');
        if (recipes.length > 0) {
          recipes.forEach(recipe => {
            log(`  ${recipe.id}. ${recipe.title} [${recipe.difficulty}] ${recipe.cook_time}分钟 | 👍${recipe.likes} 👁${recipe.views}`, 'blue');
          });
          if (recipes.length === 10) {
            log('  ... (只显示前10条)', 'blue');
          }
        } else {
          log('  ⚠️  没有食谱数据，需要插入测试数据', 'yellow');
        }
      }
    }

    // 6. 询问是否需要执行初始化
    log('\n' + '='.repeat(60), 'cyan');
    log('📋 数据库状态总结:', 'cyan');
    log('='.repeat(60), 'cyan');

    if (needInit) {
      log('❌ 数据库表未创建', 'red');
      log('✅ 建议：执行 init.sql 创建表结构', 'green');
      log('✅ 建议：执行 seed.sql 插入测试数据', 'green');
      
      // 执行初始化
      await executeInitSQL(connection);
      await executeSeedSQL(connection);
      
    } else {
      log('✅ 数据库表已存在', 'green');
      
      // 检查是否有数据
      const [categoriesCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
      const [recipesCount] = await connection.query('SELECT COUNT(*) as count FROM recipes');
      
      if (categoriesCount[0].count === 0 || recipesCount[0].count === 0) {
        log('⚠️  部分表没有数据', 'yellow');
        log('✅ 建议：执行 seed.sql 插入测试数据', 'green');
        
        // 询问是否执行
        log('\n是否执行 seed.sql 插入测试数据？', 'yellow');
        await executeSeedSQL(connection);
      } else {
        log('✅ 数据库已有数据，无需初始化', 'green');
      }
    }

    // 7. 最终验证
    log('\n🔍 最终验证...', 'cyan');
    const [finalTables] = await connection.query('SHOW TABLES');
    const [finalCategories] = await connection.query('SELECT COUNT(*) as count FROM categories');
    const [finalRecipes] = await connection.query('SELECT COUNT(*) as count FROM recipes');
    
    log(`\n✅ 数据库表: ${finalTables.length} 张`, 'green');
    log(`✅ 分类数据: ${finalCategories[0].count} 条`, 'green');
    log(`✅ 食谱数据: ${finalRecipes[0].count} 条`, 'green');
    
    log('\n🎉 数据库检查和初始化完成！', 'green');

  } catch (error) {
    log(`\n❌ 错误: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log('\n🔌 数据库连接已关闭', 'cyan');
    }
  }
}

// 执行 init.sql
async function executeInitSQL(connection) {
  try {
    log('\n📝 正在执行 init.sql...', 'cyan');
    const initSQL = fs.readFileSync(path.join(__dirname, 'database', 'init.sql'), 'utf8');
    
    // 分割SQL语句并执行
    const statements = initSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await connection.query(statement);
        } catch (err) {
          // 忽略一些常见的非错误提示
          if (!err.message.includes('already exists')) {
            console.log(`  警告: ${err.message}`);
          }
        }
      }
    }
    
    log('✅ init.sql 执行成功！', 'green');
  } catch (error) {
    log(`❌ 执行 init.sql 失败: ${error.message}`, 'red');
    throw error;
  }
}

// 执行 seed.sql
async function executeSeedSQL(connection) {
  try {
    log('\n📝 正在执行 seed.sql...', 'cyan');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
    
    // 分割SQL语句并执行
    const statements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await connection.query(statement);
        } catch (err) {
          // 忽略重复数据错误
          if (!err.message.includes('Duplicate entry')) {
            console.log(`  警告: ${err.message}`);
          }
        }
      }
    }
    
    log('✅ seed.sql 执行成功！', 'green');
  } catch (error) {
    log(`❌ 执行 seed.sql 失败: ${error.message}`, 'red');
    throw error;
  }
}

// 运行脚本
checkAndInitDatabase();

