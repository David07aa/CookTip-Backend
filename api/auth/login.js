const { code2Session } = require('../../lib/wechat');
const { query, queryOne } = require('../../lib/db');
const { generateToken } = require('../../lib/auth');

/**
 * 微信小程序登录接口
 * POST /api/auth/login
 * Body: { code, nickName?, avatar? }
 */
module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '方法不允许',
      message: '仅支持POST请求'
    });
  }

  try {
    const { code, nickName, avatar } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: '参数错误',
        message: '缺少code参数'
      });
    }

    // 1. 调用微信API获取openid
    const wxData = await code2Session(code);
    const { openid } = wxData;

    if (!openid) {
      return res.status(400).json({
        success: false,
        error: '微信登录失败',
        message: '无法获取用户openid'
      });
    }

    // 2. 查找或创建用户
    let user = await queryOne(
      'SELECT * FROM users WHERE openid = ?',
      [openid]
    );

    if (!user) {
      // 创建新用户
      const userId = generateUUID();
      const defaultNickName = nickName || '美食爱好者';
      const defaultAvatar = avatar || 'https://i.pravatar.cc/300';

      await query(
        `INSERT INTO users (id, openid, nick_name, avatar, created_at, updated_at) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [userId, openid, defaultNickName, defaultAvatar]
      );

      user = await queryOne(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
    } else if (nickName || avatar) {
      // 更新用户信息
      await query(
        `UPDATE users SET nick_name = COALESCE(?, nick_name), avatar = COALESCE(?, avatar), updated_at = NOW() WHERE id = ?`,
        [nickName, avatar, user.id]
      );
      
      user = await queryOne(
        'SELECT * FROM users WHERE id = ?',
        [user.id]
      );
    }

    // 3. 生成JWT token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          nickName: user.nick_name,
          avatar: user.avatar,
          bio: user.bio,
          isVip: user.is_vip === 1,
          followers: user.followers,
          following: user.following,
          totalLikes: user.total_likes,
          recipeCount: user.recipe_count
        }
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误',
      message: error.message
    });
  }
};

// 生成UUID辅助函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
