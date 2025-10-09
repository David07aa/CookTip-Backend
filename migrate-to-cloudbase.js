/**
 * 数据库迁移工具：从 SQLPub 迁移到微信云托管数据库
 * 
 * 源数据库：SQLPub (mysql3.sqlpub.com:3308)
 * 目标数据库：微信云托管 MySQL (sh-cynosdbmysql-grp-pjq5f472.sql.tencentcdb.com:27821)
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// 源数据库配置（SQLPub）
const SOURCE_DB = {
  host: 'mysql3.sqlpub.com',
  port: 3308,
  user: 'david_x',
  password: 'NVRvnX3rP88UyUET',
  database: 'onefoodlibrary',
  charset: 'utf8mb4'
};

// 目标数据库配置（微信云托管）
const TARGET_DB = {
  host: 'sh-cynosdbmysql-grp-qksrb4s2.sql.tencentcdb.com', // 外网地址
  port: 23831,
  user: 'root',
  password: '050710Xzl',
  database: 'cooktip',
  charset: 'utf8mb4'
};

// 需要迁移的表
const TABLES = [
  'users',
  'recipes',
  'categories',
  'comments',
  'favorites',
  'likes',
  'shopping_list'
];

async function exportTable(sourceConn, tableName) {
  console.log(`📤 导出表: ${tableName}`);
  
  // 获取表数据
  const [rows] = await sourceConn.query(`SELECT * FROM ${tableName}`);
  console.log(`   找到 ${rows.length} 条记录`);
  
  return rows;
}

async function importTable(targetConn, tableName, data) {
  if (data.length === 0) {
    console.log(`   ⏭️  ${tableName} 没有数据，跳过`);
    return;
  }
  
  console.log(`📥 导入表: ${tableName}`);
  
  // 获取列名
  const columns = Object.keys(data[0]);
  const placeholders = columns.map(() => '?').join(', ');
  const columnNames = columns.join(', ');
  
  // 批量插入（每次10条，避免SQL过长）
  const batchSize = 10;
  let imported = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch.map(row => 
      columns.map(col => {
        const value = row[col];
        // 处理 Date 类型
        if (value instanceof Date) {
          return value;
        }
        // 处理 JSON 字段：将对象序列化为字符串
        if (value !== null && typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      })
    );
    
    // 构建批量插入 SQL
    const sql = `INSERT INTO ${tableName} (${columnNames}) VALUES ${
      batch.map(() => `(${placeholders})`).join(', ')
    } ON DUPLICATE KEY UPDATE ${
      columns.map(col => `\`${col}\` = VALUES(\`${col}\`)`).join(', ')
    }`;
    
    const flatValues = values.flat();
    await targetConn.query(sql, flatValues);
    
    imported += batch.length;
    console.log(`   ✅ 已导入 ${imported}/${data.length}`);
  }
  
  console.log(`   ✅ ${tableName} 导入完成\n`);
}

async function migrate() {
  let sourceConn, targetConn;
  
  try {
    console.log('🚀 开始数据库迁移...\n');
    console.log('=' .repeat(60));
    
    // 检查目标数据库配置
    if (!TARGET_DB.user || !TARGET_DB.password) {
      console.error('❌ 错误：请先配置目标数据库的账号密码！');
      console.log('\n请编辑 migrate-to-cloudbase.js 文件：');
      console.log('  TARGET_DB.user = "您的数据库账号"');
      console.log('  TARGET_DB.password = "您的数据库密码"\n');
      process.exit(1);
    }
    
    // 连接源数据库
    console.log('🔗 连接源数据库 (SQLPub)...');
    sourceConn = await mysql.createConnection(SOURCE_DB);
    console.log('✅ 源数据库连接成功\n');
    
    // 连接目标数据库
    console.log('🔗 连接目标数据库 (微信云托管)...');
    targetConn = await mysql.createConnection(TARGET_DB);
    console.log('✅ 目标数据库连接成功\n');
    
    console.log('=' .repeat(60));
    console.log('\n📊 开始迁移数据...\n');
    
    const migrationData = {};
    
    // 1. 导出所有表数据
    console.log('📦 第一步：导出数据\n');
    for (const table of TABLES) {
      migrationData[table] = await exportTable(sourceConn, table);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('\n📥 第二步：导入数据\n');
    
    // 2. 按顺序导入（考虑外键依赖）
    const importOrder = [
      'users',
      'categories',
      'recipes',
      'comments',
      'favorites',
      'likes',
      'shopping_list'
    ];
    
    for (const table of importOrder) {
      await importTable(targetConn, table, migrationData[table]);
    }
    
    // 3. 验证迁移结果
    console.log('=' .repeat(60));
    console.log('\n🔍 第三步：验证迁移结果\n');
    
    for (const table of TABLES) {
      const [sourceCount] = await sourceConn.query(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      const [targetCount] = await targetConn.query(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      
      const match = sourceCount[0].count === targetCount[0].count ? '✅' : '❌';
      console.log(`${match} ${table.padEnd(20)} 源: ${sourceCount[0].count}  目标: ${targetCount[0].count}`);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ 数据库迁移完成！\n');
    
    // 4. 更新图片URL到对象存储（如果需要）
    console.log('🔄 检查是否需要更新图片URL...\n');
    const [needUpdate] = await targetConn.query(`
      SELECT COUNT(*) as count 
      FROM recipes 
      WHERE cover_image LIKE 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/%'
    `);
    
    if (needUpdate[0].count > 0) {
      console.log(`找到 ${needUpdate[0].count} 条需要更新图片URL的记录`);
      console.log('正在更新到对象存储...\n');
      
      await targetConn.query(`
        UPDATE recipes 
        SET cover_image = REPLACE(
          cover_image,
          'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/',
          'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com/laoxiangji/'
        )
        WHERE cover_image LIKE 'https://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com/uploads/images/laoxiangji/%'
      `);
      
      console.log('✅ 图片URL已更新到对象存储\n');
    } else {
      console.log('✅ 图片URL已经是对象存储格式，无需更新\n');
    }
    
    console.log('=' .repeat(60));
    console.log('\n📌 后续步骤：\n');
    console.log('1. 更新 .env 文件，使用新的数据库配置');
    console.log('2. 重启后端服务');
    console.log('3. 测试 API 接口');
    console.log('4. 配置小程序域名白名单（如果还没配置）\n');
    
  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('详细信息:', error);
    process.exit(1);
  } finally {
    if (sourceConn) await sourceConn.end();
    if (targetConn) await targetConn.end();
    console.log('🔌 数据库连接已关闭');
  }
}

// 执行迁移
migrate();

