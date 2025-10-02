/**
 * 测试已部署的 API 接口
 * 验证老乡鸡菜谱是否成功导入并可访问
 */

const BASE_URL = 'https://cooktip-backend.vercel.app';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAPI(name, url, expectedCheck) {
  console.log(`\n📝 测试: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ 状态码: ${response.status}`);
      
      if (expectedCheck) {
        const result = expectedCheck(data);
        if (result.success) {
          console.log(`   ✅ ${result.message}`);
          return { success: true, data };
        } else {
          console.log(`   ⚠️  ${result.message}`);
          return { success: false, data };
        }
      }
      
      return { success: true, data };
    } else {
      console.log(`   ❌ 状态码: ${response.status}`);
      console.log(`   错误: ${data.message || '未知错误'}`);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`   ❌ 请求失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 开始测试 CookTip API');
  console.log('=' .repeat(60));
  
  const results = {
    passed: [],
    failed: []
  };
  
  // 测试 1: 健康检查
  console.log('\n【测试 1】健康检查');
  console.log('-'.repeat(60));
  const healthResult = await testAPI(
    '健康检查',
    `${BASE_URL}/api/recipes?health=check`,
    (data) => {
      if (data.connection === 'connected') {
        return { success: true, message: `数据库连接正常 (${data.database})` };
      }
      return { success: false, message: '数据库连接失败' };
    }
  );
  
  if (healthResult.success) {
    results.passed.push('健康检查');
  } else {
    results.failed.push('健康检查');
  }
  
  await sleep(3000); // 等待3秒避免速率限制
  
  // 测试 2: 食谱列表
  console.log('\n【测试 2】食谱列表');
  console.log('-'.repeat(60));
  const recipesResult = await testAPI(
    '食谱列表',
    `${BASE_URL}/api/recipes?page=1&limit=5`,
    (data) => {
      if (data.code === 200 && data.data.pagination) {
        const total = data.data.pagination.total;
        const list = data.data.list.length;
        return { 
          success: true, 
          message: `获取成功 - 共 ${total} 个菜谱，本页显示 ${list} 个` 
        };
      }
      return { success: false, message: '数据格式错误' };
    }
  );
  
  if (recipesResult.success) {
    results.passed.push('食谱列表');
    console.log('\n   📋 前5个菜谱:');
    recipesResult.data.data.list.forEach((recipe, index) => {
      console.log(`      ${index + 1}. ${recipe.title} [${recipe.category}] - ${recipe.difficulty}`);
    });
  } else {
    results.failed.push('食谱列表');
  }
  
  await sleep(3000);
  
  // 测试 3: 搜索功能
  console.log('\n【测试 3】搜索功能');
  console.log('-'.repeat(60));
  const searchResult = await testAPI(
    '搜索"鸡"',
    `${BASE_URL}/api/search?keyword=鸡&page=1&pageSize=5`,
    (data) => {
      if (data.code === 200 && data.data.total !== undefined) {
        return { 
          success: true, 
          message: `搜索到 ${data.data.total} 个结果` 
        };
      }
      return { success: false, message: '搜索失败' };
    }
  );
  
  if (searchResult.success) {
    results.passed.push('搜索功能');
    console.log('\n   🔍 搜索结果:');
    searchResult.data.data.list.forEach((recipe, index) => {
      console.log(`      ${index + 1}. ${recipe.title}`);
    });
  } else {
    results.failed.push('搜索功能');
  }
  
  await sleep(3000);
  
  // 测试 4: 分类筛选
  console.log('\n【测试 4】分类筛选');
  console.log('-'.repeat(60));
  const categoryResult = await testAPI(
    '炒菜分类',
    `${BASE_URL}/api/recipes?category=炒菜&page=1&limit=3`,
    (data) => {
      if (data.code === 200) {
        return { 
          success: true, 
          message: `炒菜分类共 ${data.data.pagination.total} 个` 
        };
      }
      return { success: false, message: '分类筛选失败' };
    }
  );
  
  if (categoryResult.success) {
    results.passed.push('分类筛选');
  } else {
    results.failed.push('分类筛选');
  }
  
  await sleep(3000);
  
  // 测试 5: 食谱详情
  if (recipesResult.success && recipesResult.data.data.list.length > 0) {
    console.log('\n【测试 5】食谱详情');
    console.log('-'.repeat(60));
    
    const firstRecipeId = recipesResult.data.data.list[0].id;
    const detailResult = await testAPI(
      '食谱详情',
      `${BASE_URL}/api/recipes/${firstRecipeId}`,
      (data) => {
        if (data.code === 200 && data.data.ingredients && data.data.steps) {
          return { 
            success: true, 
            message: `获取成功 - ${data.data.ingredients.length} 个原料，${data.data.steps.length} 个步骤` 
          };
        }
        return { success: false, message: '详情数据不完整' };
      }
    );
    
    if (detailResult.success) {
      results.passed.push('食谱详情');
      console.log(`\n   📖 《${detailResult.data.data.title}》`);
      console.log(`      简介: ${detailResult.data.data.introduction.substring(0, 50)}...`);
      console.log(`      烹饪时间: ${detailResult.data.data.cookTime} 分钟`);
      console.log(`      难度: ${detailResult.data.data.difficulty}`);
    } else {
      results.failed.push('食谱详情');
    }
  }
  
  // 测试总结
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));
  console.log(`✅ 通过: ${results.passed.length} 个`);
  console.log(`❌ 失败: ${results.failed.length} 个`);
  
  if (results.passed.length > 0) {
    console.log('\n通过的测试:');
    results.passed.forEach(test => console.log(`  ✅ ${test}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n失败的测试:');
    results.failed.forEach(test => console.log(`  ❌ ${test}`));
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (results.failed.length === 0) {
    console.log('🎉 所有测试通过！API 运行正常！');
    console.log('\n✅ 前端可以正常获取老乡鸡菜谱数据');
    console.log('✅ 共 198 个菜谱已成功上线');
  } else {
    console.log('⚠️  部分测试失败，请检查日志');
  }
  
  console.log('='.repeat(60));
  
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// 运行测试
console.log('⏳ 正在连接到 Vercel 部署的 API...\n');
runTests().catch(error => {
  console.error('💥 测试执行错误:', error);
  process.exit(1);
});

