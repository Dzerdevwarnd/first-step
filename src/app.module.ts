import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './blogs/blogs.controller';
import { BlogDBType, BlogSchema } from './blogs/blogs.scheme';
import { CommentsController } from './comments/comments.controller';
import { PostsController } from './posts/posts.controller';
import { settings } from './settings';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    MongooseModule.forRoot(
      settings.MONGO_URL || `mongodb://0.0.0.0:27017/${1}`,
    ),
    MongooseModule.forFeature([{ name: BlogDBType.name, schema: BlogSchema }]),
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
