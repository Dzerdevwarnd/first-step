import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentLike, CommentLikeDocument } from './commentLikes.mongo.scheme';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private commentLikeModel: Model<CommentLikeDocument>,
  ) {}
  async findCommentLikeFromUser(userId: string, commentId: string) {
    const like = await this.commentLikeModel.findOne({
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
    const result = await this.commentLikeModel.insertMany(like);
    return result.length == 1;
  }
  async updateUserLikeStatus(
    userId: string,
    commentId: string,
    likeStatus: string,
  ) {
    const result = await this.commentLikeModel.updateOne(
      { userId: userId, commentId: commentId },
      { likeStatus: likeStatus },
    );
    return result.modifiedCount == 1;
  }
}
