import { Controller, Post, Body, UseGuards, HttpCode, Headers, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { CloudLoginDto } from './dto/cloud-login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BindAccountDto } from './dto/bind-account.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('认证模块')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('wechat-login')
  @HttpCode(200)
  @ApiOperation({ summary: '微信登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  async wechatLogin(@Body() wechatLoginDto: WechatLoginDto) {
    return this.authService.wechatLogin(wechatLoginDto);
  }

  // 兼容前端的 wx-login 路由
  @Public()
  @Post('wx-login')
  @HttpCode(200)
  @ApiOperation({ summary: '微信登录（兼容路由）' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  async wxLogin(@Body() wechatLoginDto: WechatLoginDto) {
    return this.authService.wechatLogin(wechatLoginDto);
  }

  // 云函数登录（支持云托管身份注入）
  @Public()
  @Post('cloud-login')
  @HttpCode(200)
  @ApiOperation({ 
    summary: '云函数登录（支持云托管身份注入）',
    description: '优先从请求头x-wx-openid获取openid（云托管身份注入），如果没有则从body获取（云函数传递）'
  })
  @ApiHeader({ name: 'x-wx-openid', required: false, description: '微信云托管注入的openid' })
  @ApiHeader({ name: 'x-wx-unionid', required: false, description: '微信云托管注入的unionid' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  async cloudLogin(
    @Body() cloudLoginDto: CloudLoginDto,
    @Headers('x-wx-openid') wxOpenid?: string,
    @Headers('x-wx-unionid') wxUnionid?: string,
  ) {
    console.log('📥 [CloudLogin] 收到登录请求');
    console.log('  - 请求头 x-wx-openid:', wxOpenid ? `${wxOpenid.substring(0, 8)}***` : '未提供');
    console.log('  - 请求体 openid:', cloudLoginDto.openid ? `${cloudLoginDto.openid.substring(0, 8)}***` : '未提供');
    
    return this.authService.cloudLogin(cloudLoginDto, wxOpenid, wxUnionid);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '刷新Token' })
  @ApiResponse({ status: 200, description: 'Token刷新成功' })
  async refreshToken(@CurrentUser('id') userId: number) {
    return this.authService.refreshToken(userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '退出登录' })
  @ApiResponse({ status: 200, description: '退出成功' })
  async logout(@CurrentUser('id') userId: number) {
    return this.authService.logout(userId);
  }

  // ========== 新增：用户名密码登录功能 ==========

  @Public()
  @Post('register')
  @HttpCode(201)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 限流：1分钟最多3次
  @ApiOperation({ summary: '用户注册（用户名密码方式）' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '用户名/邮箱/手机号已存在' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 限流：1分钟最多5次
  @ApiOperation({ 
    summary: '通用登录（用户名/邮箱/手机号）',
    description: '支持使用用户名、邮箱或手机号登录'
  })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '账号不存在或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('bind-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '绑定账号' })
  @ApiResponse({ status: 200, description: '绑定成功' })
  @ApiResponse({ status: 409, description: '账号已被绑定' })
  async bindAccount(
    @CurrentUser('id') userId: number,
    @Body() bindAccountDto: BindAccountDto,
  ) {
    return this.authService.bindAccount(userId, bindAccountDto);
  }

  @Get('credentials')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户的所有凭证' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserCredentials(@CurrentUser('id') userId: number) {
    return this.authService.getUserCredentials(userId);
  }

  @Delete('credentials/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '解绑账号' })
  @ApiResponse({ status: 200, description: '解绑成功' })
  @ApiResponse({ status: 400, description: '主账号不能解绑' })
  async unbindAccount(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) credentialId: number,
  ) {
    return this.authService.unbindAccount(userId, credentialId);
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '设置密码' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setPassword(
    @CurrentUser('id') userId: number,
    @Body('password') password: string,
  ) {
    return this.authService.setPassword(userId, password);
  }
}

