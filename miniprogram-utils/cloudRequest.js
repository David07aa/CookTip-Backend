/**
 * 云函数 API 请求工具
 * 通过云函数代理访问后端 API
 */

/**
 * 通用请求方法
 * @param {Object} options 请求配置
 * @param {String} options.url API 路径（如 '/api/v1/categories'）
 * @param {String} options.method HTTP 方法（GET/POST/PUT/PATCH/DELETE）
 * @param {Object} options.data 请求数据
 * @param {Object} options.query URL 查询参数（GET 请求）
 * @param {Object} options.header 自定义请求头
 * @param {Boolean} options.showLoading 是否显示加载提示
 * @param {String} options.loadingText 加载提示文本
 */
function cloudRequest(options) {
  const {
    url,
    method = 'GET',
    data = {},
    query = {},
    header = {},
    showLoading = false,
    loadingText = '加载中...'
  } = options

  // 显示加载提示
  if (showLoading) {
    wx.showLoading({
      title: loadingText,
      mask: true
    })
  }

  return new Promise((resolve, reject) => {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'api-proxy',
      data: {
        method: method.toUpperCase(),
        path: url,
        data: method.toUpperCase() === 'GET' ? query : data,
        query: method.toUpperCase() === 'GET' ? query : {},
        headers: header
      },
      success: (res) => {
        // 隐藏加载提示
        if (showLoading) {
          wx.hideLoading()
        }

        console.log('云函数响应:', res)

        // 检查云函数调用是否成功
        if (res.errMsg && res.errMsg.includes('ok')) {
          const result = res.result

          // 检查 HTTP 状态码
          if (result.statusCode >= 200 && result.statusCode < 300) {
            // 成功
            resolve(result.data)
          } else if (result.statusCode === 401) {
            // 未登录或 Token 过期
            wx.showToast({
              title: '请先登录',
              icon: 'none',
              duration: 2000
            })
            
            // 可选：跳转到登录页
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/login/login'
              })
            }, 2000)
            
            reject(new Error('未登录'))
          } else {
            // 其他错误
            const errorMsg = result.data?.message || '请求失败'
            wx.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 2000
            })
            reject(new Error(errorMsg))
          }
        } else {
          // 云函数调用失败
          wx.showToast({
            title: '服务异常，请稍后重试',
            icon: 'none',
            duration: 2000
          })
          reject(new Error('云函数调用失败'))
        }
      },
      fail: (err) => {
        // 隐藏加载提示
        if (showLoading) {
          wx.hideLoading()
        }

        console.error('云函数调用失败:', err)
        
        wx.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none',
          duration: 2000
        })
        
        reject(err)
      }
    })
  })
}

/**
 * GET 请求
 */
function get(url, query = {}, options = {}) {
  return cloudRequest({
    url,
    method: 'GET',
    query,
    ...options
  })
}

/**
 * POST 请求
 */
function post(url, data = {}, options = {}) {
  return cloudRequest({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 */
function put(url, data = {}, options = {}) {
  return cloudRequest({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * PATCH 请求
 */
function patch(url, data = {}, options = {}) {
  return cloudRequest({
    url,
    method: 'PATCH',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 */
function del(url, options = {}) {
  return cloudRequest({
    url,
    method: 'DELETE',
    ...options
  })
}

/**
 * 带 Token 的请求
 */
function authRequest(options) {
  const token = wx.getStorageSync('cooktip_token')
  
  if (!token) {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    })
    
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }, 1500)
    
    return Promise.reject(new Error('未登录'))
  }

  return cloudRequest({
    ...options,
    header: {
      ...options.header,
      'Authorization': `Bearer ${token}`
    }
  })
}

module.exports = {
  cloudRequest,
  get,
  post,
  put,
  patch,
  delete: del,
  authRequest
}

