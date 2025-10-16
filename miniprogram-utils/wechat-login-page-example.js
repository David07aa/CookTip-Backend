/**
 * 微信原生小程序 - 登录页面示例
 * 使用场景：在登录页面或需要授权的页面调用
 */

const wechatAuth = require('./wechat-login.js');

Page({
  data: {
    isLogin: false,
    userInfo: null,
    isLoading: false
  },

  /**
   * 页面加载时检查登录状态
   */
  onLoad() {
    this.checkLogin();
  },

  /**
   * 检查登录状态
   */
  checkLogin() {
    const isLogin = wechatAuth.checkLoginStatus();
    
    if (isLogin) {
      const userInfo = wechatAuth.getLocalUserInfo();
      this.setData({
        isLogin: true,
        userInfo: userInfo
      });
      
      console.log('✅ 已登录，用户信息:', userInfo);
    } else {
      console.log('❌ 未登录');
      this.setData({
        isLogin: false,
        userInfo: null
      });
    }
  },

  /**
   * 处理微信登录按钮点击
   * 注意：必须绑定到按钮的 bindtap 事件
   */
  handleWechatLogin() {
    // 防止重复点击
    if (this.data.isLoading) {
      return;
    }

    this.setData({ isLoading: true });

    // 显示加载提示
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    // 调用登录方法
    wechatAuth.wechatLogin()
      .then(result => {
        console.log('✅ 登录成功:', result);
        
        // 更新页面状态
        this.setData({
          isLogin: true,
          userInfo: result.userInfo,
          isLoading: false
        });

        // 隐藏加载提示
        wx.hideLoading();

        // 显示成功提示
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        });

        // 登录成功后的处理
        // 例如：跳转到首页或其他页面
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);
      })
      .catch(error => {
        console.error('❌ 登录失败:', error);
        
        this.setData({ isLoading: false });
        wx.hideLoading();

        // 显示错误提示
        let errorMsg = '登录失败，请重试';
        if (error.message.includes('取消授权')) {
          errorMsg = '您取消了授权';
        } else if (error.message.includes('网络')) {
          errorMsg = '网络错误，请检查网络连接';
        }

        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
      });
  },

  /**
   * 处理退出登录
   */
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wechatAuth.logout();
          
          this.setData({
            isLogin: false,
            userInfo: null
          });

          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
});

