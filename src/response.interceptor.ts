import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}
/* NestInterceptor는 라우터(controller)와 client 사이에서 동작한다.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    console.log('ResponseInterceptor 호출 - 전');
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const description = '';
    return next.handle().pipe(
      map((data) => {
        console.log('ResponseInterceptor 호출 - 후');
        return { ...data };
      }),
    );
  }
}
