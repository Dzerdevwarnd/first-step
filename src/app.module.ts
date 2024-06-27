//this module should be first line of app.module.ts
import { getConfigModule } from './configuration/getConfigModule';
const configModule = getConfigModule;

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './features/auth/auth.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { settings } from './settings';

const modules = [BlogsModule, AuthModule, TestingModule];

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    CqrsModule,
    configModule,
    MongooseModule.forRoot(
      settings.MONGO_URL, //|| `mongodb://0.0.0.0:27017/${1}`,
      //  { dbName: 'hm13' },
    ),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nodejs',
      password: 'nodejs', ////
      database: 'Homework1',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ...modules,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
///////////
