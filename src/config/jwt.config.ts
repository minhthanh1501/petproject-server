import { registerAs } from '@nestjs/config';
import { CONFIG_NAMESPACE, ENV_KEY } from '../constants/env.constants.js';

/**
 * Access and refresh use DIFFERENT secrets, and the payload carries a type that
 * is checked on verify, so a refresh token can never be replayed as an access
 * token. env.validation.ts refuses to boot if the two secrets match.
 */
export const jwtConfig = registerAs(CONFIG_NAMESPACE.JWT, () => ({
  accessSecret: process.env[ENV_KEY.JWT_ACCESS_SECRET] as string,
  accessTtl: process.env[ENV_KEY.JWT_ACCESS_TTL] ?? '15m',
  refreshSecret: process.env[ENV_KEY.JWT_REFRESH_SECRET] as string,
  refreshTtl: process.env[ENV_KEY.JWT_REFRESH_TTL] ?? '30d',
}));
