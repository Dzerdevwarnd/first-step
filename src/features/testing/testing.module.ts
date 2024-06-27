import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlackListTokenEntity } from '../blacklistTokens/blacklistTokens.entitiy';
import {
  BlacklistToken,
  BlacklistTokenSchema,
} from '../blacklistTokens/blacklistTokens.scheme.types';
import { BlogsEntity } from '../blogs/blogs.entity';
import { Blog, BlogSchema } from '../blogs/blogs.mongo.scheme';
import {
  CommentLike,
  CommentLikeSchema,
} from '../comments/commentLikes/commentLikes.mongo.scheme';
import { Comment, CommentSchema } from '../comments/comments.mongo.scheme';
import { PostLike, PostLikeSchema } from '../posts/postLikes/postLikes.scheme';
import { PostEntity } from '../posts/posts.entity';
import { Post, PostSchema } from '../posts/posts.mongo.scheme';
import { RefreshTokenMetaEntity } from '../refreshTokenMeta/refreshTokenMeta.entity';
import {
  RefreshTokenMeta,
  RefreshTokenMetaSchema,
} from '../refreshTokenMeta/refreshTokenMeta.scheme.types';
import { UserEntity } from '../users/users.entity';
import { User, UserSchema } from '../users/users.mongo.scheme';
import { TestController } from './testing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogsEntity,
      PostEntity,
      UserEntity,
      RefreshTokenMetaEntity,
      BlackListTokenEntity,
    ]),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: User.name, schema: UserSchema },
      { name: RefreshTokenMeta.name, schema: RefreshTokenMetaSchema },
      { name: BlacklistToken.name, schema: BlacklistTokenSchema },
    ]),
  ],
  controllers: [TestController],
  providers: [],
  exports: [],
})
export class TestingModule {}
///
