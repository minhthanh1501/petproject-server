import { plainToInstance } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, Max, Min, MinLength, validateSync } from 'class-validator';
import { BOOLEAN_STRING, NodeEnv } from '../constants/env.constants.js';

const SECRET_MIN_LENGTH = 32;
const PORT_MIN = 1;
const PORT_MAX = 65535;
const BOOLEAN_VALUES = [BOOLEAN_STRING.TRUE, BOOLEAN_STRING.FALSE];
/** redis:// or rediss:// (TLS), with an optional user:pass, port and /db index. */
const REDIS_URL_PATTERN = /^rediss?:\/\/(?:[^:@/]*(?::[^@/]*)?@)?[^:@/]+(?::\d{1,5})?(?:\/\d+)?$/;
const TTL_MIN_MS = 1000;

/**
 * Two settings here are deliberately the OPPOSITE of the request ValidationPipe:
 *
 *  - enableImplicitConversion: true, because every env value arrives as a string.
 *  - whitelist: false, because the environment holds hundreds of unrelated OS
 *    variables and stripping them would empty ConfigService.
 *
 * Booleans stay strings with an IsIn check rather than IsBoolean: class-transformer's
 * implicit conversion runs Boolean(value), which turns the string 'false' into true.
 */
class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.DEVELOPMENT;

  @IsInt()
  @Min(PORT_MIN)
  @Max(PORT_MAX)
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  GLOBAL_PREFIX?: string;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  /**
   * The QR link base. Validated as a URL at boot because a wrong value prints
   * thousands of dead QR codes before anyone notices.
   */
  @IsUrl({ require_tld: false })
  PUBLIC_BASE_URL: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsInt()
  @Min(PORT_MIN)
  @Max(PORT_MAX)
  DB_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  @IsIn(BOOLEAN_VALUES)
  @IsOptional()
  DB_LOGGING?: string;

  @IsIn(BOOLEAN_VALUES)
  @IsOptional()
  DB_SYNCHRONIZE?: string;

  @IsString()
  @MinLength(SECRET_MIN_LENGTH)
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TTL: string = '15m';

  @IsString()
  @MinLength(SECRET_MIN_LENGTH)
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TTL: string = '30d';

  @IsIn(BOOLEAN_VALUES)
  @IsOptional()
  SWAGGER_ENABLED?: string;

  /**
   * A full URI, not a hostname. Validated at boot because the alternative is
   * discovering it on the first cache read in production.
   */
  @Matches(REDIS_URL_PATTERN, {
    message: 'REDIS_URL must be a redis:// or rediss:// URI, e.g. redis://localhost:6379',
  })
  REDIS_URL: string;

  /** Milliseconds. The floor catches a value copied from a seconds-based config. */
  @IsInt()
  @Min(TTL_MIN_MS)
  @IsOptional()
  REDIS_DEFAULT_TTL?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  REDIS_NAMESPACE?: string;
}

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: false,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const detail = errors
      .map((error) => Object.values(error.constraints ?? {}).join('; '))
      .join('\n  - ');
    throw new Error(`Invalid environment:\n  - ${detail}`);
  }

  // Cross-field rules the decorators cannot express.
  if (validated.JWT_ACCESS_SECRET === validated.JWT_REFRESH_SECRET) {
    throw new Error(
      'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ, or a refresh token can be replayed as an access token.',
    );
  }

  if (
    validated.NODE_ENV === NodeEnv.PRODUCTION &&
    validated.DB_SYNCHRONIZE === BOOLEAN_STRING.TRUE
  ) {
    throw new Error('DB_SYNCHRONIZE must not be true when NODE_ENV is production.');
  }

  return validated as unknown as Record<string, unknown>;
}
