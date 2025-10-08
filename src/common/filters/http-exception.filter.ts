import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let error = null;

    if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || message;
      error = (exceptionResponse as any).error || null;
    }

    // 如果message是数组（验证错误），取第一个
    if (Array.isArray(message)) {
      message = message[0];
    }

    const errorResponse = {
      code: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 开发环境打印详细错误
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', errorResponse);
    }

    response.status(status).json(errorResponse);
  }
}

