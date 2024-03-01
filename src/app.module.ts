import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  BlacklistToken,
  BlacklistTokenSchema,
} from './blacklistTokens/blacklistTokens.scheme.types';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsRepository } from './blogs/blogs.repository';
import { Blog, BlogSchema } from './blogs/blogs.scheme.types';
import { BlogsService } from './blogs/blogs.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsRepository } from './comments/comments.repository';
import { Comment, CommentSchema } from './comments/comments.scheme.types';
import { CommentsService } from './comments/comments.service';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/posts.repository';
import { Post, PostSchema } from './posts/posts.scheme.types';
import { PostsService } from './posts/posts.service';
import { settings } from './settings';
import { TestController } from './testing/testing.controller';
import { UsersController } from './users/users.controller';
import { UsersRepository } from './users/users.repository';
import { User, UserSchema } from './users/users.scheme.types';
import { UsersService } from './users/users.service';

@Module({
  imports: [
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
    ]),
  ],
  controllers: [
    AppController,
    TestController,
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
  ],
  providers: [
    AppService,
    BlogsService,
    PostsService,
    UsersService,
    CommentsService,
    BlogsRepository,
    PostsRepository,
    UsersRepository,
    CommentsRepository,
  ],
})
export class AppModule {}
