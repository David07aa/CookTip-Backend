/**
 * 验证对象存储URL是否正确配置
 */

const mysql = require('mysql2/promise');
const axios = require('axios');

// 数据库配置
const DB_CONFIG = {
  host: 'mysql3.sqlpub.com',
  port: 3308,
  user: 'david_x',
  password: 'NVRvnX3rP88UyUET',
  database: 'onefoodlibrary',
  charset: 'utf8mb4'
};

// 对象存储基础URL
const STORAGE_BASE_URL = 'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage.ap-shanghai.myqcloud.com';

async function verifyDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('🔗 数据库连接成功！\n');

    // 统计各种URL类型
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN cover_image LIKE 'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage%' THEN 1 END) as storage_images,
        COUNT(CASE WHEN cover_image LIKE '/uploads/images/%' THEN 1 END) as local_uploads,
        COUNT(CASE WHEN cover_image LIKE '/images/%' THEN 1 END) as local_images,
        COUNT(CASE WHEN cover_image IS NULL OR cover_image = '' THEN 1 END) as no_image
      FROM recipes
    `);

    const stat = stats[0];

    console.log('📊 数据库统计：');
    console.log('='.repeat(60));
    console.log(`总食谱数：        ${stat.total}`);
    console.log(`✅ 对象存储图片：  ${stat.storage_images} 条`);
    console.log(`⚠️  本地路径1：     ${stat.local_uploads} 条 (/uploads/images/)`);
    console.log(`⚠️  本地路径2：     ${stat.local_images} 条 (/images/)`);
    console.log(`❌ 无图片：        ${stat.no_image} 条`);
    console.log('='.repeat(60) + '\n');

    // 检查是否还有未迁移的图片
    if (stat.local_uploads > 0 || stat.local_images > 0) {
      console.log('⚠️  警告：还有未迁移到对象存储的图片！');
      console.log('   请运行：node update-to-storage.js\n');
    } else {
      console.log('✅ 所有图片已迁移到对象存储！\n');
    }

    // 获取示例URL
    const [samples] = await connection.execute(`
      SELECT id, title, cover_image 
      FROM recipes 
      WHERE cover_image LIKE 'https://796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091.storage%' 
      ORDER BY id 
      LIMIT 5
    `);

    if (samples.length > 0) {
      console.log('📋 对象存储URL示例：\n');
      samples.forEach((r, index) => {
        console.log(`${index + 1}. [${r.id}] ${r.title}`);
        console.log(`   ${r.cover_image}\n`);
      });

      // 测试第一个URL的可访问性
      console.log('🔍 测试图片可访问性...\n');
      const testUrl = samples[0].cover_image;
      
      try {
        const response = await axios.head(testUrl, { 
          timeout: 10000,
          validateStatus: (status) => status < 500 
        });
        
        if (response.status === 200) {
          console.log(`✅ 图片访问成功！`);
          console.log(`   URL: ${testUrl}`);
          console.log(`   状态码: ${response.status}`);
          console.log(`   Content-Type: ${response.headers['content-type']}\n`);
        } else if (response.status === 403) {
          console.log(`⚠️  图片访问被拒绝（403）`);
          console.log(`   可能原因：存储桶权限设置为私有`);
          console.log(`   解决方案：在对象存储控制台设置为"公开读，私有写"\n`);
        } else if (response.status === 404) {
          console.log(`❌ 图片不存在（404）`);
          console.log(`   请确认图片已上传到对象存储\n`);
        } else {
          console.log(`⚠️  意外的状态码：${response.status}\n`);
        }
      } catch (error) {
        if (error.code === 'ENOTFOUND') {
          console.log(`❌ 域名解析失败`);
          console.log(`   请检查存储桶名称和地域是否正确\n`);
        } else if (error.code === 'ETIMEDOUT') {
          console.log(`❌ 请求超时`);
          console.log(`   请检查网络连接\n`);
        } else {
          console.log(`❌ 访问失败: ${error.message}\n`);
        }
      }
    }

    console.log('📌 配置清单：\n');
    console.log('1️⃣  对象存储配置：');
    console.log(`   存储桶：796a-yjsp-wxxcx-2g4wvlv66f316313-1367462091`);
    console.log(`   地域：ap-shanghai`);
    console.log(`   基础URL：${STORAGE_BASE_URL}`);
    console.log(`   访问权限：✅ 公开读，私有写\n`);

    console.log('2️⃣  小程序域名白名单：');
    console.log(`   登录：https://mp.weixin.qq.com`);
    console.log(`   路径：开发 → 开发管理 → 开发设置 → 服务器域名`);
    console.log(`   配置 downloadFile 合法域名：`);
    console.log(`   ${STORAGE_BASE_URL}\n`);

    console.log('3️⃣  后端配置（.env）：');
    console.log(`   CDN_BASE_URL=${STORAGE_BASE_URL}\n`);

    console.log('4️⃣  清理后端 uploads 目录：');
    console.log(`   - 修改 Dockerfile 移除 COPY uploads`);
    console.log(`   - 更新 .dockerignore 添加 uploads`);
    console.log(`   - 重新部署后端\n`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

console.log('🚀 开始验证对象存储配置...\n');
verifyDatabase().catch(error => {
  console.error('💥 程序执行失败:', error);
  process.exit(1);
});

