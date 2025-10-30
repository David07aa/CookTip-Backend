import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const configService = app.get(ConfigService);

  logger.log('🔧 Initializing CookTip Backend...');

  // 设置全局前缀（排除健康检查路径）
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/', 'health'],
  });

  // 启用CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局拦截器 - 按顺序执行
  app.useGlobalInterceptors(
    new LoggingInterceptor(),  // 日志拦截器（第一个）
    new TransformInterceptor(), // 响应转换拦截器
  );

  // 全局异常过滤器 - AllExceptionsFilter 必须最先注册
  app.useGlobalFilters(
    new AllExceptionsFilter(),  // 捕获所有异常（包括未处理的错误）
    new HttpExceptionFilter(),  // HTTP异常过滤器
  );

  // Swagger文档配置
  const config = new DocumentBuilder()
    .setTitle('CookTip API')
    .setDescription('CookTip 美食菜谱小程序后端API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('认证模块', '微信登录、Token刷新、退出登录')
    .addTag('用户模块', '用户信息管理')
    .addTag('食谱模块', '食谱CRUD、点赞、收藏')
    .addTag('评论模块', '评论管理')
    .addTag('收藏模块', '收藏管理')
    .addTag('搜索模块', '食谱搜索')
    .addTag('购物清单模块', '购物清单管理')
    .addTag('分类模块', '分类管理')
    .addTag('文件上传模块', '图片上传')
    .addTag('统计模块', '数据统计')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`✅ CookTip Backend started successfully!`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start application:', err);
  logger.error(err.stack);
  process.exit(1);
});

