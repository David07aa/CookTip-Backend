// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 微信小程序登录云函数（转发模式 + 身份注入）
 * 
 * 工作原理：
 * 1. 云函数获取openid（作为备用方案）
 * 2. 转发请求到云托管后端
 * 3. 云托管自动注入身份信息到请求头（x-wx-openid）
 * 4. 后端优先使用请求头的openid，如果没有则使用body中的openid
 */
exports.main = async (event, context) => {
  const { code, nickname, avatar, nickName, avatarUrl } = event
  
  console.log('🔐 [WechatLogin] 收到登录请求:', {
    hasCode: !!code,
    nickname: nickname || nickName,
    hasAvatar: !!(avatar || avatarUrl)
  })

  try {
    // 1. 获取微信上下文（作为备用方案）
    const wxContext = cloud.getWXContext()
    console.log('✅ [WechatLogin] 获取微信上下文:', {
      hasOpenid: !!wxContext.OPENID,
      hasAppid: !!wxContext.APPID,
      hasUnionid: !!wxContext.UNIONID
    })

    // 2. 准备用户数据
    const userNickname = nickName || nickname || '美食爱好者'
    const userAvatar = avatarUrl || avatar || ''
    
    const loginData = {
      openid: wxContext.OPENID,    // 作为备用，如果云托管没注入则使用这个
      unionid: wxContext.UNIONID,  
      nickname: userNickname,
      avatar: userAvatar
    }

    console.log('📡 [WechatLogin] 转发请求到云托管后端...')
    console.log('   - 备用openid:', wxContext.OPENID ? 'exists' : 'missing')
    console.log('   - 云托管将自动注入身份信息到请求头')

    // 3. 转发到云托管后端（云托管会自动注入x-wx-openid等请求头）
    const axios = require('axios')
    const API_URL = 'http://rnvvjhwh.yjsp-ytg.0er4gbxk.1tj8lj27.com'
    
    const response = await axios.post(`${API_URL}/api/v1/auth/cloud-login`, loginData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WechatLogin-CloudFunction/3.0'
      },
      timeout: 10000
    })

    console.log('✅ [WechatLogin] 后端响应成功:', {
      status: response.status,
      hasToken: !!response.data?.data?.access_token
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

