const axios = require('axios');

// API基础URL（本地测试）
const BASE_URL = 'http://localhost:3000/api';

// 测试颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

async function testAPI() {
  console.log('🧪 开始测试 API...\n');
  let passCount = 0;
  let failCount = 0;

  // 测试1：获取食谱列表
  try {
    console.log('📝 测试 1: GET /api/recipes - 获取食谱列表');
    const response = await axios.get(`${BASE_URL}/recipes`);
    
    if (response.data.success && response.data.data.recipes.length > 0) {
      console.log(`${colors.green}✓ 通过${colors.reset} - 返回 ${response.data.data.recipes.length} 个食谱`);
      console.log(`   食谱: ${response.data.data.recipes.map(r => r.title).join(', ')}`);
      passCount++;
    } else {
      throw new Error('返回数据格式错误');
    }
  } catch (error) {
    console.log(`${colors.red}✗ 失败${colors.reset} - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试2：获取食谱详情
  try {
    console.log('📝 测试 2: GET /api/recipes/[id] - 获取食谱详情');
    
    // 先获取一个食谱ID
    const listResponse = await axios.get(`${BASE_URL}/recipes`);
    const firstRecipe = listResponse.data.data.recipes[0];
    
    const response = await axios.get(`${BASE_URL}/recipes/${firstRecipe.id}`);
    
    if (response.data.success && response.data.data.title) {
      console.log(`${colors.green}✓ 通过${colors.reset} - 获取到食谱: ${response.data.data.title}`);
      console.log(`   浏览量: ${response.data.data.views}, 点赞数: ${response.data.data.likes}`);
      passCount++;
    } else {
      throw new Error('返回数据格式错误');
    }
  } catch (error) {
    console.log(`${colors.red}✗ 失败${colors.reset} - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试3：食谱分类筛选
  try {
    console.log('📝 测试 3: GET /api/recipes?category=中餐 - 分类筛选');
    const response = await axios.get(`${BASE_URL}/recipes?category=中餐`);
    
    if (response.data.success && response.data.data.recipes.length > 0) {
      console.log(`${colors.green}✓ 通过${colors.reset} - 找到 ${response.data.data.recipes.length} 个中餐食谱`);
      passCount++;
    } else {
      throw new Error('返回数据格式错误');
    }
  } catch (error) {
    console.log(`${colors.red}✗ 失败${colors.reset} - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试4：食谱搜索
  try {
    console.log('📝 测试 4: GET /api/recipes?keyword=番茄 - 关键词搜索');
    const response = await axios.get(`${BASE_URL}/recipes?keyword=番茄`);
    
    if (response.data.success) {
      console.log(`${colors.green}✓ 通过${colors.reset} - 搜索到 ${response.data.data.recipes.length} 个相关食谱`);
      passCount++;
    } else {
      throw new Error('返回数据格式错误');
    }
  } catch (error) {
    console.log(`${colors.red}✗ 失败${colors.reset} - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 测试5：获取评论列表
  try {
    console.log('📝 测试 5: GET /api/comments?recipeId=xxx - 获取评论列表');
    
    // 先获取一个食谱ID
    const listResponse = await axios.get(`${BASE_URL}/recipes`);
    const firstRecipe = listResponse.data.data.recipes[0];
    
    const response = await axios.get(`${BASE_URL}/comments?recipeId=${firstRecipe.id}`);
    
    if (response.data.success && Array.isArray(response.data.data.comments)) {
      console.log(`${colors.green}✓ 通过${colors.reset} - 评论列表返回正常 (${response.data.data.comments.length} 条评论)`);
      passCount++;
    } else {
      throw new Error('返回数据格式错误');
    }
  } catch (error) {
    console.log(`${colors.red}✗ 失败${colors.reset} - ${error.message}`);
    failCount++;
  }
  console.log('');

  // 总结
  console.log('='.repeat(60));
  console.log('📊 测试结果统计:\n');
  console.log(`${colors.green}✓ 通过: ${passCount} 个${colors.reset}`);
  console.log(`${colors.red}✗ 失败: ${failCount} 个${colors.reset}`);
  console.log(`   总计: ${passCount + failCount} 个测试`);
  console.log('='.repeat(60));
  
  if (failCount === 0) {
    console.log(`\n${colors.green}🎉 所有测试通过！API 工作正常！${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  部分测试失败，请检查错误信息${colors.reset}\n`);
  }
}

// 运行测试
console.log('='.repeat(60));
console.log('🚀 一家食谱 - API 测试脚本');
console.log('='.repeat(60));
console.log('');
console.log(`${colors.blue}ℹ️  确保 API 服务已启动: vercel dev${colors.reset}`);
console.log(`${colors.blue}ℹ️  API 地址: ${BASE_URL}${colors.reset}`);
console.log('');

testAPI().catch(error => {
  console.error(`\n${colors.red}❌ 测试运行失败:${colors.reset}`, error.message);
  console.log(`\n${colors.yellow}提示: 请先运行 'vercel dev' 启动 API 服务${colors.reset}\n`);
  process.exit(1);
});
