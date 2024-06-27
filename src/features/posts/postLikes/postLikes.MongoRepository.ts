import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLike, PostLikeDocument } from './postLikes.scheme';
import { postLikeViewType } from './postLikes.types';

@Injectable()
export class PostLikesMongoRepository {
  constructor(
    @InjectModel(PostLike.name)
    private postLikeModel: Model<PostLikeDocument>,
  ) {}
  async findPostLikeFromUser(userId: string, postId: string) {
    const like = await this.postLikeModel.findOne({
      userId: userId,
      postId: postId,
    });
    return like;
  }

  async findLast3Likes(postId: string): Promise<postLikeViewType[]> {
    const last3Likes = await this.postLikeModel
      .find(
        { postId: postId, likeStatus: 'Like' },
        {
          addedAt: 1,
          userId: 1,
          login: 1,
          _id: 0,
        },
      )
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
    return last3Likes;
  }

  async addLikeToBdFromUser(like: {
    userId: string;
    postId: string;
    likeStatus: string;
    login: string;
  }) {
    const result = await this.postLikeModel.insertMany(like);
    return result.length == 1;
  }
  async updateUserLikeStatus(
    userId: string,
    postId: string,
    likeStatus: string,
  ) {
    const result = await this.postLikeModel.updateOne(
      { userId: userId, postId: postId },
      { likeStatus: likeStatus },
    );
    return result.modifiedCount == 1;
  }
}
