import { Injectable } from '@nestjs/common';
import { CommentsTypeOrmRepository } from '../comments.TypeOrmRepository';
import { CommentLikesPgSqlRepository } from './commentLikes.PgSqlRepository';
import { commentLikeDBType } from './commentLikes.types';
import { CommentLikesMongoRepository } from './commentLikesMongoRepository';

@Injectable()
export class CommentLikesService {
  private commentLikesRepository;
  constructor(
    protected commentLikesMongoRepository: CommentLikesMongoRepository,
    protected commentsLikePgSqlRepository: CommentLikesPgSqlRepository,
    protected commentsLikeTypeOrmRepository: CommentsTypeOrmRepository,
  ) {
    this.commentLikesRepository = this.getCommentLikeRepository();
  }

  private getCommentLikeRepository() {
    const repositories = {
      Mongo: this.commentLikesMongoRepository,
      PgSql: this.commentsLikePgSqlRepository,
      TypeOrm: this.commentsLikeTypeOrmRepository,
    };

    return (
      repositories[process.env.REPOSITORY] || this.commentLikesMongoRepository
    );
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
