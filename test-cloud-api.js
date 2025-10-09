const https = require('https');

const BASE_URL = 'https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com';

async function testAPI(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    console.log(`\n🔍 测试: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 状态码: ${res.statusCode}`);
        console.log(`📄 响应头:`, res.headers);
        
        try {
          const json = JSON.parse(data);
          console.log(`✅ 响应内容:`, JSON.stringify(json, null, 2));
        } catch (e) {
          console.log(`❌ 响应内容（非JSON）:`, data.substring(0, 500));
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ 请求失败:`, err.message);
      reject(err);
    });
  });
}

async function runTests() {
  console.log('🚀 开始测试云托管 API...\n');
  console.log('=' .repeat(80));
  
  try {
    // 测试 1: 分类列表
    await testAPI('/api/v1/categories');
    console.log('=' .repeat(80));
    
    // 测试 2: 食谱列表 - latest
    await testAPI('/api/v1/recipes?page=1&limit=10&sort=latest');
    console.log('=' .repeat(80));
    
    // 测试 3: 食谱列表 - recommended (问题接口)
    await testAPI('/api/v1/recipes?page=1&limit=10&sort=recommended');
    console.log('=' .repeat(80));
    
    // 测试 4: 单个食谱详情
    await testAPI('/api/v1/recipes/4');
    console.log('=' .repeat(80));
    
    // 测试 5: 评论列表
    await testAPI('/api/v1/comments?recipeId=4&page=1&limit=10');
    console.log('=' .repeat(80));
    
  } catch (error) {
    console.error('测试过程出错:', error);
  }
  
  console.log('\n✅ 测试完成！');
}

runTests();

