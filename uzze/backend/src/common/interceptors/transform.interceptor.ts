import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, T | { data: T }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<T | { data: T }> {
    return next.handle().pipe(
      map((data) => {
        if (
          data !== null &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data
        ) {
          return data;
        }
        return { data };
      }),
    );
  }
}
