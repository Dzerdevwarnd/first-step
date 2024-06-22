import { JwtService } from '@app/src/application/jwt/jwtService';
import { BasicAuthGuard } from '@app/src/auth/guards/basic.auth.guard';
import { PostsPgSqlRepository } from '@app/src/posts/posts.PgSqlRepository';
import { PostsMongoRepository } from '@app/src/posts/posts.mongoRepository';
import { PostsService } from '@app/src/posts/posts.service';
import {
  CreatePostByBlogIdInputModelType,
  UpdatePostPgSqlInputModelType,
} from '@app/src/posts/posts.types';
import { createPostByBlogIdCommand } from '@app/src/posts/use-cases/createPostByBlogId';
import { deletePostCommand } from '@app/src/posts/use-cases/deletePost';
import { updatePostCommand } from '@app/src/posts/use-cases/updatePost';
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
} from '../blogs/blogs.types';
import { DeleteBlogCommand } from '../blogs/use-cases/deleteBlog';
import { FindBlogByIdCommand } from '../blogs/use-cases/findBlogById';
import { PostBlogCommand } from '../blogs/use-cases/postBlog';
import { ReturnBlogsWithPaginationCommand } from '../blogs/use-cases/returnBlogsWithPagination';
import { UpdateBlogCommand } from '../blogs/use-cases/updateBlog';
import { UsersService } from '../users/users.service';
import {
  CreateUserInputModelType,
  usersPaginationType,
} from '../users/users.types';

@Controller('sa')
export class SaController {
  private postsRepository;
  constructor(
    protected postService: PostsService,
    protected commandBus: CommandBus,
    protected userService: UsersService,
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

  @Get('users')
  async getUsersWithPagination(
    @Query() query: { object },
    @Res() res: Response,
  ) {
    const usersPagination: usersPaginationType =
      await this.userService.returnUsersWithPagination(query);
    res.status(200).send(usersPagination);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Post('users')
  async createUser(
    @Body()
    body: CreateUserInputModelType,
    @Res() res: Response,
  ) {
    const newUser = await this.userService.createUser(body);
    res.status(201).send(newUser);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete('users/:id')
  async deleteUserByID(@Param() params: { id }, @Res() res: Response) {
    const ResultOfDelete = await this.userService.deleteUser(params);
    if (!ResultOfDelete) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }
}
//
