import type { DataSourceOptions } from 'typeorm';
import { ALL_ENTITIES } from './entities.js';
import { ALL_MIGRATIONS } from './migrations/index.js';

export interface DatabaseEnv {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging?: boolean;
}

export const MIGRATIONS_TABLE = 'migrations';

/**
 * Pure options builder: no Nest, no process.env, no side effects. Both
 * TypeOrmModule.forRootAsync and the TypeORM CLI entrypoint consume this, which
 * is what guarantees the app and the CLI can never see a different schema.
 *
 * synchronize is hard-coded false. It is not a parameter, because the only way
 * to be sure nobody turns it on against production is to make it unreachable.
 */
export const buildDataSourceOptions = (env: DatabaseEnv): DataSourceOptions => ({
  type: 'postgres',
  host: env.host,
  port: env.port,
  username: env.username,
  password: env.password,
  database: env.database,
  logging: env.logging ?? false,
  entities: ALL_ENTITIES,
  migrations: ALL_MIGRATIONS,
  migrationsTableName: MIGRATIONS_TABLE,
  synchronize: false,
});
