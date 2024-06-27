import { JwtService } from '@app/src/application/jwt/jwtService';
import { BasicAuthGuard } from '@app/src/features/auth/guards/basic.auth.guard';
import { PostsPgSqlRepository } from '@app/src/features/posts/posts.PgSqlRepository';
import { PostsService } from '@app/src/features/posts/posts.service';
import {
  CreatePostByBlogIdInputModelType,
  UpdatePostPgSqlInputModelType,
} from '@app/src/features/posts/posts.types';
import { createPostByBlogIdCommand } from '@app/src/features/posts/use-cases/createPostByBlogId';
import { deletePostCommand } from '@app/src/features/posts/use-cases/deletePost';
import { GetPostsByBlogIdCommand } from '@app/src/features/posts/use-cases/getPostsByBlogsId';
import { updatePostCommand } from '@app/src/features/posts/use-cases/updatePost';
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

import {
  CreateBlogInputModelType,
  UpdateBlogInputModelType,
} from '@app/src/features/blogs/blogs.types';
import { DeleteBlogCommand } from '@app/src/features/blogs/use-cases/deleteBlog';
import { FindBlogByIdCommand } from '@app/src/features/blogs/use-cases/findBlogById';
import { PostBlogCommand } from '@app/src/features/blogs/use-cases/postBlog';
import { ReturnBlogsWithPaginationCommand } from '@app/src/features/blogs/use-cases/returnBlogsWithPagination';
import { UpdateBlogCommand } from '@app/src/features/blogs/use-cases/updateBlog';

import { UsersService } from '../users/users.service';

@Controller('sa')
export class SaBlogsController {
  constructor(
    protected postService: PostsService,
    protected commandBus: CommandBus,
    protected userService: UsersService,
    protected jwtService: JwtService,
    protected postsPgSqlRepository: PostsPgSqlRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get('blogs')
  async getBlogsWithPagination(@Query() query: string) {
    const blogsPagination = this.commandBus.execute(
      new ReturnBlogsWithPaginationCommand(query),
    );
    return blogsPagination;
  }

  @Get('blogs/:id/posts')
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
    const foundPosts = await this.commandBus.execute(
      new GetPostsByBlogIdCommand(params, query, userId),
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
  @Post('blogs')
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
  @Post('blogs/:id/posts')
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
  @Put('blogs/:id')
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
  @Delete('blogs/:id')
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

  @UseGuards(BasicAuthGuard)
  @Put('blogs/:blogId/posts/:postId')
  async updatePost(
    @Param() params: { blogId: string; postId: string },
    @Body()
    body: UpdatePostPgSqlInputModelType,
    @Res() res: Response,
  ) {
    // @ts-expect-error blogId dont exist in body in type UpdatePostPgSqlInputModelType
    body.blogId = params.blogId;
    const ResultOfUpdatePost = await this.commandBus.execute(
      new updatePostCommand(params.postId, body),
    );
    if (!ResultOfUpdatePost) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }

  @UseGuards(BasicAuthGuard)
  @Delete('blogs/:blogId/posts/:postId')
  async deletePostByID(
    @Param() params: { blogId: string; postId: string },
    @Res() res: Response,
  ) {
    const resultOfDelete = await await this.commandBus.execute(
      new deletePostCommand(params),
    );
    if (!resultOfDelete) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }
}
//
