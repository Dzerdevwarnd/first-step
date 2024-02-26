import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './blogs/blogs.controller';
import { Blog, BlogSchema } from './blogs/blogs.scheme.types';
import { CommentsController } from './comments/comments.controller';
import { PostsController } from './posts/posts.controller';
import { Post, PostSchema } from './posts/posts.scheme.types';
import { settings } from './settings';
import { UsersController } from './users/users.controller';
import { User, UserSchema } from './users/users.scheme.types';

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
    ]),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    UsersController,
    CommentsController,
  ],
  providers: [AppService],
})
export class AppModule {}
