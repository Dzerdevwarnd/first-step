import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentLikeEntity } from './CommentLikes.entity';

@Injectable()
export class CommentLikesTypeOrmRepository {
  constructor(
    @InjectRepository(CommentLikeEntity)
    private readonly commentLikesRepository: Repository<CommentLikeEntity>,
  ) {}

  async findCommentLikeFromUser(userId: string, commentId: string) {
    const like = this.commentLikesRepository.findOneBy({
      userId: userId,
      commentId: commentId,
    });
    return like;
  }

  async addLikeToBdFromUser(like: {
    userId: string;
    commentId: string;
    likeStatus: string;
  }) {
    const commentLike = this.commentLikesRepository.create(like);
    const result = await this.commentLikesRepository.save(commentLike);
    if (!result) {
      return false;
    }
    return true;
  }

  async updateUserLikeStatus(
    userId: string,
    commentId: string,
    likeStatus: string,
  ) {
    const resultOfUpdate = await this.commentLikesRepository
      .createQueryBuilder()
      .update(CommentLikeEntity)
      .set({ likeStatus: likeStatus })
      .where('userId = :userId AND commentId = :commentId', {
        userId,
        commentId,
      })
      .execute();

    return resultOfUpdate.affected === 1;
  }
}
