import { JwtService } from '@app/src/application/jwt/jwtService';
import { BasicAuthGuard } from '@app/src/features/auth/guards/basic.auth.guard';
import { PostsPgSqlRepository } from '@app/src/features/posts/posts.PgSqlRepository';
import { PostsMongoRepository } from '@app/src/features/posts/posts.mongoRepository';
import { PostsService } from '@app/src/features/posts/posts.service';
import { CreatePostByBlogIdInputModelType } from '@app/src/features/posts/posts.types';
import { createPostByBlogIdCommand } from '@app/src/features/posts/use-cases/createPostByBlogId';
import {
  Body,
  Controller,
  Delete, //
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import {
  CreateBlogInputModelType,
  UpdateBlogInputModelType,
} from './blogs.types';
import { DeleteBlogCommand } from './use-cases/deleteBlog';
import { FindBlogByIdCommand } from './use-cases/findBlogById';
import { PostBlogCommand } from './use-cases/postBlog';
import { ReturnBlogsWithPaginationCommand } from './use-cases/returnBlogsWithPagination';
import { UpdateBlogCommand } from './use-cases/updateBlog';

@Controller('blogs')
export class BlogsController {
  private postsRepository;
  constructor(
    private commandBus: CommandBus,
    protected postsService: PostsService,
    protected jwtService: JwtService,
    protected postsMongoRepository: PostsMongoRepository,
    protected postsPgSqlRepository: PostsPgSqlRepository,
  ) {
    this.postsRepository = this.getPostsRepository();
  }

  private getPostsRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.postsMongoRepository
      : this.postsPgSqlRepository;
  }

  @Get()
  async getBlogsWithPagination(@Query() query: string) {
    const blogsPagination = this.commandBus.execute(
      new ReturnBlogsWithPaginationCommand(query),
    );
    return blogsPagination;
  }
  @Get(':id')
  async getBlogById(
    @Query() query: { object },
    @Param() params: { id: string },
    @Res() res: Response,
  ) {
    const foundBlog = await this.commandBus.execute(
      new FindBlogByIdCommand(params),
    );
    if (!foundBlog) {
      res.sendStatus(404);
      return;
    } else {
      res.status(200).send(foundBlog);
      return;
    }
  }
  @Get(':id/posts')
  async getPostsByBlogId(
    @Query() query: { object },
    @Param() params: { id: string },
    @Res() res: Response,
    @Headers() headers: { authorization: string },
  ) {
    let userId = undefined;
    if (headers.authorization) {
      userId = await this.jwtService.verifyAndGetUserIdByToken(
        headers.authorization.split(' ')[1],
      );
    }
    const foundPosts = await this.postsRepository.findPostsByBlogId(
      params,
      query,
      userId,
    );
    if (!foundPosts) {
      res.sendStatus(404);
      return;
    } else {
      res.status(200).send(foundPosts);
      return;
    }
  }
  @UseGuards(BasicAuthGuard)
  @Post()
  async postBlog(
    @Body()
    body: CreateBlogInputModelType,
    @Res() res: Response,
  ) {
    const newBlog = await this.commandBus.execute(new PostBlogCommand(body));
    res.status(201).send(newBlog);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPostByBlogId(
    @Param() params: { id: string },
    @Body() body: CreatePostByBlogIdInputModelType,
    @Res() res: Response,
  ) {
    const createdPost = await this.commandBus.execute(
      new FindBlogByIdCommand(params),
    );
    if (!createdPost) {
      res.sendStatus(404);
      return;
    }
    const newPost = await this.commandBus.execute(
      new createPostByBlogIdCommand(body, params.id),
    );
    res.status(201).send(newPost);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updateBlog(
    @Param() params: { id: string },
    @Body() body: UpdateBlogInputModelType,
    @Res() res: Response,
  ) {
    const resultOfUpdateBlog = await this.commandBus.execute(
      new UpdateBlogCommand(params.id, body),
    );
    if (!resultOfUpdateBlog) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deleteBlogByID(@Param() params: { id }, @Res() res: Response) {
    const ResultOfDeleteBlog = await this.commandBus.execute(
      new DeleteBlogCommand(params),
    );
    if (!ResultOfDeleteBlog) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }
}
