import { Injectable } from '@nestjs/common';
import { PostLikesMongoRepository } from './postLikes.MongoRepository';
import { PostLikesPgSqlRepository } from './postLikes.PgSqlRepository';
import { postLikeDBType } from './postLikes.types';

@Injectable()
export class PostLikesService {
  private postLikesRepository;
  constructor(
    protected postLikesMongoRepository: PostLikesMongoRepository,
    protected postLikesPgSqlRepository: PostLikesPgSqlRepository,
  ) {
    this.postLikesRepository = this.getPostLikeRepository();
  }
  private getPostLikeRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.postLikesMongoRepository
      : this.postLikesPgSqlRepository;
  }
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
