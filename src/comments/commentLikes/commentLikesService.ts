import { Injectable } from '@nestjs/common';
import { CommentLikesPgSqlRepository } from './commentLikes.PgSqlRepository';
import { commentLikeDBType } from './commentLikes.types';
import { CommentLikesMongoRepository } from './commentLikesRepository';

@Injectable()
export class CommentLikesService {
  private commentLikesRepository;
  constructor(
    protected commentLikesMongoRepository: CommentLikesMongoRepository,
    protected commentsLikePgSqlRepository: CommentLikesPgSqlRepository,
  ) {
    this.commentLikesRepository = this.getCommentLikeRepository();
  }

  private getCommentLikeRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.commentLikesMongoRepository
      : this.commentsLikePgSqlRepository;
  }
  async findCommentLikeFromUser(userId: string, commentId: string) {
    const like = await this.commentLikesRepository.findCommentLikeFromUser(
      userId,
      commentId,
    );
    return like;
  }

  async addLikeToBdFromUser(
    userId: string,
    commentId: string,
    likeStatus: string,
  ) {
    const like = new commentLikeDBType(userId, commentId, likeStatus);
    const result = await this.commentLikesRepository.addLikeToBdFromUser(like);
    return result;
  }
  async updateUserLikeStatus(
    userId: string,
    commentId: string,
    likeStatus: string,
  ) {
    const result = this.commentLikesRepository.updateUserLikeStatus(
      userId,
      commentId,
      likeStatus,
    );
    return result;
  }
}
