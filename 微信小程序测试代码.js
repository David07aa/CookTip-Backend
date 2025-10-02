/**
 * 微信小程序 API 测试代码
 * 
 * 使用方法:
 * 1. 复制此代码到小程序的某个页面 (例如 pages/test/test.js)
 * 2. 在页面加载时自动运行测试
 * 3. 查看控制台输出和页面显示结果
 */

// ==================== 配置 ====================
const BASE_URL = 'https://cooktip-backend.vercel.app';

// ==================== 测试函数 ====================

/**
 * 测试 API 接口
 * @param {String} name - 测试名称
 * @param {String} url - 完整URL
 * @param {Object} options - wx.request 选项
 * @returns {Promise}
 */
function testAPI(name, url, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 测试: ${name}`);
    console.log(`📍 URL: ${url}`);
    
    const startTime = Date.now();
    
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header || {
        'content-type': 'application/json'
      },
      timeout: 10000, // 10秒超时
      
      success: (res) => {
        const duration = Date.now() - startTime;
        console.log(`✅ ${name} 成功 (${duration}ms)`);
        console.log('响应状态:', res.statusCode);
        console.log('响应数据:', res.data);
        
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve({
            success: true,
            name,
            data: res.data,
            duration
          });
        } else {
          resolve({
            success: false,
            name,
            error: `状态码: ${res.statusCode}, 错误码: ${res.data?.code}`,
            data: res.data,
            duration
          });
        }
      },
      
      fail: (err) => {
        const duration = Date.now() - startTime;
        console.error(`❌ ${name} 失败 (${duration}ms)`);
        console.error('错误信息:', err);
        
        resolve({
          success: false,
          name,
          error: err.errMsg,
          duration
        });
      }
    });
  });
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始测试 CookTip API');
  console.log('=' .repeat(50));
  
  const results = [];
  
  try {
    // 测试 1: 分类列表
    results.push(await testAPI(
      '分类列表',
      `${BASE_URL}/api/categories`
    ));
    
    await sleep(1000); // 等待1秒避免速率限制
    
    // 测试 2: 食谱列表
    results.push(await testAPI(
      '食谱列表',
      `${BASE_URL}/api/recipes`,
      {
        method: 'GET',
        data: {
          page: 1,
          limit: 5
        }
      }
    ));
    
    await sleep(1000);
    
    // 测试 3: 搜索功能
    results.push(await testAPI(
      '搜索"鸡"',
      `${BASE_URL}/api/search`,
      {
        method: 'GET',
        data: {
          keyword: '鸡',
          page: 1,
          pageSize: 5
        }
      }
    ));
    
    await sleep(1000);
    
    // 测试 4: 健康检查
    results.push(await testAPI(
      '健康检查',
      `${BASE_URL}/api/recipes?health=check`
    ));
    
  } catch (error) {
    console.error('测试执行错误:', error);
  }
  
  // 输出测试报告
  printTestReport(results);
  
  return results;
}

/**
 * 打印测试报告
 */
function printTestReport(results) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试报告');
  console.log('='.repeat(50));
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  console.log(`总测试数: ${results.length}`);
  console.log(`✅ 通过: ${successCount}`);
  console.log(`❌ 失败: ${failCount}`);
  
  console.log('\n详细结果:');
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.name} (${result.duration}ms)`);
    if (!result.success) {
      console.log(`   错误: ${result.error}`);
    }
  });
  
  console.log('='.repeat(50));
  
  // 显示 Toast
  if (successCount === results.length) {
    wx.showToast({
      title: `所有测试通过 (${successCount}/${results.length})`,
      icon: 'success',
      duration: 3000
    });
  } else {
    wx.showToast({
      title: `${failCount} 个测试失败`,
      icon: 'none',
      duration: 3000
    });
  }
}

/**
 * 延迟函数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 页面代码 ====================

Page({
  data: {
    testResults: [],
    isTestting: false
  },
  
  onLoad() {
    console.log('API 测试页面加载');
    // 页面加载时自动运行测试
    // 如果不想自动运行，可以注释掉下面这行
    // this.startTest();
  },
  
  // 开始测试
  async startTest() {
    if (this.data.isTestting) {
      wx.showToast({
        title: '测试正在进行中',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isTestting: true,
      testResults: []
    });
    
    wx.showLoading({
      title: '测试中...'
    });
    
    try {
      const results = await runAllTests();
      
      this.setData({
        testResults: results,
        isTestting: false
      });
    } catch (error) {
      console.error('测试失败:', error);
      wx.showToast({
        title: '测试失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 单独测试分类接口
  async testCategories() {
    wx.showLoading({ title: '测试中...' });
    
    const result = await testAPI(
      '分类列表',
      `${BASE_URL}/api/categories`
    );
    
    wx.hideLoading();
    
    if (result.success) {
      const count = result.data.data?.list?.length || 0;
      wx.showModal({
        title: '测试成功',
        content: `获取到 ${count} 个分类`,
        showCancel: false
      });
    } else {
      wx.showModal({
        title: '测试失败',
        content: result.error,
        showCancel: false
      });
    }
  },
  
  // 单独测试食谱列表
  async testRecipes() {
    wx.showLoading({ title: '测试中...' });
    
    const result = await testAPI(
      '食谱列表',
      `${BASE_URL}/api/recipes`,
      {
        method: 'GET',
        data: {
          page: 1,
          limit: 5
        }
      }
    );
    
    wx.hideLoading();
    
    if (result.success) {
      const total = result.data.data?.pagination?.total || 0;
      const count = result.data.data?.list?.length || 0;
      wx.showModal({
        title: '测试成功',
        content: `数据库共 ${total} 个菜谱\n本次获取 ${count} 个`,
        showCancel: false
      });
    } else {
      wx.showModal({
        title: '测试失败',
        content: result.error,
        showCancel: false
      });
    }
  }
});

// ==================== WXML 示例 ====================
/*
<view class="container">
  <view class="title">CookTip API 测试</view>
  
  <view class="btn-group">
    <button type="primary" bindtap="startTest" loading="{{isTestting}}">
      运行所有测试
    </button>
    
    <button type="default" bindtap="testCategories">
      测试分类接口
    </button>
    
    <button type="default" bindtap="testRecipes">
      测试食谱列表
    </button>
  </view>
  
  <view class="results" wx:if="{{testResults.length > 0}}">
    <view class="result-title">测试结果:</view>
    <view class="result-item" wx:for="{{testResults}}" wx:key="index">
      <text class="result-icon">{{item.success ? '✅' : '❌'}}</text>
      <text class="result-name">{{item.name}}</text>
      <text class="result-time">({{item.duration}}ms)</text>
    </view>
  </view>
</view>
*/

// ==================== WXSS 示例 ====================
/*
.container {
  padding: 40rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 60rpx;
}

.btn-group button {
  margin-bottom: 20rpx;
}

.results {
  margin-top: 60rpx;
  padding: 30rpx;
  background: #f5f5f5;
  border-radius: 10rpx;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.result-item {
  padding: 15rpx 0;
  border-bottom: 1px solid #e5e5e5;
}

.result-icon {
  margin-right: 10rpx;
}

.result-time {
  color: #999;
  margin-left: 10rpx;
}
*/

