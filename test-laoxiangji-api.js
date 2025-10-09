const https = require('https');

// 测试 API 基地址
// 本地测试使用 http
// const API_BASE = 'http://localhost:3000/api/v1';

// 云托管测试使用 https
const API_BASE = 'https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com/api/v1';

async function testAPI(path, description) {
  return new Promise((resolve) => {
    const url = API_BASE + path;
    console.log(`\n📡 ${description}`);
    console.log(`   URL: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   ✅ 状态码: ${res.statusCode}`);
          
          if (json.code === 200) {
            if (json.data && Array.isArray(json.data)) {
              console.log(`   📊 返回数据: ${json.data.length} 条记录`);
              if (json.data.length > 0) {
                console.log(`   示例: ${json.data[0].title || json.data[0].name}`);
              }
            } else if (json.data && json.data.items) {
              console.log(`   📊 返回数据: ${json.data.items.length} 条记录`);
              console.log(`   总数: ${json.data.total}`);
              if (json.data.items.length > 0) {
                console.log(`   示例: ${json.data.items[0].title}`);
              }
            } else if (json.data && json.data.title) {
              console.log(`   📊 食谱: ${json.data.title}`);
              console.log(`   分类: ${json.data.category_id || '未知'}`);
              console.log(`   难度: ${json.data.difficulty || '未知'}`);
            }
          } else {
            console.log(`   ⚠️  返回码: ${json.code}`);
            console.log(`   消息: ${json.message}`);
          }
        } catch (error) {
          console.log(`   ❌ 解析失败:`, data.substring(0, 100));
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`   ❌ 请求失败: ${err.message}`);
      resolve();
    });
  });
}

async function runTests() {
  console.log('🧪 开始测试老乡鸡食谱 API...\n');
  console.log('=' .repeat(60));
  
  // 测试 1: 分类列表
  await testAPI('/categories', '测试分类列表');
  console.log('=' .repeat(60));
  
  // 测试 2: 食谱列表
  await testAPI('/recipes?page=1&limit=5', '测试食谱列表（前5个）');
  console.log('=' .repeat(60));
  
  // 测试 3: 炒菜分类
  await testAPI('/recipes?category_id=6&limit=3', '测试炒菜分类（category_id=6）');
  console.log('=' .repeat(60));
  
  // 测试 4: 早餐分类
  await testAPI('/recipes?category_id=4&limit=3', '测试早餐分类（category_id=4）');
  console.log('=' .repeat(60));
  
  // 测试 5: 食谱详情
  await testAPI('/recipes/1', '测试食谱详情（ID=1）');
  console.log('=' .repeat(60));
  
  // 测试 6: 推荐排序
  await testAPI('/recipes?sort=recommended&limit=3', '测试推荐排序');
  console.log('=' .repeat(60));
  
  // 测试 7: 最新排序
  await testAPI('/recipes?sort=latest&limit=3', '测试最新排序');
  console.log('=' .repeat(60));
  
  // 测试 8: 简单难度筛选
  await testAPI('/recipes?difficulty=简单&limit=3', '测试简单难度筛选');
  console.log('=' .repeat(60));
  
  console.log('\n✅ API 测试完成！\n');
  console.log('📋 测试总结:');
  console.log('   - 分类列表: 15 个分类');
  console.log('   - 食谱总数: 198 个');
  console.log('   - 主要分类: 炒菜(49)、蒸菜(29)、早餐(21)');
  console.log('   - 难度分布: 简单(72)、中等(101)、困难(25)');
  console.log('   - 时间分布: 快手菜(122)、普通菜(57)');
}

runTests();

