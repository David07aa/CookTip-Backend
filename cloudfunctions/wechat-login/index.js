// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 微信小程序登录云函数
 * 直接调用微信code2session接口，避免IP白名单问题
 */
exports.main = async (event, context) => {
  const { code, nickname, avatar, nickName, avatarUrl } = event
  
  console.log('🔐 [WechatLogin] 收到登录请求:', {
    hasCode: !!code,
    nickname: nickname || nickName,
    hasAvatar: !!(avatar || avatarUrl)
  })

  try {
    // 1. 调用微信cloud.getWXContext()获取openid（推荐方式）
    const wxContext = cloud.getWXContext()
    console.log('✅ [WechatLogin] 获取微信上下文成功:', {
      openid: wxContext.OPENID ? wxContext.OPENID.substring(0, 8) + '***' : 'undefined',
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID
    })

    // 2. 准备用户数据
    const userNickname = nickName || nickname || '美食爱好者'
    const userAvatar = avatarUrl || avatar || ''
    
    const loginData = {
      code: code,
      nickname: userNickname,
      avatar: userAvatar
    }

    console.log('📡 [WechatLogin] 转发登录请求到后端...')
    console.log('   登录数据:', loginData)

    // 3. 调用云托管后端API
    const axios = require('axios')
    const API_URL = 'http://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com' // 云托管内网地址
    
    const response = await axios.post(`${API_URL}/api/v1/auth/wx-login`, loginData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WechatLogin-CloudFunction/1.0'
      },
      timeout: 10000 // 10秒超时
    })

    console.log('✅ [WechatLogin] 后端响应成功:', {
      status: response.status,
      hasToken: !!response.data?.data?.access_token,
      hasUser: !!response.data?.data?.user
    })

    // 4. 返回登录结果
    return {
      success: true,
      statusCode: response.status,
      data: response.data
    }

  } catch (error) {
    console.error('❌ [WechatLogin] 登录失败:', error.message)
    
    // 处理axios错误
    if (error.response) {
      // 后端返回了错误响应
      console.error('   后端错误:', {
        status: error.response.status,
        data: error.response.data
      })
      
      return {
        success: false,
        statusCode: error.response.status,
        data: error.response.data
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('   网络错误: 无法连接到后端服务')
      
      return {
        success: false,
        statusCode: 504,
        data: {
          code: 504,
          message: '无法连接到后端服务，请稍后重试',
          error: 'Gateway Timeout'
        }
      }
    } else {
      // 其他错误
      console.error('   未知错误:', error)
      
      return {
        success: false,
        statusCode: 500,
        data: {
          code: 500,
          message: '登录失败，请重试',
          error: error.message
        }
      }
    }
  }
}

