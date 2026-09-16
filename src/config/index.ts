import { appConfig } from './app.config.js';
import { databaseConfig } from './database.config.js';
import { jwtConfig } from './jwt.config.js';
import { redisConfig } from './redis.config.js';

export const ALL_CONFIG_NAMESPACES = [appConfig, databaseConfig, jwtConfig, redisConfig];

export { appConfig, databaseConfig, jwtConfig, redisConfig };
export { validateEnv } from './env.validation.js';
