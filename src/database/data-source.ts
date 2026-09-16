import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './data-source-options.js';
import { ENV_KEY } from '../constants/env.constants.js';

/**
 * The TypeORM CLI entrypoint. Run against dist/, never through a TS loader:
 * ts-node is absent and cannot work under "type": "module"; tsx and everything
 * esbuild-based drops emitDecoratorMetadata and would silently generate wrong
 * column types; Node's native type stripping throws on decorators.
 *
 * Env comes from node --env-file=.env, so no dotenv import is needed - which
 * matters because dotenv is only a transitive dependency here and is not
 * importable under pnpm's strict layout.
 */
export default new DataSource(
  buildDataSourceOptions({
    host: process.env[ENV_KEY.DB_HOST] as string,
    port: Number(process.env[ENV_KEY.DB_PORT]),
    username: process.env[ENV_KEY.DB_USERNAME] as string,
    password: process.env[ENV_KEY.DB_PASSWORD] as string,
    database: process.env[ENV_KEY.DB_DATABASE] as string,
  }),
);
