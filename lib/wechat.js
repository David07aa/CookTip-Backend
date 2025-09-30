const axios = require('axios');

/**
 * 微信小程序配置
 */
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID,
  appSecret: process.env.WECHAT_SECRET,
  apiUrl: 'https://api.weixin.qq.com'
};

/**
 * 通过code获取微信用户的openid和session_key
 * @param {string} code - 小程序登录code
 * @returns {Promise<object>} { openid, session_key, unionid }
 */
async function code2Session(code) {
  try {
    const response = await axios.get(`${WECHAT_CONFIG.apiUrl}/sns/jscode2session`, {
      params: {
        appid: WECHAT_CONFIG.appId,
        secret: WECHAT_CONFIG.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, unionid, errcode, errmsg } = response.data;

    if (errcode) {
      throw new Error(`微信接口错误: ${errcode} - ${errmsg}`);
    }

    return {
      openid,
      session_key,
      unionid
    };
  } catch (error) {
    console.error('微信登录失败:', error.message);
    throw new Error('微信登录失败: ' + error.message);
  }
}

/**
 * 获取微信小程序access_token
 * @returns {Promise<string>} access_token
 */
async function getAccessToken() {
  try {
    const response = await axios.get(`${WECHAT_CONFIG.apiUrl}/cgi-bin/token`, {
      params: {
        grant_type: 'client_credential',
        appid: WECHAT_CONFIG.appId,
        secret: WECHAT_CONFIG.appSecret
      }
    });

    const { access_token, errcode, errmsg } = response.data;

    if (errcode) {
      throw new Error(`获取access_token失败: ${errcode} - ${errmsg}`);
    }

    return access_token;
  } catch (error) {
    console.error('获取access_token失败:', error.message);
    throw error;
  }
}

module.exports = {
  code2Session,
  getAccessToken,
  WECHAT_CONFIG
};
