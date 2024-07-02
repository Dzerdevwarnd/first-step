import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommentLikeEntity } from '../comments/commentLikes/CommentLikes.entity';
import { CommentLikesPgSqlRepository } from '../comments/commentLikes/commentLikes.PgSqlRepository';
import { CommentLikesTypeOrmRepository } from '../comments/commentLikes/commentLikes.TypeOrmRepository';
import {
  CommentLike,
  CommentLikeSchema,
} from '../comments/commentLikes/commentLikes.mongo.scheme';
import { CommentLikesMongoRepository } from '../comments/commentLikes/commentLikesMongoRepository';
import { CommentLikesService } from '../comments/commentLikes/commentLikesService';
import { CommentsMongoRepository } from '../comments/comments.MongoRepository';
import { CommentsPgSqlRepository } from '../comments/comments.PgSql';
import { CommentsTypeOrmRepository } from '../comments/comments.TypeOrmRepository';
import { CommentsController } from '../comments/comments.controller';
import { CommentsEntity } from '../comments/comments.entity';
import { Comment, CommentSchema } from '../comments/comments.mongo.scheme';
import { CommentsService } from '../comments/comments.service';
import { BlogExistValidationConstraint } from '../posts/customValidators/BlogExist.validator';
import { PostLikesMongoRepository } from '../posts/postLikes/postLikes.MongoRepository';
import { PostLikesPgSqlRepository } from '../posts/postLikes/postLikes.PgSqlRepository';
import { PostLikesTypeOrmRepository } from '../posts/postLikes/postLikes.TypeOrmRepositort';
import { PostLikesEntity } from '../posts/postLikes/postLikes.entity';
import { PostLike, PostLikeSchema } from '../posts/postLikes/postLikes.scheme';
import { PostLikesService } from '../posts/postLikes/postLikes.service';
import { PostsPgSqlRepository } from '../posts/posts.PgSqlRepository';
import { PostsTypeOrmRepository } from '../posts/posts.TypeOrm.repository';
import { PostsController } from '../posts/posts.controller';
import { PostEntity } from '../posts/posts.entity';
import { Post, PostSchema } from '../posts/posts.mongo.scheme';
import { PostsMongoRepository } from '../posts/posts.mongoRepository';
import { PostsService } from '../posts/posts.service';
import { CreatePostUseCase } from '../posts/use-cases/createPost';
import { createPostByBlogIdUseCase } from '../posts/use-cases/createPostByBlogId';
import { deletePostUseCase } from '../posts/use-cases/deletePost';
import { GetPostsByBlogIdUseCase } from '../posts/use-cases/getPostsByBlogsId';
import { GetPostsWithPaginationUseCase } from '../posts/use-cases/getPostsWithPagination';
import { updatePostUseCase } from '../posts/use-cases/updatePost';
import { updatePostLikeStatusUseCase } from '../posts/use-cases/updatePostLikeStatus';
import { BlogsPgSqlRepository } from './blogs.PgSqlRepository';
import { BlogsController } from './blogs.controller';
import { BlogsEntity } from './blogs.entity';
import { Blog, BlogSchema } from './blogs.mongo.scheme';
import { BlogsMongoRepository } from './blogs.mongoRepository';
import { BlogsTypeOrmRepository } from './blogs.typeOrmRepository';
import { SaBlogsController } from './sa.blogs.contorller';
import { DeleteBlogUseCase } from './use-cases/deleteBlog';
import { FindBlogByIdUseCase } from './use-cases/findBlogById';
import { PostBlogUseCase } from './use-cases/postBlog';
import { ReturnBlogsWithPaginationUseCase } from './use-cases/returnBlogsWithPagination';
import { UpdateBlogUseCase } from './use-cases/updateBlog';

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
  GetPostsByBlogIdUseCase,
];

const customValidators = [BlogExistValidationConstraint];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogsEntity,
      PostEntity,
      CommentsEntity,
      CommentLikeEntity,
      PostLikesEntity,
    ]),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
    AuthModule,
    CqrsModule,
  ],
  controllers: [
    BlogsController,
    SaBlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    PostsMongoRepository,
    PostsPgSqlRepository,
    PostsTypeOrmRepository,
    PostLikesService,
    PostLikesMongoRepository,
    PostLikesPgSqlRepository,
    PostLikesTypeOrmRepository,
    PostsService,
    BlogsMongoRepository,
    BlogsPgSqlRepository,
    BlogsTypeOrmRepository,
    CommentsService,
    CommentsMongoRepository,
    CommentsPgSqlRepository,
    CommentLikesMongoRepository,
    CommentLikesPgSqlRepository,
    CommentLikesService,
    CommentsTypeOrmRepository,
    CommentLikesTypeOrmRepository,
    ...useCases,
    ...customValidators,
  ],
  exports: [
    PostsService,
    PostLikesService,
    CommentsService,
    CommentLikesService,
    ...useCases,
  ],
})
export class BlogsModule {}
///
