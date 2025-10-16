// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云托管内网地址（仅云内部可访问）
const API_INTERNAL_URL = 'http://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com'

/**
 * 云函数 API 代理
 * 将小程序请求转发到云托管后端服务
 */
exports.main = async (event, context) => {
  console.log('收到请求:', {
    method: event.method,
    path: event.path,
    hasData: !!event.data,
    hasHeaders: !!event.headers
  })

  const {
    method = 'GET',
    path = '/',
    data = {},
    headers = {},
    query = {}
  } = event

  try {
    // 引入 axios（云函数环境中需要先安装依赖）
    const axios = require('axios')

    // 构建完整的请求 URL
    let fullUrl = `${API_INTERNAL_URL}${path}`
    
    // 如果是 GET 请求且有 query 参数，添加到 URL
    if (method.toUpperCase() === 'GET' && Object.keys(query).length > 0) {
      const queryString = Object.entries(query)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
      fullUrl += `?${queryString}`
    }

    console.log('转发请求到:', fullUrl)

    // 构建请求配置
    const requestConfig = {
      method: method.toUpperCase(),
      url: fullUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CookTip-CloudFunction/1.0',
        ...headers
      },
      timeout: 15000, // 15秒超时
      validateStatus: () => true // 接受所有状态码
    }

    // 根据请求方法添加数据
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      requestConfig.data = data
    } else if (method.toUpperCase() === 'GET' && Object.keys(data).length > 0) {
      requestConfig.params = data
    }

    // 发送请求到云托管后端
    const response = await axios(requestConfig)

    console.log('后端响应:', {
      status: response.status,
      hasData: !!response.data
    })

    // 返回响应
    return {
      statusCode: response.status,
      headers: response.headers,
      data: response.data
    }

  } catch (error) {
    console.error('API 转发错误:', {
      message: error.message,
      code: error.code,
      status: error.response?.status
    })

    // 处理错误响应
    if (error.response) {
      // 服务器返回了错误响应
      return {
        statusCode: error.response.status,
        data: {
          code: error.response.status,
          message: error.response.data?.message || '请求失败',
          error: error.response.data
        }
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      return {
        statusCode: 504,
        data: {
          code: 504,
          message: '网关超时，无法连接到后端服务',
          error: error.message
        }
      }
    } else {
      // 其他错误
      return {
        statusCode: 500,
        data: {
          code: 500,
          message: '内部服务器错误',
          error: error.message
        }
      }
    }
  }
}

