// 微信小程序登录接口
const { sql } = require('../../lib/db');
const { wechatLogin } = require('../../lib/wechat');
const { generateToken } = require('../../lib/auth');

/**
 * 微信小程序登录
 * POST /api/auth/wechat
 * 
 * 请求体:
 * {
 *   code: string,           // 必需，wx.login() 获取的临时登录凭证
 *   nickName?: string,      // 可选，用户昵称
 *   avatar?: string,        // 可选，用户头像
 *   encryptedData?: string, // 可选，加密的用户数据
 *   iv?: string            // 可选，加密算法的初始向量
 * }
 * 
 * 响应:
 * {
 *   code: 200,
 *   message: "登录成功",
 *   data: {
 *     token: string,        // JWT token
 *     user: {
 *       id: string,
 *       nickName: string,
 *       avatar: string,
 *       isVip: boolean,
 *       isNewUser: boolean  // 是否是新注册用户
 *     }
 *   }
 * }
 */
module.exports = async (req, res) => {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      code: 405,
      message: '仅支持 POST 请求',
      data: null
    });
  }

  try {
    const { code, nickName, avatar } = req.body;

    // 验证必填参数
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: '缺少登录凭证 code',
        data: null
      });
    }

    // 调用微信登录接口获取 openid 和 session_key
    console.log('🔐 开始微信登录，code:', code.substring(0, 10) + '...');
    const wechatData = await wechatLogin(code);

    if (!wechatData.success) {
      console.error('❌ 微信登录失败:', wechatData.error);
      return res.status(401).json({
        code: 401,
        message: '微信登录失败',
        data: {
          error: wechatData.error,
          errcode: wechatData.errcode
        }
      });
    }

    const { openid, session_key, unionid } = wechatData.data;
    console.log('✅ 获取到 openid:', openid.substring(0, 10) + '...');

    // 查询用户是否已存在
    const existingUser = await sql`
      SELECT id, openid, nick_name, avatar, is_vip, created_at
      FROM users
      WHERE openid = ${openid}
    `;

    let user;
    let isNewUser = false;

    if (existingUser.rows.length > 0) {
      // 用户已存在，更新 session_key 和可选信息
      console.log('👤 用户已存在，更新信息...');
      user = existingUser.rows[0];

      // 更新 session_key 和用户信息（如果提供）
      const updateFields = ['session_key = ' + sql`${session_key}`];
      
      if (unionid) {
        updateFields.push('union_id = ' + sql`${unionid}`);
      }
      
      if (nickName) {
        updateFields.push('nick_name = ' + sql`${nickName}`);
      }
      
      if (avatar) {
        updateFields.push('avatar = ' + sql`${avatar}`);
      }

      await sql`
        UPDATE users 
        SET session_key = ${session_key},
            union_id = ${unionid || null},
            nick_name = ${nickName || user.nick_name},
            avatar = ${avatar || user.avatar},
            updated_at = CURRENT_TIMESTAMP
        WHERE openid = ${openid}
      `;

      // 重新获取更新后的用户信息
      const updatedUser = await sql`
        SELECT id, openid, nick_name, avatar, is_vip
        FROM users
        WHERE openid = ${openid}
      `;
      user = updatedUser.rows[0];

    } else {
      // 新用户，创建账号
      console.log('✨ 新用户注册...');
      isNewUser = true;

      const insertResult = await sql`
        INSERT INTO users (
          openid, 
          session_key, 
          union_id,
          nick_name, 
          avatar
        ) VALUES (
          ${openid},
          ${session_key},
          ${unionid || null},
          ${nickName || '微信用户'},
          ${avatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'}
        )
        RETURNING id, openid, nick_name, avatar, is_vip
      `;

      user = insertResult.rows[0];
      console.log('✅ 新用户创建成功，ID:', user.id);
    }

    // 生成 JWT token
    const token = generateToken({
      id: user.id,
      openid: user.openid
    });

    console.log('🎫 Token 生成成功');

    // 返回登录成功响应
    return res.status(200).json({
      code: 200,
      message: isNewUser ? '注册成功' : '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          nickName: user.nick_name,
          avatar: user.avatar,
          isVip: user.is_vip || false,
          isNewUser
        }
      }
    });

  } catch (error) {
    console.error('========== 微信登录错误 ==========');
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('=====================================');

    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: process.env.NODE_ENV === 'production' ? null : {
        error: error.message,
        stack: error.stack
      }
    });
  }
};

