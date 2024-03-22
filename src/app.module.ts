import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { BlacklistRepository } from './blacklistTokens/blacklistTokens.repository';
import {
  BlacklistToken,
  BlacklistTokenSchema,
} from './blacklistTokens/blacklistTokens.scheme.types';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsRepository } from './blogs/blogs.repository';
import { Blog, BlogSchema } from './blogs/blogs.scheme.types';
import { BlogsService } from './blogs/blogs.service';
import {
  CommentLike,
  CommentLikeSchema,
} from './commentLikes/commentLikes.scheme.types';
import { CommentLikesRepository } from './commentLikes/commentLikesRepository';
import { CommentLikesService } from './commentLikes/commentLikesService';
import { CommentsController } from './comments/comments.controller';
import { CommentsRepository } from './comments/comments.repository';
import { Comment, CommentSchema } from './comments/comments.scheme.types';
import { CommentsService } from './comments/comments.service';
import { EmailAdapter } from './emailAdapter/emailAdapter';
import { JwtService } from './jwt/jwtService';
import { PostLikesRepository } from './postLikes/postLikes.repository';
import { PostLike, PostLikeSchema } from './postLikes/postLikes.scheme.types';
import { PostLikesService } from './postLikes/postLikes.service';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/posts.repository';
import { Post, PostSchema } from './posts/posts.scheme.types';
import { PostsService } from './posts/posts.service';
import { RefreshTokensMetaRepository } from './refreshTokenMeta/refreshTokenMeta.repository';
import {
  RefreshTokenMeta,
  RefreshTokenMetaSchema,
} from './refreshTokenMeta/refreshTokenMeta.scheme.types';
import { SecurityController } from './security/securityController';
import { settings } from './settings';
import { TestController } from './testing/testing.controller';
import { UsersController } from './users/users.controller';
import { UsersRepository } from './users/users.repository';
import { User, UserSchema } from './users/users.scheme.types';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: settings.JWT_SECRET,
      signOptions: { expiresIn: settings.accessTokenLifeTime + 'ms' },
    }),
    MongooseModule.forRoot(
      settings.MONGO_URL || `mongodb://0.0.0.0:27017/${1}`,
      { dbName: 'hm13' },
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
    BlogsService,
    PostsService,
    UsersService,
    CommentsService,
    BlogsRepository,
    PostsRepository,
    UsersRepository,
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
  ],
})
export class AppModule {}
