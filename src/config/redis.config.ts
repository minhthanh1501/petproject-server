import { registerAs } from '@nestjs/config';
import { CACHE } from '../constants/cache.constants.js';
import { CONFIG_NAMESPACE, ENV_KEY } from '../constants/env.constants.js';

/**
 * The single place REDIS_* env keys are read.
 *
 * The connection is a full URI (redis://user:pass@host:port/db), not a bare
 * hostname — that is what @keyv/redis createKeyv() expects, and it is the only
 * form that can carry credentials and a database index. rediss:// for TLS.
 */
export const redisConfig = registerAs(
  CONFIG_NAMESPACE.REDIS,
  () => ({
  url: process.env[ENV_KEY.REDIS_URL] as string,
  /** Milliseconds. See CACHE.DEFAULT_TTL_MS for why the unit matters. */
  defaultTtl: Number(process.env[ENV_KEY.REDIS_DEFAULT_TTL] ?? CACHE.DEFAULT_TTL_MS),
  namespace: process.env[ENV_KEY.REDIS_NAMESPACE] ?? CACHE.DEFAULT_NAMESPACE,
}));
