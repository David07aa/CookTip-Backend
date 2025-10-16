/**
 * 微信原生小程序 - 一键登录工具
 * 参考：https://blog.csdn.net/zmz1196167569/article/details/150635408
 */

// 配置后端API地址
const API_BASE_URL = 'https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com/api/v1';

/**
 * 微信一键登录
 * ⚠️ 重要：此方法必须在用户点击事件中直接调用
 * @returns {Promise} 返回登录结果
 */
function wechatLogin() {
  return new Promise((resolve, reject) => {
    console.log('🔐 [WechatLogin] 开始微信登录流程...');

    // 步骤1: 先获取用户信息授权（必须在用户点击的同步上下文中调用）
    console.log('👤 [WechatLogin] 调用 wx.getUserProfile...');
    wx.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户信息的用途
      lang: 'zh_CN',
      success: (profileRes) => {
        console.log('✅ [WechatLogin] 获取用户信息成功:', profileRes.userInfo);

        // 步骤2: 获取用户信息成功后，再调用 wx.login 获取 code
        console.log('🔑 [WechatLogin] 调用 wx.login 获取 code...');
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              console.log('✅ [WechatLogin] 获取登录凭证成功, code:', loginRes.code);
              
              // 构造登录数据
              const loginData = {
                code: loginRes.code,
                nickName: profileRes.userInfo.nickName,
                avatarUrl: profileRes.userInfo.avatarUrl,
                // 兼容字段
                nickname: profileRes.userInfo.nickName,
                avatar: profileRes.userInfo.avatarUrl,
              };

              // 步骤3: 发送登录请求到后端
              sendLoginRequest(loginData)
                .then(resolve)
                .catch(reject);
            } else {
              console.error('❌ [WechatLogin] wx.login 失败:', loginRes.errMsg);
              reject(new Error('获取登录凭证失败'));
            }
          },
          fail: (err) => {
            console.error('❌ [WechatLogin] wx.login 调用失败:', err);
            reject(err);
          }
        });
      },
      fail: (err) => {
        console.error('❌ [WechatLogin] 获取用户信息失败:', err);
        // 用户拒绝授权或其他错误
        if (err.errMsg && err.errMsg.includes('cancel')) {
          reject(new Error('用户取消授权'));
        } else if (err.errMsg && err.errMsg.includes('user TAP gesture')) {
          reject(new Error('请在按钮点击事件中调用登录'));
        } else {
          reject(new Error('获取用户信息失败'));
        }
      }
    });
  });
}


/**
 * 发送登录请求到后端（通过云函数代理）
 * @param {Object} loginData - 登录数据
 * @returns {Promise}
 */
function sendLoginRequest(loginData) {
  return new Promise((resolve, reject) => {
    console.log('📡 [WechatLogin] 发送登录请求到后端...');
    console.log('📦 [WechatLogin] 登录数据:', {
      code: loginData.code ? 'exists' : 'missing',
      nickName: loginData.nickName,
      hasAvatar: !!loginData.avatarUrl
    });

    // 使用专门的微信登录云函数（避免IP白名单问题）
    wx.cloud.callFunction({
      name: 'wechat-login',  // 使用专门的登录云函数
      data: loginData,       // 直接传递登录数据

      success: (res) => {
        console.log('📥 [WechatLogin] 云函数响应:', res);

        // 检查云函数是否调用成功
        if (!res.result) {
          console.error('❌ [WechatLogin] 云函数返回格式错误:', res);
          reject(new Error('云函数调用失败'));
          return;
        }

        const { statusCode, data } = res.result;
        console.log('📊 [WechatLogin] HTTP状态码:', statusCode);
        console.log('📦 [WechatLogin] 响应数据:', data);

        // 处理不同的状态码
        if (statusCode === 200) {
          // 成功
          if (data && data.code === 200 && data.data) {
            console.log('✅ [WechatLogin] 登录成功!');
            
            const { access_token, user } = data.data;

            // 保存用户信息和 token 到本地
            wx.setStorageSync('access_token', access_token);
            wx.setStorageSync('user_info', user);

            console.log('💾 [WechatLogin] 已保存 token 和用户信息到本地');

            resolve({
              success: true,
              token: access_token,
              userInfo: user
            });
          } else {
            console.error('❌ [WechatLogin] 登录失败:', data?.message || '未知错误');
            reject(new Error(data?.message || '登录失败'));
          }
        } else if (statusCode === 401) {
          // 401 错误 - 这不应该发生在登录接口
          console.error('❌ [WechatLogin] 后端返回401错误（认证失败）');
          console.error('   可能原因：');
          console.error('   1. 微信AppID或Secret配置错误');
          console.error('   2. 微信code无效或已使用');
          console.error('   3. 后端认证守卫配置错误');
          console.error('   详细信息:', data);
          
          const errorMsg = data?.message || '登录认证失败，请检查配置';
          reject(new Error(errorMsg));
        } else {
          // 其他错误
          console.error('❌ [WechatLogin] 后端返回错误，状态码:', statusCode);
          console.error('   错误信息:', data);
          
          const errorMsg = data?.message || `请求失败（状态码：${statusCode}）`;
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        console.error('❌ [WechatLogin] 云函数调用失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 检查登录状态
 * @returns {boolean} 是否已登录
 */
function checkLoginStatus() {
  const token = wx.getStorageSync('access_token');
  const userInfo = wx.getStorageSync('user_info');
  
  return !!(token && userInfo);
}

/**
 * 获取本地存储的用户信息
 * @returns {Object|null} 用户信息
 */
function getLocalUserInfo() {
  try {
    return wx.getStorageSync('user_info');
  } catch (error) {
    console.error('获取本地用户信息失败:', error);
    return null;
  }
}

/**
 * 获取本地存储的 token
 * @returns {string|null} token
 */
function getLocalToken() {
  try {
    return wx.getStorageSync('access_token');
  } catch (error) {
    console.error('获取本地 token 失败:', error);
    return null;
  }
}

/**
 * 退出登录
 */
function logout() {
  console.log('👋 退出登录');
  
  // 清除本地存储
  wx.removeStorageSync('access_token');
  wx.removeStorageSync('user_info');
  
  // 可选：通知后端
  const token = getLocalToken();
  if (token) {
    wx.cloud.callFunction({
      name: 'api-proxy',
      data: {
        method: 'POST',
        path: '/api/v1/auth/logout',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    });
  }
}

/**
 * 刷新 token
 * @returns {Promise}
 */
function refreshToken() {
  return new Promise((resolve, reject) => {
    const token = getLocalToken();
    
    if (!token) {
      reject(new Error('未登录'));
      return;
    }

    wx.cloud.callFunction({
      name: 'api-proxy',
      data: {
        method: 'POST',
        path: '/api/v1/auth/refresh',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      },
      success: (res) => {
        if (res.result && res.result.statusCode === 200) {
          const newToken = res.result.data.data.access_token;
          wx.setStorageSync('access_token', newToken);
          resolve(newToken);
        } else {
          reject(new Error('刷新 token 失败'));
        }
      },
      fail: reject
    });
  });
}

// 导出方法
module.exports = {
  wechatLogin,
  checkLoginStatus,
  getLocalUserInfo,
  getLocalToken,
  logout,
  refreshToken
};

