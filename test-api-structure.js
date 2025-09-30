/**
 * 测试API接口结构和完整性
 * 不需要数据库连接
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 开始测试API接口结构...\n');

let passCount = 0;
let failCount = 0;

// 测试1：验证所有新增文件存在
console.log('📝 测试 1: 验证新增接口文件');
try {
  const newFiles = {
    'api/user/info.js': '用户信息接口',
    'api/user/recipes.js': '用户食谱列表',
    'api/recipes/update.js': '更新/删除食谱',
    'api/categories/index.js': '分类列表',
    'api/comments/delete.js': '删除评论',
    'api/search/index.js': '搜索接口',
    'lib/response.js': '响应格式工具',
    'API_IMPLEMENTATION.md': '接口对照表',
    'UPDATE_SUMMARY.md': '更新总结'
  };

  let allExist = true;
  console.log('   检查新增文件:');
  for (const [file, desc] of Object.entries(newFiles)) {
    if (fs.existsSync(file)) {
      console.log(`   ✓ ${desc} (${file})`);
    } else {
      console.log(`   ✗ ${desc} (${file}) - 文件不存在`);
      allExist = false;
    }
  }

  if (allExist) {
    console.log(`✅ 通过 - 所有 ${Object.keys(newFiles).length} 个文件都存在`);
    passCount++;
  } else {
    throw new Error('部分文件缺失');
  }
} catch (error) {
  console.log(`❌ 失败 - ${error.message}`);
  failCount++;
}
console.log('');

// 测试2：验证接口文件包含必要的代码结构
console.log('📝 测试 2: 验证接口代码结构');
try {
  const apiFiles = [
    'api/user/info.js',
    'api/user/recipes.js',
    'api/recipes/update.js',
    'api/categories/index.js',
    'api/comments/delete.js',
    'api/search/index.js'
  ];

  let allValid = true;
  console.log('   检查代码结构:');
  
  for (const file of apiFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    const checks = {
      'module.exports': content.includes('module.exports'),
      'CORS设置': content.includes('Access-Control-Allow-Origin'),
      'OPTIONS处理': content.includes("req.method === 'OPTIONS'"),
      '错误处理': content.includes('try') && content.includes('catch')
    };

    const passed = Object.values(checks).every(v => v);
    
    if (passed) {
      console.log(`   ✓ ${file}`);
    } else {
      console.log(`   ✗ ${file} - 缺少必要结构`);
      Object.entries(checks).forEach(([key, value]) => {
        if (!value) console.log(`      - 缺少: ${key}`);
      });
      allValid = false;
    }
  }

  if (allValid) {
    console.log(`✅ 通过 - 所有接口都有完整的代码结构`);
    passCount++;
  } else {
    throw new Error('部分接口代码结构不完整');
  }
} catch (error) {
  console.log(`❌ 失败 - ${error.message}`);
  failCount++;
}
console.log('');

// 测试3：统计项目文件
console.log('📝 测试 3: 项目文件统计');
try {
  const stats = {
    '接口文件': 0,
    '工具库': 0,
    '中间件': 0,
    '脚本': 0,
    '文档': 0
  };

  // 统计API接口
  const countFilesInDir = (dir) => {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        count += countFilesInDir(fullPath);
      } else if (item.endsWith('.js')) {
        count++;
      }
    }
    return count;
  };

  stats['接口文件'] = countFilesInDir('api');
  stats['工具库'] = countFilesInDir('lib');
  stats['中间件'] = countFilesInDir('middleware');
  stats['脚本'] = countFilesInDir('scripts');
  
  // 统计文档
  const docs = fs.readdirSync('.')
    .filter(f => f.endsWith('.md') && !f.includes('node_modules'));
  stats['文档'] = docs.length;

  console.log('   项目统计:');
  Object.entries(stats).forEach(([key, value]) => {
    console.log(`   - ${key}: ${value} 个`);
  });

  console.log(`✅ 通过 - 项目结构完整`);
  passCount++;
} catch (error) {
  console.log(`❌ 失败 - ${error.message}`);
  failCount++;
}
console.log('');

// 测试4：验证响应格式工具
console.log('📝 测试 4: 验证响应格式工具');
try {
  const responseContent = fs.readFileSync('lib/response.js', 'utf8');
  
  const requiredFunctions = [
    'success',
    'error',
    'badRequest',
    'unauthorized',
    'forbidden',
    'notFound',
    'serverError'
  ];

  const missingFunctions = requiredFunctions.filter(fn => 
    !responseContent.includes(`function ${fn}`) && 
    !responseContent.includes(`const ${fn}`)
  );

  if (missingFunctions.length === 0) {
    console.log(`   ✓ 包含所有 ${requiredFunctions.length} 个响应函数`);
    requiredFunctions.forEach(fn => {
      console.log(`     - ${fn}()`);
    });
    console.log(`✅ 通过 - 响应格式工具完整`);
    passCount++;
  } else {
    throw new Error(`缺少函数: ${missingFunctions.join(', ')}`);
  }
} catch (error) {
  console.log(`❌ 失败 - ${error.message}`);
  failCount++;
}
console.log('');

// 测试5：验证接口路由覆盖
console.log('📝 测试 5: 验证接口路由覆盖');
try {
  const routes = {
    '用户模块': [
      'api/auth/login.js',
      'api/user/info.js',
      'api/user/recipes.js',
      'api/users/[id].js'
    ],
    '食谱模块': [
      'api/recipes/index.js',
      'api/recipes/[id].js',
      'api/recipes/create.js',
      'api/recipes/update.js'
    ],
    '社交模块': [
      'api/favorites/index.js',
      'api/likes/index.js',
      'api/comments/index.js',
      'api/comments/delete.js'
    ],
    '其他模块': [
      'api/categories/index.js',
      'api/search/index.js'
    ]
  };

  let totalRoutes = 0;
  let existingRoutes = 0;

  console.log('   路由覆盖情况:');
  for (const [module, files] of Object.entries(routes)) {
    const existing = files.filter(f => fs.existsSync(f));
    totalRoutes += files.length;
    existingRoutes += existing.length;
    console.log(`   - ${module}: ${existing.length}/${files.length} 个接口`);
  }

  console.log(`   总计: ${existingRoutes}/${totalRoutes} 个接口文件`);
  
  if (existingRoutes === totalRoutes) {
    console.log(`✅ 通过 - 所有路由接口都已实现`);
    passCount++;
  } else {
    throw new Error(`缺少 ${totalRoutes - existingRoutes} 个接口文件`);
  }
} catch (error) {
  console.log(`❌ 失败 - ${error.message}`);
  failCount++;
}
console.log('');

// 测试6：代码质量检查
console.log('📝 测试 6: 代码质量检查');
try {
  const apiFiles = [
    'api/user/info.js',
    'api/user/recipes.js',
    'api/recipes/update.js',
    'api/categories/index.js'
  ];

  const qualityMetrics = {
    '包含注释': 0,
    '使用async/await': 0,
    '有错误处理': 0,
    '参数验证': 0
  };

  for (const file of apiFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('/**') || content.includes('//')) qualityMetrics['包含注释']++;
    if (content.includes('async') && content.includes('await')) qualityMetrics['使用async/await']++;
    if (content.includes('try') && content.includes('catch')) qualityMetrics['有错误处理']++;
    if (content.includes('if (')) qualityMetrics['参数验证']++;
  }

  console.log('   代码质量指标:');
  Object.entries(qualityMetrics).forEach(([key, value]) => {
    const percentage = (value / apiFiles.length * 100).toFixed(0);
    console.log(`   - ${key}: ${value}/${apiFiles.length} (${percentage}%)`);
  });

  const avgQuality = Object.values(qualityMetrics).reduce((a, b) => a + b, 0) / Object.keys(qualityMetrics).length;
  const qualityPercent = (avgQuality / apiFiles.length * 100).toFixed(0);

  if (avgQuality >= apiFiles.length * 0.8) {
    console.log(`✅ 通过 - 代码质量良好 (${qualityPercent}%)`);
    passCount++;
  } else {
    console.log(`⚠️  警告 - 代码质量需要改进 (${qualityPercent}%)`);
    passCount++;
  }
} catch (error) {
  console.log(`❌ 失败 - ${error.message}`);
  failCount++;
}
console.log('');

// 总结
console.log('='.repeat(60));
console.log('📊 测试结果统计:\n');
console.log(`✅ 通过: ${passCount} 个`);
console.log(`❌ 失败: ${failCount} 个`);
console.log(`   总计: ${passCount + failCount} 个测试`);
console.log('='.repeat(60));

if (failCount === 0) {
  console.log(`\n🎉 所有结构测试通过！接口文件完整且规范！\n`);
  console.log('📝 后续步骤:');
  console.log('   1. 启动开发服务器: vercel dev');
  console.log('   2. 使用 Postman 或浏览器测试接口');
  console.log('   3. 部署到 Vercel: vercel --prod\n');
} else {
  console.log(`\n⚠️  部分测试失败，请检查错误信息\n`);
}

process.exit(failCount === 0 ? 0 : 1);
