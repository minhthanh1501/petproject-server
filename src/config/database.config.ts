import { registerAs } from '@nestjs/config';
import { BOOLEAN_STRING, CONFIG_NAMESPACE, ENV_KEY } from '../constants/env.constants.js';
import type { DatabaseEnv } from '../database/data-source-options.js';

/**
 * The single place DB_* env keys are read. Everything downstream consumes the
 * typed ConfigType of this namespace.
 */
export const databaseConfig = registerAs(
  CONFIG_NAMESPACE.DATABASE,
  (): DatabaseEnv => ({
    host: process.env[ENV_KEY.DB_HOST] as string,
    port: Number(process.env[ENV_KEY.DB_PORT]),
    username: process.env[ENV_KEY.DB_USERNAME] as string,
    password: process.env[ENV_KEY.DB_PASSWORD] as string,
    database: process.env[ENV_KEY.DB_DATABASE] as string,
    logging: process.env[ENV_KEY.DB_LOGGING] === BOOLEAN_STRING.TRUE,
  }),
);
