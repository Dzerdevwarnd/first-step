//this module should be first line of app.module.ts
import { getConfigModule } from './configuration/getConfigModule';
const configModule = getConfigModule;

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { BlacklistTokensModule } from './DBEntities/blacklistTokens/blacklistTokens.module';
import {
  BlacklistToken,
  BlacklistTokenSchema,
} from './DBEntities/blacklistTokens/blacklistTokens.scheme.types';
import { RefreshTokenMetaEntity } from './DBEntities/refreshTokenMeta/refreshTokenMeta.entity';
import { RefreshTokensMetaModule } from './DBEntities/refreshTokenMeta/refreshTokenMeta.module';
import {
  RefreshTokenMeta,
  RefreshTokenMetaSchema,
} from './DBEntities/refreshTokenMeta/refreshTokenMeta.scheme.types';
import { EmailAdapter } from './application/emailAdapter/emailAdapter';
import { myJwtModule } from './application/jwt/jwt.module';
import { JwtService } from './application/jwt/jwtService';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AccessTokenAuthStrategy } from './auth/strategies/accessToken.strategy';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { RefreshTokenAuthStrategy } from './auth/strategies/refreshToken.strategy';
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
import { BlogsPgSqlRepository } from './endPointsEntities/blogs/blogs.PgSqlRepository';
import { BlogsController } from './endPointsEntities/blogs/blogs.controller';
import { Blog, BlogSchema } from './endPointsEntities/blogs/blogs.mongo.scheme';
import { BlogsMongoRepository } from './endPointsEntities/blogs/blogs.mongoRepository';
import { DeleteBlogUseCase } from './endPointsEntities/blogs/use-cases/deleteBlog';
import { FindBlogByIdUseCase } from './endPointsEntities/blogs/use-cases/findBlogById';
import { PostBlogUseCase } from './endPointsEntities/blogs/use-cases/postBlog';
import { ReturnBlogsWithPaginationUseCase } from './endPointsEntities/blogs/use-cases/returnBlogsWithPagination';
import { UpdateBlogUseCase } from './endPointsEntities/blogs/use-cases/updateBlog';
import { SaController } from './endPointsEntities/sa/sa.contoreller';
import { SecurityController } from './endPointsEntities/security/securityController';
import { TestController } from './endPointsEntities/testing/testing.controller';
import { UserEntity } from './endPointsEntities/users/users.entity';
import { UsersModule } from './endPointsEntities/users/users.module';
import { User, UserSchema } from './endPointsEntities/users/users.mongo.scheme';
import { PostLikesMongoRepository } from './posts/postLikes/postLikes.MongoRepository';
import { PostLikesPgSqlRepository } from './posts/postLikes/postLikes.PgSqlRepository';
import { PostLike, PostLikeSchema } from './posts/postLikes/postLikes.scheme';
import { PostLikesService } from './posts/postLikes/postLikes.service';
import { PostsPgSqlRepository } from './posts/posts.PgSqlRepository';
import { PostsController } from './posts/posts.controller';
import { Post, PostSchema } from './posts/posts.mongo.scheme';
import { PostsMongoRepository } from './posts/posts.mongoRepository';
import { PostsService } from './posts/posts.service';
import { CreatePostUseCase } from './posts/use-cases/createPost';
import { createPostByBlogIdUseCase } from './posts/use-cases/createPostByBlogId';
import { deletePostUseCase } from './posts/use-cases/deletePost';
import { GetPostsWithPaginationUseCase } from './posts/use-cases/getPostsWithPagination';
import { updatePostUseCase } from './posts/use-cases/updatePost';
import { updatePostLikeStatusUseCase } from './posts/use-cases/updatePostLikeStatus';
import { settings } from './settings';
import { BlogExistValidationConstraint } from './validation/customValidators/BlogExist.validator';
import { IsEmailIsAlreadyConfirmedConstraint } from './validation/customValidators/EmailIsAlreadyConfirmed.validator';
import { ConfirmationCodeValidationConstraint } from './validation/customValidators/confCode.validator';
import { IsEmailExistInDBConstraint } from './validation/customValidators/emailExistInDB.validator';
import { isEmailAlreadyInUseConstraint } from './validation/customValidators/isEmailAlreadyInUse.validator';
import { jwtKeyValidationConstraint } from './validation/customValidators/jwtKey.validator';
import { LoginAlreadyInUseConstraint } from './validation/customValidators/loginInUse.validator';

