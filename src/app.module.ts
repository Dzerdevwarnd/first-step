//this module should be first line of app.module.ts
import { getConfigModule } from './configuration/getConfigModule';
const configModule = getConfigModule;

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistRepository } from './DBEntities/blacklistTokens/blacklistTokens.repository';
import {
  BlacklistToken,
  BlacklistTokenSchema,
} from './DBEntities/blacklistTokens/blacklistTokens.scheme.types';
import { RefreshTokensMetaRepository } from './DBEntities/refreshTokenMeta/refreshTokenMeta.repository';
import {
  RefreshTokenMeta,
  RefreshTokenMetaSchema,
} from './DBEntities/refreshTokenMeta/refreshTokenMeta.scheme.types';
import { EmailAdapter } from './application/emailAdapter/emailAdapter';
import { JwtService } from './application/jwt/jwtService';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AccessTokenAuthStrategy } from './auth/strategies/accessToken.strategy';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { RefreshTokenAuthStrategy } from './auth/strategies/refreshToken.strategy';
import {
  CommentLike,
  CommentLikeSchema,
} from './comments/commentLikes/commentLikes.mongo.scheme';
import { CommentLikesRepository } from './comments/commentLikes/commentLikesRepository';
import { CommentLikesService } from './comments/commentLikes/commentLikesService';
import { CommentsController } from './comments/comments.controller';
import { Comment, CommentSchema } from './comments/comments.mongo.scheme';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsService } from './comments/comments.service';
import { BlogsController } from './endPointsEntities/blogs/blogs.controller';
import { Blog, BlogSchema } from './endPointsEntities/blogs/blogs.mongo.scheme';
import { BlogsRepository } from './endPointsEntities/blogs/blogs.repository';
import { DeleteBlogUseCase } from './endPointsEntities/blogs/use-cases/deleteBlog';
import { FindBlogByIdUseCase } from './endPointsEntities/blogs/use-cases/findBlogById';
import { PostBlogUseCase } from './endPointsEntities/blogs/use-cases/postBlog';
import { ReturnBlogsWithPaginationUseCase } from './endPointsEntities/blogs/use-cases/returnBlogsWithPagination';
import { UpdateBlogUseCase } from './endPointsEntities/blogs/use-cases/updateBlog';
import { SecurityController } from './endPointsEntities/security/securityController';
import { TestController } from './endPointsEntities/testing/testing.controller';
import { UsersController } from './endPointsEntities/users/users.controller';
import { User, UserSchema } from './endPointsEntities/users/users.mongo.scheme';
import { UsersService } from './endPointsEntities/users/users.service';
import { UsersMongoRepository } from './endPointsEntities/users/usersMongo.repository';
import { UsersPgSqlRepository } from './endPointsEntities/users/usersPgSql.Repository';
import { PostLikesRepository } from './posts/postLikes/postLikes.repository';
import { PostLike, PostLikeSchema } from './posts/postLikes/postLikes.scheme';
import { PostLikesService } from './posts/postLikes/postLikes.service';
import { PostsController } from './posts/posts.controller';
import { Post, PostSchema } from './posts/posts.mongo.scheme';
import { PostsRepository } from './posts/posts.repository';
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

const usersRepositoryProvider = {
  provide: 'usersRepository',
  useClass:
    process.env.Users_Repository === 'Mongo'
      ? UsersMongoRepository
      : UsersPgSqlRepository,
};

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

@Module({
  imports: [
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
      password: 'nodejs',
      database: 'Homework',
      autoLoadEntities: false,
      synchronize: false,
    }),
  ],
  controllers: [
    TestController,
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
    SecurityController,
    AuthController,
  ],
  providers: [
    PostsService,
    UsersService,
    CommentsService,
    BlogsRepository,
    PostsRepository,
    UsersPgSqlRepository,
    UsersMongoRepository,
    CommentsRepository,
    RefreshTokensMetaRepository,
    PostLikesRepository,
    PostLikesService,
    JwtService,
    EmailAdapter,
    CommentLikesRepository,
    CommentLikesService,
    BlacklistRepository,
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
    usersRepositoryProvider,
    ...useCases,
  ],
})
export class AppModule {}
////
