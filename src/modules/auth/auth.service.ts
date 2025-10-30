import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as https from 'https';
import { User } from '../../entities/user.entity';
import { UserCredential } from '../../entities/user-credential.entity';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { CloudLoginDto } from './dto/cloud-login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BindAccountDto } from './dto/bind-account.dto';
import { CryptoService } from './crypto.service';
import { WechatAvatarUtil } from '../../utils/wechat-avatar.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserCredential)
    private credentialRepository: Repository<UserCredential>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cryptoService: CryptoService,
  ) {
    // 初始化微信头像处理工具
    WechatAvatarUtil.init(this.configService);
  }

  /**
   * 微信登录
   */
  async wechatLogin(wechatLoginDto: WechatLoginDto) {
    const { code, nickname, nickName, avatar, avatarUrl } = wechatLoginDto;

    // 兼容两种命名方式：nickname/nickName, avatar/avatarUrl
    const userNickname = nickName || nickname;
    const userAvatar = avatarUrl || avatar;

    // 1. 通过 code 换取 openid 和 session_key
    const { openid, session_key } = await this.code2Session(code);

    // 2. 查找或创建用户
    let user = await this.userRepository.findOne({ where: { openid } });

    if (!user) {
      // 新用户，创建账户
      user = this.userRepository.create({
        openid,
        session_key, // 保存 session_key，用于后续解密敏感数据
        nickname: userNickname || '美食爱好者',
        avatar: userAvatar || '',
      });
      await this.userRepository.save(user);
      console.log('✅ 新用户注册成功, user_id:', user.id);
    } else {
      // 老用户，更新信息
      if (userNickname) user.nickname = userNickname;
      if (userAvatar) user.avatar = userAvatar;
      user.session_key = session_key; // 更新 session_key
      await this.userRepository.save(user);
      console.log('✅ 老用户登录成功, user_id:', user.id);
    }

    // 3. 生成 JWT Token
    const access_token = this.generateToken(user);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 604800, // 7天
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        created_at: user.created_at,
      },
    };
  }

  /**
   * 云函数登录（使用云托管身份注入功能）
   * openid从请求头x-wx-openid获取，或从body中获取（云函数转发的情况）
   */
  async cloudLogin(cloudLoginDto: CloudLoginDto, injectedOpenid?: string, injectedUnionid?: string) {
    // 优先使用云托管注入的openid，其次使用云函数传递的openid
    const openid = injectedOpenid || cloudLoginDto.openid;
    const unionid = injectedUnionid || cloudLoginDto.unionid;
    const { nickname, avatar } = cloudLoginDto;

    console.log('🔐 [CloudLogin] 云托管身份注入登录开始');
    console.log('  - OpenID 来源:', injectedOpenid ? '云托管注入' : '云函数传递');
    console.log('  - OpenID 长度:', openid?.length);
    console.log('  - UnionID 存在:', !!unionid);
    console.log('  - Nickname:', nickname || '未提供');

    if (!openid) {
      console.error('❌ [CloudLogin] OpenID 缺失');
      console.error('   请检查：');
      console.error('   1. 云托管是否开启"身份注入"功能');
      console.error('   2. 云函数是否正确获取openid');
      throw new UnauthorizedException('OpenID 不能为空，请检查云托管配置');
    }

    // 查找或创建用户
    let user = await this.userRepository.findOne({ where: { openid } });

    // 处理微信头像：如果是微信URL，下载并上传到COS
    let processedAvatar = avatar;
    if (avatar) {
      try {
        // 如果是新用户，先创建临时用户以获取ID，然后更新头像
        if (!user) {
          user = this.userRepository.create({
            openid,
            nickname: nickname || '美食爱好者',
            avatar: '', // 先设置空，稍后更新
          });
          user = await this.userRepository.save(user);
          console.log('✅ [CloudLogin] 新用户创建, user_id:', user.id);
        }

        // 处理头像
        processedAvatar = await WechatAvatarUtil.processWechatAvatar(
          avatar,
          user.id,
          user.nickname || '用户'
        );
        console.log('✅ [CloudLogin] 头像处理完成:', processedAvatar);
      } catch (error) {
        console.error('⚠️ [CloudLogin] 头像处理失败，使用原URL:', error.message);
        processedAvatar = avatar;
      }
    }

    // 默认头像URL
    const defaultAvatar = 'https://yjsp-1367462091.cos.ap-nanjing.myqcloud.com/laoxiangji/userImage/Defaultavatar.png';

    if (!user) {
      // 新用户
      user = this.userRepository.create({
        openid,
        nickname: nickname || '美食爱好者',
        avatar: processedAvatar || defaultAvatar,
      });
      await this.userRepository.save(user);
      console.log('✅ [CloudLogin] 新用户注册成功, user_id:', user.id);
    } else {
      // 更新用户信息
      if (nickname) user.nickname = nickname;
      if (processedAvatar) user.avatar = processedAvatar;
      await this.userRepository.save(user);
      console.log('✅ [CloudLogin] 用户信息更新成功, user_id:', user.id);
    }

    // 生成 JWT Token
    const access_token = this.generateToken(user);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 604800, // 7天
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        created_at: user.created_at,
      },
    };
  }

  /**
   * 刷新 Token
   */
  async refreshToken(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const access_token = this.generateToken(user);

    return {
      access_token,
      expires_in: 604800,
    };
  }

  /**
   * 退出登录（客户端清除 Token 即可，服务端可选实现黑名单）
   */
  async logout(userId: number) {
    // 可选：将 token 加入黑名单（需要 Redis）
    // 这里简化处理，客户端清除 token 即可
    return {
      message: '退出成功',
    };
  }

  /**
   * 验证用户
   */
  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }

  /**
   * 通过 code 换取 openid
   */
  private async code2Session(code: string) {
    const appid = this.configService.get('WX_APPID') || this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WX_SECRET') || this.configService.get('WECHAT_SECRET');

    // 调试日志
    console.log('🔐 微信登录 - code2Session 开始');
    console.log('  - Code 长度:', code?.length);
    console.log('  - AppID 存在:', !!appid, appid ? `(${appid.substring(0, 6)}...)` : '未配置');
    console.log('  - Secret 存在:', !!secret, secret ? '(已配置)' : '未配置');

    if (!appid || !secret) {
      console.error('❌ 微信配置缺失: AppID 或 Secret 未配置');
      throw new UnauthorizedException('微信配置错误，请联系管理员');
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session`;
    const params = {
      appid,
      secret,
      js_code: code,
      grant_type: 'authorization_code',
    };

    try {
      console.log('📡 调用微信 API:', url);
      
      // 🔒 安全配置：默认启用 SSL 证书验证
      // 仅在环境变量明确设置时才禁用（不推荐）
      const skipSSLVerify = this.configService.get('SKIP_SSL_VERIFY') === 'true';
      
      const axiosConfig: any = { params };
      
      if (skipSSLVerify) {
        console.warn('⚠️  SSL 证书验证已禁用（不安全，仅用于调试）');
        axiosConfig.httpsAgent = new https.Agent({
          rejectUnauthorized: false,
        });
      }
      
      const response = await axios.get(url, axiosConfig);
      console.log('📥 微信 API 响应:', JSON.stringify(response.data));
      
      const { openid, session_key, errcode, errmsg } = response.data;

      if (errcode) {
        console.error('❌ 微信返回错误码:', errcode, errmsg);
        throw new UnauthorizedException(
          `微信登录失败: ${errmsg} (错误码: ${errcode})`,
        );
      }

      if (!openid) {
        console.error('❌ 微信未返回 openid');
        throw new UnauthorizedException('微信登录失败: 未获取到用户信息');
      }

      console.log('✅ 获取 openid 成功:', openid.substring(0, 8) + '...');
      return { openid, session_key };
    } catch (error) {
      console.error('❌ 微信登录异常:', error.message);
      console.error('   完整错误:', error);
      
      // 如果是已经抛出的 UnauthorizedException，直接传递
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // 其他错误（网络错误等）
      throw new UnauthorizedException('微信登录失败，请重试');
    }
  }

  /**
   * 生成 JWT Token
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      openid: user.openid,
      nickname: user.nickname,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * 用户注册（用户名密码方式）
   */
  async register(registerDto: RegisterDto) {
    const { username, password, email, phone, nickname } = registerDto;

    // 1. 检查用户名是否已存在
    const existingCredential = await this.credentialRepository.findOne({
      where: { type: 'username', account: username },
    });

    if (existingCredential) {
      throw new ConflictException('用户名已存在');
    }

    // 2. 检查邮箱是否已存在（如果提供）
    if (email) {
      const existingEmail = await this.credentialRepository.findOne({
        where: { type: 'email', account: email },
      });
      if (existingEmail) {
        throw new ConflictException('邮箱已被注册');
      }
    }

    // 3. 检查手机号是否已存在（如果提供）
    if (phone) {
      const existingPhone = await this.credentialRepository.findOne({
        where: { type: 'phone', account: phone },
      });
      if (existingPhone) {
        throw new ConflictException('手机号已被注册');
      }
    }

    // 4. 加密密码
    const hashedPassword = await this.cryptoService.hashPassword(password);

    // 5. 创建用户
    const user = this.userRepository.create({
      openid: this.cryptoService.generateUniqueId(),
      nickname: nickname || username,
      username,
      email,
      phone,
      password_hash: hashedPassword,
      is_verified: false, // 新注册用户未验证
    });

    await this.userRepository.save(user);

    // 6. 创建用户凭证记录
    const credentials: UserCredential[] = [];

    // 用户名凭证（主账号）
    credentials.push(
      this.credentialRepository.create({
        user_id: user.id,
        type: 'username',
        account: username,
        is_main: true,
        is_verified: true,
      }),
    );

    // 邮箱凭证
    if (email) {
      credentials.push(
        this.credentialRepository.create({
          user_id: user.id,
          type: 'email',
          account: email,
          is_main: false,
          is_verified: false, // 需要验证
        }),
      );
    }

    // 手机号凭证
    if (phone) {
      credentials.push(
        this.credentialRepository.create({
          user_id: user.id,
          type: 'phone',
          account: phone,
          is_main: false,
          is_verified: false, // 需要验证
        }),
      );
    }

    await this.credentialRepository.save(credentials);

    // 7. 生成 Token
    const access_token = this.generateToken(user);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 604800, // 7天
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    };
  }

  /**
   * 通用登录（用户名/邮箱/手机号）
   */
  async login(loginDto: LoginDto) {
    const { account, password } = loginDto;

    // 1. 查找账号对应的凭证
    const credential = await this.credentialRepository.findOne({
      where: [
        { type: 'username', account },
        { type: 'email', account },
        { type: 'phone', account },
      ],
      relations: ['user'],
    });

    if (!credential) {
      throw new UnauthorizedException('账号不存在');
    }

    const user = await this.userRepository.findOne({
      where: { id: credential.user_id },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 2. 验证密码
    if (!user.password_hash) {
      throw new UnauthorizedException('该账号未设置密码，请使用其他方式登录');
    }

    const isPasswordValid = await this.cryptoService.validatePassword(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    // 3. 生成 Token
    const access_token = this.generateToken(user);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 604800, // 7天
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    };
  }

  /**
   * 绑定账号
   */
  async bindAccount(userId: number, bindAccountDto: BindAccountDto) {
    const { type, account } = bindAccountDto;

    // 1. 检查账号是否已被其他用户绑定
    const existing = await this.credentialRepository.findOne({
      where: { type, account },
    });

    if (existing) {
      if (existing.user_id === userId) {
        throw new BadRequestException('该账号已绑定到当前用户');
      }
      throw new ConflictException('该账号已被其他用户绑定');
    }

    // 2. 更新用户表对应字段
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (type === 'username') user.username = account;
    if (type === 'email') user.email = account;
    if (type === 'phone') user.phone = account;

    await this.userRepository.save(user);

    // 3. 创建凭证记录
    const credential = this.credentialRepository.create({
      user_id: userId,
      type,
      account,
      is_main: false,
      is_verified: false, // 需要验证
    });

    await this.credentialRepository.save(credential);

    return {
      message: '绑定成功',
      credential: {
        id: credential.id,
        type: credential.type,
        account: credential.account,
        is_verified: credential.is_verified,
      },
    };
  }

  /**
   * 解绑账号
   */
  async unbindAccount(userId: number, credentialId: number) {
    const credential = await this.credentialRepository.findOne({
      where: { id: credentialId, user_id: userId },
    });

    if (!credential) {
      throw new BadRequestException('凭证不存在');
    }

    if (credential.is_main) {
      throw new BadRequestException('主账号不能解绑');
    }

    await this.credentialRepository.remove(credential);

    return {
      message: '解绑成功',
    };
  }

  /**
   * 获取用户的所有凭证
   */
  async getUserCredentials(userId: number) {
    const credentials = await this.credentialRepository.find({
      where: { user_id: userId },
      order: { is_main: 'DESC', created_at: 'ASC' },
    });

    return {
      credentials: credentials.map((c) => ({
        id: c.id,
        type: c.type,
        account: c.account,
        is_main: c.is_main,
        is_verified: c.is_verified,
        created_at: c.created_at,
      })),
    };
  }

  /**
   * 设置密码（为已有账号添加密码登录）
   */
  async setPassword(userId: number, password: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const hashedPassword = await this.cryptoService.hashPassword(password);
    user.password_hash = hashedPassword;

    await this.userRepository.save(user);

    return {
      message: '密码设置成功',
    };
  }
}

