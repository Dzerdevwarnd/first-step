/* import { myJwtModule } from '@app/src/application/jwt/jwt.module';
import { AuthModule } from '@app/src/auth/auth.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaBlogsController } from '../sa/sa.blogs.contorller';
import { BlogsController } from './blogs.controller';
import { BlogsEntity } from './blogs.entity';
import { Blog, BlogSchema } from './blogs.mongo.scheme';
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
];

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogsEntity]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    myJwtModule,
    CqrsModule,
    AuthModule,
  ],
  providers: [, ...useCases],
  controllers: [BlogsController, SaBlogsController],
  exports: [...useCases],
})
export class BlogsModule {}
//
 */
import { myJwtModule } from '@app/src/application/jwt/jwt.module';
import { ValidationModule } from '@app/src/validation/validation.module';
import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaBlogsController } from '../sa/sa.blogs.contorller';
import { BlogsPgSqlRepository } from './blogs.PgSqlRepository';
import { BlogsController } from './blogs.controller';
import { BlogsEntity } from './blogs.entity';
import { Blog, BlogSchema } from './blogs.mongo.scheme';
import { BlogsMongoRepository } from './blogs.mongoRepository';
import { BlogsTypeOrmRepository } from './blogs.typeOrmRepository';
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
];

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogsEntity]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    myJwtModule,
    CqrsModule,
    /*     AuthModule, */
    forwardRef(() => ValidationModule),
  ],
  providers: [
    BlogsMongoRepository,
    BlogsPgSqlRepository,
    BlogsTypeOrmRepository,
    ...useCases,
  ],
  controllers: [BlogsController, SaBlogsController],
  exports: [
    BlogsMongoRepository,
    BlogsPgSqlRepository,
    BlogsTypeOrmRepository,
    ...useCases,
  ],
})
export class BlogsModule {}
///
