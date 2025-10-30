// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云托管公网地址（云函数使用公网访问）
const API_URL = 'https://yjsp-ytg-191595-4-1367462091.sh.run.tcloudbase.com'

/**
 * 云函数 API 代理
 * 将小程序请求转发到云托管后端服务
 */
exports.main = async (event, context) => {
  console.log('收到请求:', {
    method: event.method,
    path: event.path,
    hasData: !!event.data,
    hasBody: !!event.body,
    hasHeaders: !!event.headers
  })

  const {
    method = 'GET',
    path = '/',
    data = {},
    body,  // 支持 body 参数
    headers = {},
    query = {}
  } = event
  
  // 兼容 body 和 data 参数，优先使用 body
  const requestData = (body && Object.keys(body).length > 0) ? body : data

  try {
    // 引入 axios（云函数环境中需要先安装依赖）
    const axios = require('axios')

    // 自动添加 API 前缀（如果路径不是以 /api/v1 开头）
    let apiPath = path
    if (!path.startsWith('/api/v1') && !path.startsWith('/health')) {
      apiPath = `/api/v1${path}`
    }

    // 构建完整的请求 URL
    let fullUrl = `${API_URL}${apiPath}`
    
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
      requestConfig.data = requestData
      console.log('请求体数据:', JSON.stringify(requestData))
    }
    // GET 请求的参数已经添加到 URL 了，不需要再添加 params
    // 否则会导致参数重复（axios 会把 URL 参数和 params 都添加）

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

