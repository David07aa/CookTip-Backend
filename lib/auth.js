const jwt = require('jsonwebtoken');

/**
 * 生成JWT Token
 * @param {string} userId - 用户ID
 * @returns {string} JWT token
 */
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7天有效期
  );
}

/**
 * 验证JWT Token
 * @param {string} token - JWT token
 * @returns {object|null} 解码后的token数据，失败返回null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token验证失败:', error.message);
    return null;
  }
}

/**
 * 从请求中获取用户ID
 * @param {object} req - 请求对象
 * @returns {string|null} 用户ID，失败返回null
 */
function getUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyToken(token);
  
  return decoded ? decoded.id : null;
}

module.exports = {
  generateToken,
  verifyToken,
  getUserFromRequest
};
