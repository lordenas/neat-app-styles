import { BadRequestException } from '@nestjs/common';

export class FormulaDslValidationError extends BadRequestException {
  constructor(
    message: string,
    readonly code: string,
    readonly path: string,
  ) {
    super({
      message,
      code,
      path,
    });
  }
}

export class FormulaDslRuntimeError extends BadRequestException {
  constructor(
    message: string,
    readonly code: string,
    readonly path: string,
  ) {
    super({
      message,
      code,
      path,
    });
  }
}