const useCases = [
  ReturnBlogsWithPaginationUseCase,
  DeleteBlogUseCase,
  FindBlogByIdUseCase,
  PostBlogUseCase,
  UpdateBlogUseCase,
  CreatePostUseCase,
  createPostByBlogIdUseCase,
  deletePostUseCase,
  GetPostsWithPaginationUseCase,
  updatePostUseCase,
  updatePostLikeStatusUseCase,
];

const modules = [
  UsersModule,
  RefreshTokensMetaModule,
  BlacklistTokensModule,
  myJwtModule,
];

@Module({
  imports: [
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
    PassportModule,
    JwtModule.register({
      global: true,
      secret: settings.JWT_SECRET,
      signOptions: { expiresIn: settings.accessTokenLifeTime + 'ms' },
    }),
    MongooseModule.forRoot(
      settings.MONGO_URL, //|| `mongodb://0.0.0.0:27017/${1}`,
      //  { dbName: 'hm13' },
    ),
    TypeOrmModule.forFeature([UserEntity, RefreshTokenMetaEntity]),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: BlacklistToken.name, schema: BlacklistTokenSchema },
      { name: RefreshTokenMeta.name, schema: RefreshTokenMetaSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nodejs',
      password: 'nodejs', ///
      database: 'Homework1',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ...modules,
  ],
  controllers: [
    TestController,
    BlogsController,
    PostsController,
    CommentsController,
    SecurityController,
    AuthController,
    SaController,
  ],
  providers: [
    PostsService,
    CommentsService,
    BlogsMongoRepository,
    BlogsPgSqlRepository,
    PostsMongoRepository,
    PostsPgSqlRepository,
    CommentsMongoRepository,
    CommentsPgSqlRepository,
    PostLikesMongoRepository,
    PostLikesPgSqlRepository,
    PostLikesService,
    JwtService,
    EmailAdapter,
    CommentLikesMongoRepository,
    CommentLikesPgSqlRepository,
    CommentLikesService,
    AuthService,
    LocalStrategy,
    BasicStrategy,
    AccessTokenAuthStrategy,
    RefreshTokenAuthStrategy,
    ConfirmationCodeValidationConstraint,
    BlogExistValidationConstraint,
    IsEmailExistInDBConstraint,
    isEmailAlreadyInUseConstraint,
    IsEmailIsAlreadyConfirmedConstraint,
    jwtKeyValidationConstraint,
    LoginAlreadyInUseConstraint,
    ...useCases,
  ],
  exports: [
    PostsService,
    CommentsService,
    BlogsMongoRepository,
    BlogsPgSqlRepository,
    PostsMongoRepository,
    PostsPgSqlRepository,
    CommentsMongoRepository,
    CommentsPgSqlRepository,
    PostLikesMongoRepository,
    PostLikesPgSqlRepository,
    PostLikesService,
    JwtService,
    EmailAdapter,
    CommentLikesMongoRepository,
    CommentLikesPgSqlRepository,
    CommentLikesService,
    AuthService,
    LocalStrategy,
    BasicStrategy,
    AccessTokenAuthStrategy,
    RefreshTokenAuthStrategy,
    ConfirmationCodeValidationConstraint,
    BlogExistValidationConstraint,
    IsEmailExistInDBConstraint,
    isEmailAlreadyInUseConstraint,
    IsEmailIsAlreadyConfirmedConstraint,
    jwtKeyValidationConstraint,
    LoginAlreadyInUseConstraint,
    ...useCases,
  ],
})
export class AppModule {}
/////////
