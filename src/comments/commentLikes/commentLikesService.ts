import { Injectable } from '@nestjs/common';
import { commentLikeDBType } from './commentLikes.types';
import { CommentLikesRepository } from './commentLikesRepository';

@Injectable()
export class CommentLikesService {
  constructor(protected commentLikesRepository: CommentLikesRepository) {}
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
