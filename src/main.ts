import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 设置全局前缀
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

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

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

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
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

