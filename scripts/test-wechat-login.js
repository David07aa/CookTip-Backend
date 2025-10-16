/**
 * 测试微信登录配置
 * 用于验证 AppID 和 Secret 是否正确配置
 */

const axios = require('axios');

async function testWechatLogin() {
  console.log('='.repeat(100));
  console.log('微信登录配置测试');
  console.log('='.repeat(100));

  // 读取环境变量
  const WX_APPID = process.env.WX_APPID || process.env.WECHAT_APPID;
  const WX_SECRET = process.env.WX_SECRET || process.env.WECHAT_SECRET;

  console.log('\n📋 环境变量检查:');
  console.log('  WX_APPID:', WX_APPID ? `✅ ${WX_APPID.substring(0, 10)}...` : '❌ 未配置');
  console.log('  WX_SECRET:', WX_SECRET ? '✅ 已配置' : '❌ 未配置');

  if (!WX_APPID || !WX_SECRET) {
    console.log('\n❌ 错误: AppID 或 Secret 未配置!');
    console.log('\n请检查以下位置的配置:');
    console.log('  1. cloudbase-env-vars.json');
    console.log('  2. .env 文件');
    console.log('  3. 云托管控制台的环境变量配置');
    process.exit(1);
  }

  // 测试 code（这只是一个示例，实际的 code 需要从小程序获取）
  const testCode = '081abc123test'; // 这个会失败，但我们可以看到错误信息

  console.log('\n📡 测试微信 API 调用...');
  console.log('  URL: https://api.weixin.qq.com/sns/jscode2session');
  console.log('  测试code:', testCode);

  try {
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: WX_APPID,
        secret: WX_SECRET,
        js_code: testCode,
        grant_type: 'authorization_code'
      }
    });

    console.log('\n📥 微信 API 响应:', response.data);

    if (response.data.errcode) {
      console.log('\n⚠️  微信返回错误码:', response.data.errcode);
      console.log('   错误信息:', response.data.errmsg);
      
      // 常见错误码说明
      const errorCodes = {
        40029: '❌ code 无效（这是正常的，因为我们使用的是测试code）',
        40163: '❌ code 已被使用',
        40125: '❌ AppID 无效或未绑定',
        '-1': '❌ 系统繁忙',
        '40001': '❌ AppSecret 错误',
        '40002': '❌ 无效的 grant_type'
      };

      const explanation = errorCodes[response.data.errcode] || '未知错误';
      console.log('   说明:', explanation);

      if (response.data.errcode === 40029) {
        console.log('\n✅ 配置正确! (40029 表示 code 无效，但 AppID 和 Secret 是正确的)');
        console.log('\n💡 提示: 真实的 code 需要从小程序的 wx.login() 获取');
      } else if (response.data.errcode === 40125 || response.data.errcode === 40001) {
        console.log('\n❌ 配置错误! 请检查:');
        console.log('   1. AppID 是否正确');
        console.log('   2. Secret 是否正确');
        console.log('   3. AppID 和 Secret 是否匹配');
      }
    } else {
      console.log('\n✅ 成功获取到 openid:', response.data.openid);
      console.log('   session_key:', response.data.session_key ? '已返回' : '未返回');
    }
  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
  }

  console.log('\n' + '='.repeat(100));
  console.log('✅ 测试完成');
  console.log('='.repeat(100));
}

// 运行测试
testWechatLogin();

