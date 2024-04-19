import {
  Body,
  Controller,
  Delete,
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
import { JwtService } from 'src/application/jwt/jwtService';
import { BasicAuthGuard } from 'src/auth/guards/basic.auth.guard';
import { PostsRepository } from 'src/posts/posts.repository';
import { PostsService } from 'src/posts/posts.service';
import { CreatePostByBlogIdInputModelType } from 'src/posts/posts.types';
import { createPostByBlogIdCommand } from 'src/posts/use-cases/createPostByBlogId';
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
  constructor(
    private commandBus: CommandBus,
    protected postsService: PostsService,
    protected jwtService: JwtService,
    protected postsRepository: PostsRepository,
  ) {}
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
