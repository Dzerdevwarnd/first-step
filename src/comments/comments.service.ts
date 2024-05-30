import { Injectable } from '@nestjs/common';
import { JwtService } from 'src/application/jwt/jwtService';
import { CommentLikesService } from 'src/comments/commentLikes/commentLikesService';
import { UsersService } from 'src/endPointsEntities/users/users.service';
import { PostsMongoRepository } from 'src/posts/posts.mongoRepository';
import { CommentsMongoRepository } from './comments.MongoRepository';
import { CommentsPgSqlRepository } from './comments.PgSql';
import {
  CommentDBType,
  CommentViewType,
  CommentsPaginationType,
} from './comments.types';

@Injectable()
export class CommentsService {
  private commentsRepository;
  constructor(
    protected commentsMongoRepository: CommentsMongoRepository,
    protected commentsPgSqlRepository: CommentsPgSqlRepository,
    protected postsReposittory: PostsMongoRepository,
    protected commentLikesService: CommentLikesService,
    protected usersService: UsersService,
    protected jwtService: JwtService,
  ) {
    this.commentsRepository = this.getCommentsRepository();
  }

  private getCommentsRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.commentsMongoRepository
      : this.commentsPgSqlRepository;
  }
  async findComment(
    commentId: string,
    userId: string,
  ): Promise<CommentViewType | null> {
    const like = await this.commentLikesService.findCommentLikeFromUser(
      userId,
      commentId,
    );
    const userLikeStatus = like?.likeStatus || 'None';
    const comment = await this.commentsRepository.findComment(
      commentId,
      userLikeStatus,
    );
    return comment;
  }
  async findCommentsByPostId(
    postId: string,
    query: any,
    userId: string,
  ): Promise<CommentsPaginationType | null> {
    const commentsDB =
      await this.commentsRepository.findDBCommentsByPostIdWithoutLikeStatus(
        postId,
        query,
      );
    if (!commentsDB) {
      return null;
    }
    const commentsView: CommentViewType[] = [];
    for (const comment of commentsDB) {
      const like = await this.commentLikesService.findCommentLikeFromUser(
        userId,
        comment.id,
      );
      const commentView = {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo?.userId || comment.userId,
          userLogin: comment.commentatorInfo?.userLogin || comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesInfo?.likesCount || comment.likesCount,
          dislikesCount:
            comment.likesInfo?.dislikesCount || comment.dislikesCount,
          myStatus: like?.likeStatus || 'None',
        },
      };
      commentsView.push(commentView);
    }
    const totalCount = commentsDB.length;
    const pagesCount = Math.ceil(totalCount / Number(query?.pageSize) || 1);
    const commentsPagination: CommentsPaginationType =
      new CommentsPaginationType(
        pagesCount,
        Number(query?.pageNumber) || 1,
        Number(query?.pageSize) || 10,
        totalCount,
        commentsView,
      );
    return commentsPagination;
  }
  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.commentsRepository.deleteComment(commentId);
    return result;
  }
  async updateComment(id: string, body: { content: string }): Promise<boolean> {
    const result = await this.commentsRepository.updateComment(id, body);
    return result;
  }
  async updateCommentLikeStatus(
    commentId: string,
    body: { likeStatus: string },
    accessToken: string,
  ): Promise<boolean> {
    const userId = await this.jwtService.verifyAndGetUserIdByToken(accessToken);
    const comment = await this.findComment(commentId, userId);
    let likesCount = comment!.likesInfo.likesCount;
    let dislikesCount = comment!.likesInfo.dislikesCount;
    if (body.likeStatus === 'Like' && comment?.likesInfo.myStatus !== 'Like') {
      likesCount = +likesCount + 1;
      if (comment?.likesInfo.myStatus === 'Dislike') {
        dislikesCount = +dislikesCount - 1;
      }
      this.commentsRepository.updateCommentLikesAndDislikesCount(
        commentId,
        likesCount,
        dislikesCount,
      );
    } else if (
      body.likeStatus === 'Dislike' &&
      comment?.likesInfo.myStatus !== 'Dislike'
    ) {
      dislikesCount = +dislikesCount + 1;
      if (comment?.likesInfo.myStatus === 'Like') {
        likesCount = +likesCount - 1;
      }
      this.commentsRepository.updateCommentLikesAndDislikesCount(
        commentId,
        likesCount,
        dislikesCount,
      );
    } else if (
      body.likeStatus === 'None' &&
      comment?.likesInfo.myStatus === 'Like'
    ) {
      likesCount = likesCount - 1;
      this.commentsRepository.updateCommentLikesAndDislikesCount(
        commentId,
        likesCount,
        dislikesCount,
      );
    } else if (
      body.likeStatus === 'None' &&
      comment?.likesInfo.myStatus === 'Dislike'
    ) {
      dislikesCount = dislikesCount - 1;
      this.commentsRepository.updateCommentLikesAndDislikesCount(
        commentId,
        likesCount,
        dislikesCount,
      );
    }
    const like = await this.commentLikesService.findCommentLikeFromUser(
      userId,
      commentId,
    );
    if (!like) {
      await this.commentLikesService.addLikeToBdFromUser(
        userId,
        commentId,
        body.likeStatus,
      );
      return true;
    } else {
      if (like.likeStatus === body.likeStatus) {
        return false;
      }
      this.commentLikesService.updateUserLikeStatus(
        userId,
        commentId,
        body.likeStatus,
      );
      return true;
    }
  }
  async createCommentsByPostId(
    id: string,
    body: { content: string },
    token: string,
  ): Promise<CommentViewType | null> {
    const userId = await this.jwtService.verifyAndGetUserIdByToken(token);
    const user = await this.usersService.findUser(userId!);
    if (!user) {
      return;
    }
    const comment: CommentDBType = new CommentDBType(
      String(Date.now()),
      id,
      body.content,
      { userId: user.id, userLogin: user.accountData?.login || user.login },
      new Date(),
    );
    const commentView = await this.commentsRepository.createComment(
      comment,
      userId,
    );
    return commentView;
  }
}
