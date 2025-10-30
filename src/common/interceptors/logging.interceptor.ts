import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    this.logger.log(`→ ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.log(
          `← ${method} ${url} ${response.statusCode} - ${delay}ms`,
        );
      }),
      catchError((err) => {
        const delay = Date.now() - now;
        this.logger.error(
          `✗ ${method} ${url} ${err.status || 500} - ${delay}ms`,
        );
        this.logger.error(`Error details: ${err.message}`);
        if (err.stack) {
          this.logger.error(`Stack trace: ${err.stack}`);
        }
        throw err;
      }),
    );
  }
}

