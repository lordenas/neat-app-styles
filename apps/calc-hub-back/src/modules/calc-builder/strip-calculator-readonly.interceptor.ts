import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { type Observable } from 'rxjs';

const READONLY_KEYS = ['calculatorId', 'createdAt'];

/**
 * Strips read-only fields from PATCH calculator body (pages/fields) so clients
 * can send full GET response without triggering forbidNonWhitelisted.
 * Runs before ValidationPipe.
 */
@Injectable()
export class StripCalculatorReadOnlyFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<{ body?: Record<string, unknown> }>();
    const body = request.body;
    if (!body) return next.handle();

    if (Array.isArray(body.pages)) {
      body.pages = body.pages.map((p: Record<string, unknown>) => {
        const rest = { ...p };
        for (const key of READONLY_KEYS) delete rest[key];
        return rest;
      });
    }
    if (Array.isArray(body.fields)) {
      body.fields = body.fields.map((f: Record<string, unknown>) => {
        const rest = { ...f };
        for (const key of READONLY_KEYS) delete rest[key];
        return rest;
      });
    }
    return next.handle();
  }
}
