const { getUserFromRequest } = require('../lib/auth');
const { queryOne } = require('../lib/db');

/**
 * 认证中间件 - 验证用户登录状态
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @returns {Promise<null|void>} 认证成功返回null，失败直接响应错误
 */
async function requireAuth(req, res) {
  const userId = getUserFromRequest(req);
  
  if (!userId) {
    res.status(401).json({
      success: false,
      error: '未授权',
      message: '请先登录'
    });
    return res; // 返回res表示已处理
  }
  
  try {
    // 查询用户信息
    const user = await queryOne(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: '用户不存在',
        message: '账号已失效'
      });
      return res;
    }
    
    // 将用户信息附加到请求对象
    req.user = user;
    return null; // 返回null表示认证成功
    
  } catch (error) {
    console.error('认证错误:', error);
    res.status(500).json({
      success: false,
      error: '认证失败',
      message: error.message
    });
    return res;
  }
}

/**
 * 可选认证中间件 - 尝试获取用户信息，但不强制要求登录
 * @param {object} req - 请求对象
 * @returns {Promise<void>}
 */
async function optionalAuth(req) {
  const userId = getUserFromRequest(req);
  
  if (userId) {
    try {
      const user = await queryOne(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.error('可选认证错误:', error);
    }
  }
}

module.exports = {
  requireAuth,
  optionalAuth
};
