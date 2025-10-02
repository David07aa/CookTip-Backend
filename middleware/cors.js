/**
 * 统一 CORS 处理中间件
 * 用于所有 API 接口的跨域请求处理
 */

/**
 * 设置 CORS 响应头
 * @param {Object} res - HTTP 响应对象
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Access-Control-Max-Age', '86400'); // 24小时预检缓存
}

/**
 * 处理 CORS 请求
 * @param {Object} req - HTTP 请求对象
 * @param {Object} res - HTTP 响应对象
 * @returns {Boolean} 如果是 OPTIONS 请求返回 true，否则返回 false
 */
function handleCors(req, res) {
  // 设置 CORS 头
  setCorsHeaders(res);
  
  // 处理预检请求 (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // 表示已处理完毕
  }
  
  return false; // 继续处理其他逻辑
}

/**
 * 创建带 CORS 的 API 处理器包装函数
 * @param {Function} handler - API 处理函数
 * @returns {Function} 包装后的处理函数
 */
function withCors(handler) {
  return async (req, res) => {
    // 先处理 CORS
    if (handleCors(req, res)) {
      return; // OPTIONS 请求已处理
    }
    
    // 执行原始处理函数
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
      });
    }
  };
}

module.exports = {
  setCorsHeaders,
  handleCors,
  withCors
};

