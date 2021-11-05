import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
  HttpException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('ErrorsInterceptor 호출 - 전');
    return next.handle().pipe(
      catchError((err) => {
        console.log('ErrorsInterceptor 호출 - 후');
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: '서버에러!!',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
    );
  }
}
