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
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from 'src/application/jwt/jwtService';
import { AccessTokenAuthGuard } from 'src/auth/guards/accessToken.auth.guard';
import { PostsService } from 'src/posts/posts.service';
import { currentUser, requestUserWithUserId } from 'src/types/req.user';
import { CommentsService } from './comments.service';
import {
  CommentUpdateInputModelType,
  UpdateCommentLikeStatusInputModelType,
} from './comments.types';

@Controller('comments')
export class CommentsController {
  constructor(
    protected jwtService: JwtService,
    protected commentsService: CommentsService,
    protected postsService: PostsService,
  ) {}

  @Get(':id')
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

  @UseGuards(AccessTokenAuthGuard)
  @Put(':id')
  async updateCommentContent(
    @Req() req: Request,
    @Headers() headers: { authorization: string },
    @Param() params: { id: string },
    @currentUser() requestUser: requestUserWithUserId,
    @Body() body: CommentUpdateInputModelType,
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
    if (
      comment.commentatorInfo.userId !== requestUser.userId &&
      // @ts-expect-error comment.user id must be in comment.commentatorInfo
      comment.userId !== requestUser.userId
    ) {
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

  @UseGuards(AccessTokenAuthGuard)
  @Put(':id/like-status')
  async updateCommentLikeStatus(
    @Headers() headers: { authorization: string },
    @Param() params: { id: string },
    @Body() body: UpdateCommentLikeStatusInputModelType,
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

  @UseGuards(AccessTokenAuthGuard)
  @Delete(':id')
  async deleteComment(
    @Req() req: Request,
    @currentUser() requestUser: requestUserWithUserId, //withid
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
    if (
      comment.commentatorInfo?.userId !== requestUser.userId &&
      // @ts-expect-error comment.user id must be in comment.commentatorInfo
      comment.userId !== requestUser.userId
    ) {
      res.sendStatus(403);
      return;
    }
    const ResultOfDelete = await this.commentsService.deleteComment(params.id);
    res.sendStatus(204);
    return;
  }
}
