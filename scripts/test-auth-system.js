const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test'; // 如果需要

// 测试数据
const testUser = {
  username: `testuser_${Date.now()}`,
  password: 'Password123!',
  email: `test_${Date.now()}@example.com`,
  phone: `138000${String(Date.now()).slice(-5)}`,
  nickname: '测试用户',
};

let userToken = null;
let credentialId = null;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试函数
async function test1_Register() {
  log('\n📝 测试 1: 用户注册', 'blue');
  log('='.repeat(60), 'blue');

  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    if (response.data.access_token) {
      userToken = response.data.access_token;
      log('✅ 注册成功！', 'green');
      log(`   用户ID: ${response.data.user.id}`);
      log(`   用户名: ${response.data.user.username}`);
      log(`   邮箱: ${response.data.user.email}`);
      log(`   手机号: ${response.data.user.phone}`);
      log(`   Token: ${userToken.substring(0, 20)}...`);
      return true;
    } else {
      log('❌ 注册失败：未返回 Token', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 注册失败: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function test2_Login() {
  log('\n🔐 测试 2: 用户登录', 'blue');
  log('='.repeat(60), 'blue');

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      account: testUser.username,
      password: testUser.password,
    });

    if (response.data.access_token) {
      userToken = response.data.access_token; // 更新 token
      log('✅ 登录成功！', 'green');
      log(`   Token: ${userToken.substring(0, 20)}...`);
      return true;
    } else {
      log('❌ 登录失败：未返回 Token', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 登录失败: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function test3_LoginWithEmail() {
  log('\n📧 测试 3: 使用邮箱登录', 'blue');
  log('='.repeat(60), 'blue');

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      account: testUser.email,
      password: testUser.password,
    });

    if (response.data.access_token) {
      log('✅ 邮箱登录成功！', 'green');
      return true;
    } else {
      log('❌ 邮箱登录失败：未返回 Token', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 邮箱登录失败: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function test4_GetCredentials() {
  log('\n📋 测试 4: 获取用户凭证列表', 'blue');
  log('='.repeat(60), 'blue');

  try {
    const response = await axios.get(`${BASE_URL}/auth/credentials`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    if (response.data.credentials) {
      log('✅ 获取凭证列表成功！', 'green');
      log(`   凭证数量: ${response.data.credentials.length}`);
      response.data.credentials.forEach((cred, index) => {
        log(`   ${index + 1}. 类型: ${cred.type}, 账号: ${cred.account}, 主账号: ${cred.is_main ? '是' : '否'}, 已验证: ${cred.is_verified ? '是' : '否'}`);
        if (cred.type === 'username' && !credentialId) {
          credentialId = cred.id; // 保存一个非主账号的凭证ID用于后续测试
        }
      });
      return true;
    } else {
      log('❌ 获取凭证列表失败', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 获取凭证列表失败: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function test5_BindAccount() {
  log('\n🔗 测试 5: 绑定新邮箱', 'blue');
  log('='.repeat(60), 'blue');

  const newEmail = `new_${Date.now()}@example.com`;

  try {
    const response = await axios.post(
      `${BASE_URL}/auth/bind-account`,
      {
        type: 'email',
        account: newEmail,
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );

    if (response.data.message === '绑定成功') {
      log('✅ 绑定新邮箱成功！', 'green');
      log(`   新邮箱: ${newEmail}`);
      log(`   凭证ID: ${response.data.credential.id}`);
      credentialId = response.data.credential.id; // 保存用于解绑测试
      return true;
    } else {
      log('❌ 绑定失败', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 绑定失败: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function test6_UnbindAccount() {
  log('\n🔓 测试 6: 解绑账号', 'blue');
  log('='.repeat(60), 'blue');

  if (!credentialId) {
    log('⚠️  跳过解绑测试：没有可解绑的凭证ID', 'yellow');
    return true;
  }

  try {
    const response = await axios.delete(
      `${BASE_URL}/auth/credentials/${credentialId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );

    if (response.data.message === '解绑成功') {
      log('✅ 解绑成功！', 'green');
      return true;
    } else {
      log('❌ 解绑失败', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 解绑失败: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function test7_SetPassword() {
  log('\n🔑 测试 7: 修改密码', 'blue');
  log('='.repeat(60), 'blue');

  const newPassword = 'NewPassword123!';

  try {
    const response = await axios.post(
      `${BASE_URL}/auth/set-password`,
      { password: newPassword },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );

    if (response.data.message === '密码设置成功') {
      log('✅ 修改密码成功！', 'green');
      
      // 验证新密码是否生效
      log('\n   验证新密码...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        account: testUser.username,
        password: newPassword,
      });

      if (loginResponse.data.access_token) {
        log('   ✅ 新密码验证成功！', 'green');
        return true;
      } else {
        log('   ❌ 新密码验证失败', 'red');
        return false;
      }
    } else {
      log('❌ 修改密码失败', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 修改密码失败: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function test8_DuplicateRegister() {
  log('\n🚫 测试 8: 重复注册（预期失败）', 'blue');
  log('='.repeat(60), 'blue');

  try {
    await axios.post(`${BASE_URL}/auth/register`, testUser);
    log('❌ 重复注册应该失败但成功了', 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 409) {
      log('✅ 正确拦截了重复注册！', 'green');
      log(`   错误信息: ${error.response.data.message}`);
      return true;
    } else {
      log(`❌ 意外错误: ${error.response?.data?.message || error.message}`, 'red');
      return false;
    }
  }
}

async function test9_WrongPassword() {
  log('\n🔒 测试 9: 错误密码登录（预期失败）', 'blue');
  log('='.repeat(60), 'blue');

  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      account: testUser.username,
      password: 'WrongPassword123!',
    });
    log('❌ 错误密码应该失败但成功了', 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log('✅ 正确拦截了错误密码！', 'green');
      log(`   错误信息: ${error.response.data.message}`);
      return true;
    } else {
      log(`❌ 意外错误: ${error.response?.data?.message || error.message}`, 'red');
      return false;
    }
  }
}

// 主测试函数
async function runTests() {
  log('\n🚀 用户认证系统完整测试', 'yellow');
  log('='.repeat(60), 'yellow');
  log(`测试服务器: ${BASE_URL}`);
  log(`测试用户: ${testUser.username}`);
  log('='.repeat(60), 'yellow');

  const results = [];

  // 执行所有测试
  results.push({ name: '用户注册', result: await test1_Register() });
  results.push({ name: '用户登录', result: await test2_Login() });
  results.push({ name: '邮箱登录', result: await test3_LoginWithEmail() });
  results.push({ name: '获取凭证列表', result: await test4_GetCredentials() });
  results.push({ name: '绑定账号', result: await test5_BindAccount() });
  results.push({ name: '解绑账号', result: await test6_UnbindAccount() });
  results.push({ name: '修改密码', result: await test7_SetPassword() });
  results.push({ name: '重复注册测试', result: await test8_DuplicateRegister() });
  results.push({ name: '错误密码测试', result: await test9_WrongPassword() });

  // 测试总结
  log('\n📊 测试结果总结', 'yellow');
  log('='.repeat(60), 'yellow');

  const passedTests = results.filter((r) => r.result).length;
  const totalTests = results.length;

  results.forEach((test, index) => {
    const icon = test.result ? '✅' : '❌';
    const color = test.result ? 'green' : 'red';
    log(`${index + 1}. ${icon} ${test.name}`, color);
  });

  log('\n' + '='.repeat(60), 'yellow');
  log(`通过: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'red');
  log('='.repeat(60), 'yellow');

  if (passedTests === totalTests) {
    log('\n🎉 所有测试通过！用户认证系统运行正常！', 'green');
  } else {
    log(`\n⚠️  有 ${totalTests - passedTests} 个测试失败，请检查日志`, 'red');
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

// 启动测试
console.log('\n⚠️  请确保后端服务已启动（npm run start:dev）\n');
setTimeout(() => {
  runTests().catch((error) => {
    log(`\n❌ 测试异常: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}, 1000);

