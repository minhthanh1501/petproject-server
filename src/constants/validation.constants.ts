import type { ValidationPipeOptions } from '@nestjs/common';

/**
 * enableImplicitConversion is deliberately FALSE here, the opposite of the env
 * validator. Implicit conversion silently coerces "abc" to NaN and makes
 * @IsString() pass on a numeric query param. An explicit @Type() is three
 * characters and honest.
 *
 * With no global exception filter, exceptionFactory is the single place the 400
 * body shape is decided.
 */
export const VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  stopAtFirstError: true,
  transformOptions: { enableImplicitConversion: false },
};

export const API_VERSION = {
  V1: '1',
} as const;
