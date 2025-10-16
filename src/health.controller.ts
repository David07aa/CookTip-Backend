import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get()
  healthCheck() {
    return {
      status: 'ok',
      message: 'CookTip API is running',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  health() {
    return {
      status: 'healthy',
      service: 'cooktip-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/env-check')
  envCheck() {
    const wxAppId = this.configService.get('WX_APPID') || this.configService.get('WECHAT_APPID');
    const wxSecret = this.configService.get('WX_SECRET') || this.configService.get('WECHAT_SECRET');
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: this.configService.get('NODE_ENV'),
        port: this.configService.get('PORT'),
      },
      wechat: {
        appIdConfigured: !!wxAppId,
        appIdPrefix: wxAppId ? wxAppId.substring(0, 6) + '***' : 'NOT_SET',
        secretConfigured: !!wxSecret,
        secretLength: wxSecret ? wxSecret.length : 0,
      },
      database: {
        host: this.configService.get('DB_HOST'),
        port: this.configService.get('DB_PORT'),
        database: this.configService.get('DB_DATABASE'),
        userConfigured: !!this.configService.get('DB_USERNAME'),
      },
    };
  }
}

