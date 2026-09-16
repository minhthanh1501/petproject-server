import { registerAs } from '@nestjs/config';
import { BOOLEAN_STRING, CONFIG_NAMESPACE, ENV_KEY, NodeEnv } from '../constants/env.constants.js';

const CORS_SEPARATOR = ',';

export const appConfig = registerAs(CONFIG_NAMESPACE.APP, () => ({
  nodeEnv: (process.env[ENV_KEY.NODE_ENV] as NodeEnv) ?? NodeEnv.DEVELOPMENT,
  port: Number(process.env[ENV_KEY.PORT] ?? 3000),
  globalPrefix: process.env[ENV_KEY.GLOBAL_PREFIX] ?? 'api',
  corsOrigins:
    process.env[ENV_KEY.CORS_ORIGINS]
      ?.split(CORS_SEPARATOR)
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [],
  /** Base of the QR URL handed to the customer at the counter. */
  publicBaseUrl: process.env[ENV_KEY.PUBLIC_BASE_URL] as string,
  swaggerEnabled: process.env[ENV_KEY.SWAGGER_ENABLED] === BOOLEAN_STRING.TRUE,
}));
