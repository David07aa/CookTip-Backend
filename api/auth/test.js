// 测试接口 - 验证路由是否工作
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    code: 200,
    message: '测试接口正常',
    data: {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.url
    }
  });
};

