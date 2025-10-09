/**
 * 数据库迁移脚本
 * 步骤：
 * 1. 备份现有数据
 * 2. 删除旧表
 * 3. 创建新表结构 (使用 init.sql)
 * 4. 迁移数据（UUID → 自增ID，字段映射）
 * 5. 插入测试数据 (使用 seed.sql)
 * 6. 验证结果
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'mysql3.sqlpub.com',
  port: 3308,
  user: 'david_x',
  password: 'NVRvnX3rP88UyUET',
  database: 'onefoodlibrary',
  charset: 'utf8mb4',
};

const log = (message, emoji = '📝') => console.log(`${emoji} ${message}`);

async function migrateDatabase() {
  let connection;
  const backup = {
    users: [],
    recipes: [],
    categories: [],
  };

  try {
    log('连接数据库...', '🔌');
    connection = await mysql.createConnection(dbConfig);
    log('连接成功！', '✅');

    // ============================================
    // 步骤 1: 备份现有数据
    // ============================================
    log('\n备份现有数据...', '💾');
    console.log('='.repeat(70));

    // 备份用户
    const [oldUsers] = await connection.query('SELECT * FROM users');
    backup.users = oldUsers;
    log(`备份用户数据: ${oldUsers.length} 条`, '✅');
    oldUsers.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.openid} (ID: ${u.id})`);
    });

    // 备份食谱
    const [oldRecipes] = await connection.query('SELECT * FROM recipes');
    backup.recipes = oldRecipes;
    log(`\n备份食谱数据: ${oldRecipes.length} 条`, '✅');
    oldRecipes.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title} (作者: ${r.author_id})`);
    });

    // 备份分类
    const [oldCategories] = await connection.query('SELECT * FROM categories');
    backup.categories = oldCategories;
    log(`\n备份分类数据: ${oldCategories.length} 条`, '✅');

    // 保存备份到文件
    const backupFile = `backup_${Date.now()}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    log(`\n备份文件已保存: ${backupFile}`, '💾');

    // ============================================
    // 步骤 2: 删除旧表
    // ============================================
    log('\n\n删除旧表...', '🗑️');
    console.log('='.repeat(70));

    const tablesToDrop = [
      'shopping_list',
      'likes', 
      'favorites',
      'comments',
      'recipes',
      'categories',
      'follows',
      'shopping_lists',
      'users'
    ];

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const table of tablesToDrop) {
      try {
        await connection.query(`DROP TABLE IF EXISTS ${table}`);
        log(`删除表: ${table}`, '✅');
      } catch (err) {
        console.log(`  跳过: ${table} (${err.message})`);
      }
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    log('\n旧表删除完成', '✅');

    // ============================================
    // 步骤 3: 创建新表结构
    // ============================================
    log('\n\n创建新表结构...', '🏗️');
    console.log('='.repeat(70));

    const initSQL = fs.readFileSync(path.join(__dirname, 'database', 'init.sql'), 'utf8');
    
    // 分割并执行SQL语句
    const statements = initSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    let successCount = 0;
    for (const statement of statements) {
      if (statement && !statement.toLowerCase().includes('show tables')) {
        try {
          await connection.query(statement);
          successCount++;
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.log(`  警告: ${err.message.substring(0, 100)}`);
          }
        }
      }
    }

    log(`新表结构创建完成 (${successCount} 条SQL)`, '✅');

    // 验证表是否创建成功
    const [newTables] = await connection.query('SHOW TABLES');
    log(`\n新表列表 (${newTables.length} 张):`, '📊');
    newTables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // ============================================
    // 步骤 4: 迁移数据
    // ============================================
    log('\n\n迁移数据...', '🔄');
    console.log('='.repeat(70));

    // 创建 UUID → 新ID 的映射
    const userIdMap = new Map(); // oldUUID → newID
    const recipeIdMap = new Map(); // oldUUID → newID

    // 4.1 迁移用户
    log('\n迁移用户数据...', '👥');
    for (let i = 0; i < backup.users.length; i++) {
      const oldUser = backup.users[i];
      
      const [result] = await connection.query(
        `INSERT INTO users (openid, nickname, avatar, bio, recipe_count, follower_count, following_count, favorite_count) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          oldUser.openid,
          oldUser.nick_name || '美食爱好者',
          oldUser.avatar || '',
          oldUser.bio || '',
          oldUser.recipe_count || 0,
          oldUser.followers || 0,
          oldUser.following || 0,
          0 // favorite_count
        ]
      );

      const newUserId = result.insertId;
      userIdMap.set(oldUser.id, newUserId);
      
      log(`  ✅ ${oldUser.openid} (UUID: ${oldUser.id} → ID: ${newUserId})`, '');
    }

    // 4.2 更新分类的 recipe_count（先设为0，稍后更新）
    log('\n准备分类数据...', '📂');
    await connection.query('UPDATE categories SET recipe_count = 0');

    // 4.3 迁移食谱
    log('\n迁移食谱数据...', '📖');
    
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

    for (let i = 0; i < backup.recipes.length; i++) {
      const oldRecipe = backup.recipes[i];
      
      // 映射作者ID
      const newAuthorId = userIdMap.get(oldRecipe.author_id);
      if (!newAuthorId) {
        log(`  ⚠️  跳过食谱 "${oldRecipe.title}" (找不到作者)`, '');
        continue;
      }

      // 映射分类
      let categoryId = categoryNameToId[oldRecipe.category] || 5; // 默认为家常菜

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
          oldRecipe.title,
          oldRecipe.cover_image || '',
          oldRecipe.introduction || '',
          oldRecipe.difficulty || '简单',
          oldRecipe.cook_time || 30,
          oldRecipe.servings || 2,
          oldRecipe.taste || '',
          oldRecipe.ingredients ? JSON.stringify(oldRecipe.ingredients) : '[]',
          oldRecipe.steps ? JSON.stringify(oldRecipe.steps) : '[]',
          oldRecipe.tips || '',
          oldRecipe.tags ? JSON.stringify(oldRecipe.tags) : '[]',
          oldRecipe.nutrition ? JSON.stringify(oldRecipe.nutrition) : null,
          oldRecipe.likes || 0,
          oldRecipe.collects || 0, // collects → favorites
          oldRecipe.comments || 0,
          oldRecipe.views || 0,
          oldRecipe.status || 'published'
        ]
      );

      const newRecipeId = result.insertId;
      recipeIdMap.set(oldRecipe.id, newRecipeId);
      
      const [category] = await connection.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
      const categoryName = category && category.length > 0 ? category[0].name : oldRecipe.category;
      log(`  ✅ ${oldRecipe.title} → ${categoryName} (ID: ${newRecipeId})`, '');
    }

    // 4.4 更新分类的食谱数量
    log('\n更新分类统计...', '📊');
    await connection.query(`
      UPDATE categories c
      SET recipe_count = (
        SELECT COUNT(*) FROM recipes r WHERE r.category_id = c.id
      )
    `);

    // ============================================
    // 步骤 5: 插入测试数据
    // ============================================
    log('\n\n插入额外测试数据...', '🎲');
    console.log('='.repeat(70));

    const seedSQL = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
    const seedStatements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().includes('select'));

    for (const statement of seedStatements) {
      if (statement) {
        try {
          await connection.query(statement);
        } catch (err) {
          // 忽略重复数据错误
          if (!err.message.includes('Duplicate entry')) {
            console.log(`  警告: ${err.message.substring(0, 80)}`);
          }
        }
      }
    }

    log('测试数据插入完成', '✅');

    // ============================================
    // 步骤 6: 验证结果
    // ============================================
    log('\n\n验证迁移结果...', '🔍');
    console.log('='.repeat(70));

    // 统计数据
    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM recipes) as recipes,
        (SELECT COUNT(*) FROM comments) as comments,
        (SELECT COUNT(*) FROM favorites) as favorites,
        (SELECT COUNT(*) FROM likes) as likes
    `);

    log('\n📈 数据统计:', '');
    console.log(`  👥 用户: ${stats[0].users} 个 (原有: ${backup.users.length})`);
    console.log(`  📂 分类: ${stats[0].categories} 个`);
    console.log(`  📖 食谱: ${stats[0].recipes} 个 (原有: ${backup.recipes.length})`);
    console.log(`  💬 评论: ${stats[0].comments} 条`);
    console.log(`  ⭐ 收藏: ${stats[0].favorites} 个`);
    console.log(`  👍 点赞: ${stats[0].likes} 个`);

    // 显示迁移的食谱
    log('\n📖 迁移的食谱列表:', '');
    const [migratedRecipes] = await connection.query(`
      SELECT 
        r.id, r.title, r.difficulty, r.cook_time, r.likes, r.views,
        c.name as category_name,
        u.nickname as author_name
      FROM recipes r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.id
      LIMIT 10
    `);

    migratedRecipes.forEach((recipe, i) => {
      console.log(`  ${i + 1}. ${recipe.title}`);
      console.log(`     作者: ${recipe.author_name} | 分类: ${recipe.category_name}`);
      console.log(`     [${recipe.difficulty}] ${recipe.cook_time}分钟 | 👍${recipe.likes} 👁${recipe.views}`);
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
    log('\n\n' + '='.repeat(70), '');
    log('🎉 数据库迁移完成！', '');
    log('='.repeat(70), '');
    
    log(`\n✅ 原有数据已迁移: ${backup.users.length} 个用户, ${backup.recipes.length} 个食谱`, '');
    log(`✅ 测试数据已添加`, '');
    log(`✅ 表结构已更新为新版本`, '');
    log(`✅ 备份文件: ${backupFile}`, '');
    
    log('\n💡 下一步:', '');
    log('   1. 重新部署后端服务', '');
    log('   2. 测试 API 接口', '');
    log('   3. 确认前端能正常访问\n', '');

  } catch (error) {
    log(`\n❌ 错误: ${error.message}`, '');
    console.error(error);
    
    log('\n⚠️  如果迁移失败，可以使用备份文件恢复数据', '');
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log('🔌 数据库连接已关闭\n', '');
    }
  }
}

// 运行迁移
console.log('\n' + '='.repeat(70));
console.log('🚀 开始数据库迁移...');
console.log('='.repeat(70));

migrateDatabase();

