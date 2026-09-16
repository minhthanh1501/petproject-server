/**
 * Env key names live here so no raw string reaches a config factory. Nothing
 * outside src/config reads process.env or calls configService.get with a literal.
 */
export const ENV_KEY = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  GLOBAL_PREFIX: 'GLOBAL_PREFIX',
  CORS_ORIGINS: 'CORS_ORIGINS',
  PUBLIC_BASE_URL: 'PUBLIC_BASE_URL',
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_USERNAME: 'DB_USERNAME',
  DB_PASSWORD: 'DB_PASSWORD',
  DB_DATABASE: 'DB_DATABASE',
  DB_LOGGING: 'DB_LOGGING',
  DB_SYNCHRONIZE: 'DB_SYNCHRONIZE',
  JWT_ACCESS_SECRET: 'JWT_ACCESS_SECRET',
  JWT_ACCESS_TTL: 'JWT_ACCESS_TTL',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  JWT_REFRESH_TTL: 'JWT_REFRESH_TTL',
  SWAGGER_ENABLED: 'SWAGGER_ENABLED',
  REDIS_URL: 'REDIS_URL',
  REDIS_DEFAULT_TTL: 'REDIS_DEFAULT_TTL',
  REDIS_NAMESPACE: 'REDIS_NAMESPACE',
} as const;

export const CONFIG_NAMESPACE = {
  APP: 'app',
  DATABASE: 'database',
  JWT: 'jwt',
  REDIS: 'redis',
} as const;

export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export const BOOLEAN_STRING = {
  TRUE: 'true',
  FALSE: 'false',
} as const;
