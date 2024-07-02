import { CommentLikesService } from '@app/src/features/comments/commentLikes/commentLikesService';
import { PostsMongoRepository } from '@app/src/features/posts/posts.mongoRepository';
import { UsersService } from '@app/src/features/users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '../auth/jwt/jwtService';
import { CommentsMongoRepository } from './comments.MongoRepository';
import { CommentsPgSqlRepository } from './comments.PgSql';
import { CommentsTypeOrmRepository } from './comments.TypeOrmRepository';
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
    protected commentsTypeOrmRepository: CommentsTypeOrmRepository,
    protected postsReposittory: PostsMongoRepository,
    protected commentLikesService: CommentLikesService,
    protected usersService: UsersService,
    protected jwtService: JwtService,
  ) {
    this.commentsRepository = this.getCommentsRepository();
  }

  private getCommentsRepository() {
    const repositories = {
      Mongo: this.commentsMongoRepository,
      PgSql: this.commentsPgSqlRepository,
      TypeOrm: this.commentsTypeOrmRepository,
    };

    return repositories[process.env.REPOSITORY] || this.commentsRepository;
  }
  async findComment(
    commentId: string,
    userId: string,
  ): Promise<CommentViewType | null> {
    const like = await this.commentLikesService.findCommentLikeFromUser(
      userId,
      commentId,
    );
    const comment = await this.commentsRepository.findComment(commentId);
    if (!comment) {
      return null;
    }
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
    return commentView;
  }
  async findCommentsByPostId(
    postId: string,
    query: any,
    userId: string,
  ): Promise<CommentsPaginationType | null> {
    const commentsPagination =
      await this.commentsRepository.findCommentsByPostId(postId, query);
    if (!commentsPagination) {
      return null;
    }
    for (const comment of commentsPagination.items) {
      const like = await this.commentLikesService.findCommentLikeFromUser(
        userId,
        comment.id,
      );
      comment.likesInfo.myStatus = like?.likeStatus || 'None';
    }
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
//
