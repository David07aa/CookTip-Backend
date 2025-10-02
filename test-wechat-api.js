// 测试微信登录 API
const https = require('https');

const API_URL = 'https://cooktip-backend.vercel.app/api/auth/wechat';

// 测试数据（使用模拟的 code）
const testData = JSON.stringify({
  code: 'test_code_123',
  nickName: '测试用户',
  avatar: 'https://example.com/avatar.jpg'
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

console.log('🔍 测试微信登录接口...');
console.log('URL:', API_URL);
console.log('');

const req = https.request(API_URL, options, (res) => {
  console.log('✅ 接口响应:');
  console.log('状态码:', res.statusCode);
  console.log('响应头:', res.headers);
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('响应内容:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
});

req.write(testData);
req.end();

