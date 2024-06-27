//this module should be first line of app.module.ts
import { getConfigModule } from './configuration/getConfigModule';
const configModule = getConfigModule;

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { EmailAdapter } from './application/emailAdapter/emailAdapter';
import { myJwtModule } from './application/jwt/jwt.module';
import { CommentLikesPgSqlRepository } from './comments/commentLikes/commentLikes.PgSqlRepository';
import {
  CommentLike,
  CommentLikeSchema,
} from './comments/commentLikes/commentLikes.mongo.scheme';
import { CommentLikesMongoRepository } from './comments/commentLikes/commentLikesRepository';
import { CommentLikesService } from './comments/commentLikes/commentLikesService';
import { CommentsMongoRepository } from './comments/comments.MongoRepository';
import { CommentsPgSqlRepository } from './comments/comments.PgSql';
import { CommentsController } from './comments/comments.controller';
import { Comment, CommentSchema } from './comments/comments.mongo.scheme';
import { CommentsService } from './comments/comments.service';
import { AuthModule } from './features/auth/auth.module';
import { BlacklistTokensModule } from './features/blacklistTokens/blacklistTokens.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { PostLikesMongoRepository } from './features/posts/postLikes/postLikes.MongoRepository';
import { PostLikesPgSqlRepository } from './features/posts/postLikes/postLikes.PgSqlRepository';
import {
  PostLike,
  PostLikeSchema,
} from './features/posts/postLikes/postLikes.scheme';
import { PostLikesService } from './features/posts/postLikes/postLikes.service';
import { PostsController } from './features/posts/posts.controller';
import { PostsModule } from './features/posts/posts.module';
import { PostsService } from './features/posts/posts.service';
import { RefreshTokensMetaModule } from './features/refreshTokenMeta/refreshTokenMeta.module';
import { SecurityController } from './features/security/securityController';
import { TestController } from './features/testing/testing.controller';
import { UsersModule } from './features/users/users.module';
import { settings } from './settings';
import { ValidationModule } from './validation/validation.module';

const modules = [
  UsersModule,
  RefreshTokensMetaModule,
  BlacklistTokensModule,
  myJwtModule,
  BlogsModule,
  AuthModule,
  ValidationModule,
  PostsModule,
];

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
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
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
  controllers: [
    TestController,
    PostsController,
    CommentsController,
    SecurityController,
  ],
  providers: [
    PostsService,
    CommentsService,
    CommentsMongoRepository,
    CommentsPgSqlRepository,
    PostLikesMongoRepository,
    PostLikesPgSqlRepository,
    PostLikesService,
    EmailAdapter,
    CommentLikesMongoRepository,
    CommentLikesPgSqlRepository,
    CommentLikesService,
  ],
  exports: [
    PostsService,
    CommentsService,
    CommentsMongoRepository,
    CommentsPgSqlRepository,
    PostLikesMongoRepository,
    PostLikesPgSqlRepository,
    PostLikesService,
    EmailAdapter,
    CommentLikesMongoRepository,
    CommentLikesPgSqlRepository,
    CommentLikesService,
  ],
})
export class AppModule {}
///////////
