import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { ClassConstructor } from 'class-transformer';

/**
 * Валидирует raw input в DTO: plainToInstance + validate, при ошибках — BadRequestException.
 */
@Injectable()
export class InputValidationService {
  async validateAndTransform<T extends object>(
    DtoClass: ClassConstructor<T>,
    rawInput: Record<string, unknown>,
  ): Promise<T> {
    const instance = plainToInstance(DtoClass, rawInput, {
      enableImplicitConversion: true,
    });
    const errors = await validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints ?? {}),
      );
      throw new BadRequestException({
        message: messages,
        error: 'Bad Request',
      });
    }
    return instance;
  }
}
