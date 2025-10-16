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

    // 通过云函数代理请求后端API
    wx.cloud.callFunction({
      name: 'api-proxy',
      data: {
        method: 'POST',
        path: '/api/v1/auth/wx-login',
        body: loginData,
        headers: {
          'Content-Type': 'application/json'
        }
      },
      success: (res) => {
        console.log('📥 [WechatLogin] 后端响应:', res);

        if (res.result && res.result.statusCode === 200) {
          const responseData = res.result.data;

          if (responseData.code === 200 && responseData.data) {
            console.log('✅ [WechatLogin] 登录成功!');
            
            const { access_token, user } = responseData.data;

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
            console.error('❌ [WechatLogin] 登录失败:', responseData.message);
            reject(new Error(responseData.message || '登录失败'));
          }
        } else {
          console.error('❌ [WechatLogin] 请求失败:', res.result);
          reject(new Error('登录请求失败'));
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

