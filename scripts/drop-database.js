// 删除整个数据库
// 警告：这会删除整个数据库！

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.production' });

async function dropDatabase() {
  console.log('========================================');
  console.log('  🚨 删除整个 PostgreSQL 数据库');
  console.log('========================================');
  console.log('');
  console.log('警告：即将删除整个数据库实例！');
  console.log('');
  
  // 获取数据库连接
  const dbUrl = (process.env.POSTGRES_URL || process.env.DATABASE_URL || '').trim().replace(/\\r\\n/g, '');
  
  if (!dbUrl) {
    throw new Error('未找到数据库连接字符串！请检查环境变量。');
  }
  
  // 解析数据库连接字符串
  const url = new URL(dbUrl);
  const dbName = url.pathname.substring(1); // 去掉开头的 '/'
  
  console.log('数据库主机: ' + url.hostname);
  console.log('数据库名称: ' + dbName);
  console.log('');
  
  try {
    // 连接到 postgres 默认数据库
    const postgresUrl = dbUrl.replace(`/${dbName}`, '/postgres');
    const sql = neon(postgresUrl);
    
    console.log('【1】断开所有现有连接...');
    
    // 终止所有连接到目标数据库的会话
    try {
      await sql([`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '${dbName}'
        AND pid <> pg_backend_pid();
      `]);
      console.log('  ✅ 已断开所有连接');
    } catch (error) {
      console.log('  ⚠️  断开连接时出错: ' + error.message);
    }
    
    console.log('');
    console.log('【2】删除数据库...');
    
    try {
      await sql([`DROP DATABASE IF EXISTS "${dbName}"`]);
      console.log('  ✅ 数据库已删除！');
      console.log('');
      console.log('========================================');
      console.log('  数据库删除成功');
      console.log('========================================');
      console.log('');
      console.log('⚠️  重要提示：');
      console.log('1. 数据库已完全删除');
      console.log('2. Neon 项目仍然存在');
      console.log('3. 需要创建新数据库或删除 Neon 项目');
      console.log('4. DATABASE_URL 环境变量已失效');
      console.log('');
    } catch (error) {
      console.error('  ❌ 删除失败: ' + error.message);
      console.log('');
      console.log('可能的原因：');
      console.log('1. 还有活动连接（请稍后重试）');
      console.log('2. 权限不足');
      console.log('3. 数据库不存在');
      console.log('');
      throw error;
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ 执行失败:', error.message);
    console.error('');
    console.error('建议：在 Neon Dashboard 中手动删除数据库或项目');
    console.error('网址: https://console.neon.tech');
    console.error('');
    throw error;
  }
}

// 执行删除
dropDatabase()
  .then(() => {
    console.log('脚本执行完成。');
    process.exit(0);
  })
  .catch(error => {
    console.error('脚本执行失败');
    process.exit(1);
  });

