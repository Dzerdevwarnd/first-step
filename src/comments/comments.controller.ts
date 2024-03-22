/* eslint-disable prefer-const */
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from 'src/jwt/jwtService';
import { PostsService } from 'src/posts/posts.service';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(
    protected jwtService: JwtService,
    protected commentsService: CommentsService,
    protected postsService: PostsService,
  ) {}
  @Get()
  async getComment(
    @Query() query: { object },
    @Param() params: { id: string },
    @Headers() headers: { authorization: string },
    @Res() res: Response,
  ) {
    let userId = undefined;
    if (headers.authorization) {
      userId = await this.jwtService.verifyAndGetUserIdByToken(
        headers.authorization.split(' ')[1],
      );
    }
    const foundComment = await this.commentsService.findComment(
      params.id,
      userId,
    );
    if (!foundComment) {
      res.sendStatus(404);
      return;
    } else {
      res.status(200).send(foundComment);
      return;
    }
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
  @Put(':id')
  async updateCommentContent(
    @Req() req: Request,
    @Headers() headers: { authorization: string },
    @Param() params: { id: string },
    @Body() body: { content: string },
    @Res() res: Response,
  ) {
    const comment = await this.commentsService.findComment(
      params.id,
      headers.authorization!.split(' ')[1],
    );
    if (!comment) {
      res.sendStatus(404);
      return;
    }
    if (comment.commentatorInfo.userId !== req.user!.id) {
      res.sendStatus(403);
      return;
    }
    const resultOfUpdate = await this.commentsService.updateComment(
      params.id,
      body,
    );
    res.sendStatus(204);
    return;
  }
  @Put(':id/like-status')
  async updateCommentLikeStatus(
    @Headers() headers: { authorization: string },
    @Param() params: { id: string },
    @Body() body: { likeStatus: string },
    @Res() res: Response,
  ) {
    const comment = await this.commentsService.findComment(
      params.id,
      headers.authorization!.split(' ')[1],
    );
    if (!comment) {
      res.sendStatus(404);
      return;
    }

    const resultOfUpdate = await this.commentsService.updateCommentLikeStatus(
      params.id,
      body,
      headers.authorization!.split(' ')[1],
    );
    res.sendStatus(204);
    return;
  }

  @Delete(':id')
  async deleteComment(
    @Req() req: Request,
    @Headers() headers: { authorization: string },
    @Param() params: { id },
    @Res() res: Response,
  ) {
    const comment = await this.commentsService.findComment(
      params.id,
      headers.authorization!.split(' ')[1],
    );
    if (!comment) {
      res.sendStatus(404);
      return;
    }
    if (comment.commentatorInfo.userId !== req.user!.id) {
      res.sendStatus(403);
      return;
    }
    const ResultOfDelete = await this.commentsService.deleteComment(params.id);
    res.sendStatus(204);
    return;
  }
}
