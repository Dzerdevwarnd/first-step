/* eslint-disable prefer-const */
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
} from '@nestjs/common';
import { Response } from 'express';
import { BlogsService } from 'src/blogs/blogs.service';
import { CommentsService } from 'src/comments/comments.service';
import { JwtService } from 'src/jwt/jwtService';
import { postsByBlogIdPaginationType } from './posts.scheme.types';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected commentService: CommentsService,
    protected blogService: BlogsService,
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
    const allPosts: postsByBlogIdPaginationType =
      await this.postsService.getPostsWithPagination(query, userId);
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
    if (commentsPagination?.items.length === 0) {
      res.sendStatus(404);
      return;
    } else {
      res.status(200).send(commentsPagination);
      return;
    }
  }
  @Post()
  async postPost(
    @Param() params: { id: string },
    @Body()
    body: {
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
    },
    @Res() res: Response,
  ) {
    const newPost = await this.postsService.createPost(body);
    res.status(201).send(newPost);
    return;
  }
  @Post(':id/comments')
  async postCommentByPostId(
    @Headers() headers: { authorization: string },
    @Param() params: { id: string },
    @Body() body: { title: string; shortDescription: string; content: string },
    @Res() res: Response,
  ) {
    {
      const post = await this.postsService.findPost(params, 'userId');
      if (!post) {
        res.sendStatus(404);
        return;
      }
      const token = headers.authorization!.split(' ')[1];

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
  @Put(':id')
  async updatePost(
    @Param() params: { id: string },
    @Body()
    body: {
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
    },
    @Res() res: Response,
  ) {
    const ResultOfUpdatePost = await this.postsService.updatePost(
      params.id,
      body,
    );
    if (!ResultOfUpdatePost) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }
  @Put(':id/like-status')
  async updatePostLikeStatus(
    @Headers() headers: { authorization: string },
    @Param() params: { id: string },
    @Body() body: { likeStatus: string },
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

    const resultOfUpdate = await this.postsService.updatePostLikeStatus(
      params.id,
      body,
      headers.authorization!.split(' ')[1],
    );
    res.sendStatus(204);
    return;
  }

  @Delete(':id')
  async deleteBlogByID(@Param() params: { id }, @Res() res: Response) {
    const resultOfDelete = await this.postsService.deletePost(params);
    if (!resultOfDelete) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }
}
