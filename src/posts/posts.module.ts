import { AuthModule } from '@app/src/auth/auth.module';
import { Module, Post } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsPgSqlRepository } from './posts.PgSqlRepository';
import { PostsTypeOrmRepository } from './posts.TypeOrm.repository';
import { PostsController } from './posts.controller';
import { PostEntity } from './posts.entity';
import { PostSchema } from './posts.mongo.scheme';
import { PostsMongoRepository } from './posts.mongoRepository';
import { CreatePostUseCase } from './use-cases/createPost';
import { createPostByBlogIdUseCase } from './use-cases/createPostByBlogId';
import { deletePostUseCase } from './use-cases/deletePost';
import { GetPostsWithPaginationUseCase } from './use-cases/getPostsWithPagination';
import { updatePostUseCase } from './use-cases/updatePost';
import { updatePostLikeStatusUseCase } from './use-cases/updatePostLikeStatus';

const useCases = [
  CreatePostUseCase,
  createPostByBlogIdUseCase,
  deletePostUseCase,
  GetPostsWithPaginationUseCase,
  updatePostUseCase,
  updatePostLikeStatusUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    AuthModule,
  ],
  providers: [
    PostsMongoRepository,
    PostsPgSqlRepository,
    PostsTypeOrmRepository,
    ,
    ...useCases,
  ],
  controllers: [PostsController],
  exports: [...useCases],
})
export class PostsModule {}
//
