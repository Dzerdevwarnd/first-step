import { Injectable } from '@nestjs/common';
import { PostLikesRepository } from './postLikes.repository';
import { postLikeDBType } from './postLikes.scheme.types';

@Injectable()
export class PostLikesService {
  constructor(protected postLikesRepository: PostLikesRepository) {}
  async findPostLikeFromUser(userId: string, postId: string) {
    const like = await this.postLikesRepository.findPostLikeFromUser(
      userId,
      postId,
    );
    return like;
  }
  async findLast3Likes(postId: string) {
    const last3Likes = await this.postLikesRepository.findLast3Likes(postId);
    return last3Likes;
  }

  async addLikeToBdFromUser(
    userId: string,
    postId: string,
    likeStatus: string,
    login?: string,
  ) {
    const like = new postLikeDBType(userId, postId, likeStatus, login);
    const result = await this.postLikesRepository.addLikeToBdFromUser(like);
    return result;
  }
  async updateUserLikeStatus(
    userId: string,
    postId: string,
    likeStatus: string,
  ) {
    const result = this.postLikesRepository.updateUserLikeStatus(
      userId,
      postId,
      likeStatus,
    );
    return result;
  }
}
