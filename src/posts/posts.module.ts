import { AuthModule } from '@app/src/auth/auth.module';
import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { myJwtModule } from '../application/jwt/jwt.module';
import { UsersModule } from '../endPointsEntities/users/users.module';
import { ValidationModule } from '../validation/validation.module';
import { PostLikesMongoRepository } from './postLikes/postLikes.MongoRepository';
import { PostLikesPgSqlRepository } from './postLikes/postLikes.PgSqlRepository';
import { PostLike, PostLikeSchema } from './postLikes/postLikes.scheme';
import { PostLikesService } from './postLikes/postLikes.service';
import { PostsPgSqlRepository } from './posts.PgSqlRepository';
import { PostsTypeOrmRepository } from './posts.TypeOrm.repository';
import { PostsController } from './posts.controller';
import { PostEntity } from './posts.entity';
import { Post, PostSchema } from './posts.mongo.scheme';
import { PostsMongoRepository } from './posts.mongoRepository';
import { PostsService } from './posts.service';
import { CreatePostUseCase } from './use-cases/createPost';
import { createPostByBlogIdUseCase } from './use-cases/createPostByBlogId';
import { deletePostUseCase } from './use-cases/deletePost';
import { GetPostsByBlogIdCommand } from './use-cases/getPostsByBlogsId';
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
  GetPostsByBlogIdCommand,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ValidationModule),
    myJwtModule,
    CqrsModule,
    forwardRef(() => UsersModule),
  ],
  providers: [
    PostsMongoRepository,
    PostsPgSqlRepository,
    PostsTypeOrmRepository,
    ,
    /*   ...useCases,  */
    PostLikesService,
    PostLikesMongoRepository,
    PostLikesPgSqlRepository,
    PostsService,
  ],
  controllers: [PostsController],
  exports: [
    /*     ...useCases, */
    PostsMongoRepository,
    PostsPgSqlRepository,
    PostsTypeOrmRepository,
    PostLikesService,
    PostLikesMongoRepository,
    PostLikesPgSqlRepository,
    PostsService,
  ],
})
export class PostsModule {}
//
