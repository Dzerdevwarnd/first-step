import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLikesEntity } from './postLikes.entity';

@Injectable()
export class PostLikesTypeOrmRepository {
  constructor(
    @InjectRepository(PostLikesEntity)
    private readonly postLikesRepository: Repository<PostLikesEntity>,
  ) {}

  async findPostLikeFromUser(userId: string, postId: string) {
    const like = await this.postLikesRepository.findOneBy({
      userId: userId,
      postId: postId,
    });
    return like;
  }

  async findLast3Likes(postId: string): Promise<PostLikesEntity[]> {
    return this.postLikesRepository.find({
      where: { postId: postId, likeStatus: 'Like' },
      order: { addedAt: 'DESC' },
      take: 3,
    });
  }

  async addLikeToBdFromUser(like: {
    userId: string;
    postId: string;
    likeStatus: string;
    login: string;
  }) {
    const likeDB = this.postLikesRepository.create(like);
    const result = await this.postLikesRepository.save(likeDB);
    return likeDB;
  }

  async updateUserLikeStatus(
    userId: string,
    postId: string,
    likeStatus: string,
  ): Promise<boolean> {
    const resultOfUpdate = await this.postLikesRepository
      .createQueryBuilder()
      .update(PostLikesEntity)
      .set({ likeStatus: likeStatus })
      .where('userId = :userId AND postId = :postId', { userId, postId })
      .execute();

    return resultOfUpdate.affected === 1;
  }
}
