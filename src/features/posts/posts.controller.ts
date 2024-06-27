/* eslint-disable prefer-const */
import { JwtService } from '@app/src/application/jwt/jwtService';
import { CommentsService } from '@app/src/comments/comments.service';
import { CommentCreateInputModelType } from '@app/src/comments/comments.types';
import { AccessTokenAuthGuard } from '@app/src/features/auth/guards/accessToken.auth.guard';
import { BasicAuthGuard } from '@app/src/features/auth/guards/basic.auth.guard';
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
import { PostsService } from './posts.service';
import {
  CreatePostInputModelType,
  UpdatePostLikeStatusInputModelType,
  UpdatePostMongoInputModelType,
  postsByBlogIdPaginationType,
} from './posts.types';
import { CreatePostCommand } from './use-cases/createPost';
import { deletePostCommand } from './use-cases/deletePost';
import { GetPostsWithPaginationCommand } from './use-cases/getPostsWithPagination';
import { updatePostCommand } from './use-cases/updatePost';
import { updatePostLikeStatusCommand } from './use-cases/updatePostLikeStatus';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    protected postsService: PostsService,
    protected commentService: CommentsService,
    protected jwtService: JwtService,
  ) {}
  @Get()
  async getPostsWithPagination(
    @Query() query: { object },
    @Headers() headers: { authorization: string },
    @Res() res: Response,
  ) {
    let userId = undefined;
    if (headers.authorization) {
      userId = await this.jwtService.verifyAndGetUserIdByToken(
        headers.authorization.split(' ')[1],
      );
    }
    const allPosts: postsByBlogIdPaginationType = await this.commandBus.execute(
      new GetPostsWithPaginationCommand(query, userId),
    );
    res.status(200).send(allPosts);
    return;
  }
  @Get(':id')
  async getPostById(
    @Headers() headers: { authorization: string },
    @Query() query: { object },
    @Param() params: { id: string },
    @Res() res: Response,
  ) {
    let userId = undefined;
    if (headers.authorization) {
      userId = await this.jwtService.verifyAndGetUserIdByToken(
        headers.authorization.split(' ')[1],
      );
    }
    const foundPost = await this.postsService.findPost(params, userId);
    if (!foundPost) {
      res.sendStatus(404);
      return;
    } else {
      res.status(200).send(foundPost);
      return;
    }
  }
  @Get(':id/comments')
  async getCommentsByPostId(
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
    const commentsPagination = await this.commentService.findCommentsByPostId(
      params.id,
      query,
      userId,
    );
    if (commentsPagination?.items?.length === 0) {
      res.sendStatus(404);
      return;
    } else {
      res.status(200).send(commentsPagination);
      return;
    }
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async postPost(
    @Param() params: { id: string },
    @Body()
    body: CreatePostInputModelType,
    @Res() res: Response,
  ) {
    const newPost = await this.commandBus.execute(new CreatePostCommand(body));
    res.status(201).send(newPost);
    return;
  }

  @UseGuards(AccessTokenAuthGuard)
  @Post(':id/comments')
  async postCommentByPostId(
    @Headers() headers: { authorization: string },
    @Param() params: { id: string },
    @Body() body: CommentCreateInputModelType,
    @Res() res: Response,
  ) {
    {
      const token = headers.authorization!.split(' ')[1];
      const userId = await this.jwtService.verifyAndGetUserIdByToken(token);
      const post = await this.postsService.findPost(params, userId);
      if (!post) {
        res.sendStatus(404);
        return;
      }

      const comment = await this.commentService.createCommentsByPostId(
        params.id,
        body,
        token,
      );
      if (!comment) {
        res.sendStatus(404);
        return;
      } else {
        res.status(201).send(comment);
        return;
      }
    }
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updatePost(
    @Param() params: { id: string },
    @Body()
    body: UpdatePostMongoInputModelType,
    @Res() res: Response,
  ) {
    const ResultOfUpdatePost = await this.commandBus.execute(
      new updatePostCommand(params.id, body),
    );
    if (!ResultOfUpdatePost) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }

  @UseGuards(AccessTokenAuthGuard)
  @Put(':id/like-status')
  async updatePostLikeStatus(
    @Headers() headers: { authorization: string },
    @Param() params: { id: string },
    @Body() body: UpdatePostLikeStatusInputModelType,
    @Res() res: Response,
  ) {
    const post = await this.postsService.findPost(
      params,
      headers.authorization!.split(' ')[1],
    );
    if (!post) {
      res.sendStatus(404);
      return;
    }

    const resultOfUpdate = await this.commandBus.execute(
      new updatePostLikeStatusCommand(
        params.id,
        body,
        headers.authorization!.split(' ')[1],
      ),
    );
    res.sendStatus(204);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':postId')
  async deleteBlogByID(
    @Param() params: { postId: string },
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
