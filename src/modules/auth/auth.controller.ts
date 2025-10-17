import { Controller, Post, Body, UseGuards, HttpCode, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { CloudLoginDto } from './dto/cloud-login.dto';
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
}

