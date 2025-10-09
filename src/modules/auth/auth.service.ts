import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { User } from '../../entities/user.entity';
import { WechatLoginDto } from './dto/wechat-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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
        nickname: userNickname || '美食爱好者',
        avatar: userAvatar || '',
      });
      await this.userRepository.save(user);
    } else {
      // 老用户，更新信息
      if (userNickname) user.nickname = userNickname;
      if (userAvatar) user.avatar = userAvatar;
      await this.userRepository.save(user);
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
      const response = await axios.get(url, { params });
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
}

