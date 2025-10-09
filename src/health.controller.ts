import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
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
}

