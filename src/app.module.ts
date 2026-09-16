import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createKeyv } from '@keyv/redis';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { ALL_CONFIG_NAMESPACES, databaseConfig, redisConfig, validateEnv } from './config/index.js';
import { buildDataSourceOptions } from './database/data-source-options.js';
import { CACHE } from './constants/cache.constants.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: ALL_CONFIG_NAMESPACES,
      validate: validateEnv,
      cache: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [redisConfig.KEY],
      useFactory: (redis: ConfigType<typeof redisConfig>) => ({
        cacheId: CACHE.CACHE_ID,
        ttl: redis.defaultTtl,
        stores: [createKeyv(redis.url, { namespace: redis.namespace })],
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (database: ConfigType<typeof databaseConfig>) =>
        buildDataSourceOptions(database),
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
