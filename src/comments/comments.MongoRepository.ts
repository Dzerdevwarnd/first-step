import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comments.mongo.scheme';
import {
  CommentDBType,
  CommentViewType,
  CommentsPaginationType,
} from './comments.types';

@Injectable()
export class CommentsMongoRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async findComment(commentId: string): Promise<CommentDBType | null> {
    const foundComment = await this.commentModel.findOne({ id: commentId });
    if (!foundComment) {
      return null;
    }

    return foundComment;
  }

  async findDBCommentsByPostIdWithoutLikeStatus(
    postId: string,
    query: any,
  ): Promise<CommentDBType[] | null> {
    const pageSize = Number(query?.pageSize) || 10;
    const page = Number(query?.pageNumber) || 1;
    const sortBy: string = query?.sortBy ?? 'createdAt';
    let sortDirection = query?.sortDirection ?? 'desc';
    if (sortDirection === 'desc') {
      sortDirection = -1;
    } else {
      sortDirection = 1;
    }
    const commentsDB = await this.commentModel
      .find({ postId: postId })
      .skip((page - 1) * pageSize)
      .sort({ [sortBy]: sortDirection, createdAt: sortDirection })
      .limit(pageSize)
      .lean();
    return commentsDB;
  }

  async findCommentsByPostId(
    id: string,
    query: any,
  ): Promise<CommentsPaginationType | null> {
    const pageSize = Number(query?.pageSize) || 10;
    const page = Number(query?.pageNumber) || 1;
    const sortBy: string = query?.sortBy ?? 'createdAt';
    let sortDirection = query?.sortDirection ?? 'desc';
    if (sortDirection === 'desc') {
      sortDirection = -1;
    } else {
      sortDirection = 1;
    }
    const commentsDB = await this.commentModel
      .find({ postId: id }, { projection: { _id: 0, postId: 0 } })
      .skip((page - 1) * pageSize)
      .sort({ [sortBy]: sortDirection, createdAt: sortDirection })
      .limit(pageSize)
      .lean();
    const commentsView = commentsDB.map((comment) => {
      /*let userLikeStatus = ''
				if (comment.likesInfo.arraysOfUsersWhoLikeOrDis?.likeArray.includes(userId)){
					userLikeStatus = "Like"
				} else if (comment.likesInfo.arraysOfUsersWhoLikeOrDis?.dislikeArray.includes(userId)){
					userLikeStatus = "Dislike"
				} else {
					userLikeStatus = "None"
				}*/
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId,
          userLogin: comment.commentatorInfo.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesInfo.likesCount,
          dislikesCount: comment.likesInfo.dislikesCount,
          myStatus: 'None', //userLikeStatus
        },
      };
    });
    const totalCount = await this.commentModel.countDocuments({ postId: id });
    const pagesCount = Math.ceil(totalCount / pageSize);
    const commentsPagination: CommentsPaginationType =
      new CommentsPaginationType(
        pagesCount,
        Number(page),
        pageSize,
        totalCount,
        commentsView,
      );
    return commentsPagination;
  }

  async deleteComment(id: string): Promise<boolean> {
    const resultOfDelete = await this.commentModel.deleteOne({ id: id });
    return resultOfDelete.deletedCount === 1;
  }

  async updateComment(id: string, body: { content: string }): Promise<boolean> {
    const resultOfUpdate = await this.commentModel.updateOne(
      { id: id },
      {
        $set: {
          content: body.content,
        },
      },
    );
    return resultOfUpdate.matchedCount === 1;
  }

  async updateCommentLikesAndDislikesCount(
    commentId: string,
    likesCount: number,
    dislikesCount: number,
  ): Promise<boolean> {
    const resultOfUpdate = await this.commentModel.updateOne(
      { id: commentId },
      {
        $set: {
          'likesInfo.likesCount': likesCount,
          'likesInfo.dislikesCount': dislikesCount,
        },
      },
    );
    return resultOfUpdate.matchedCount === 1;
  }

  async createComment(
    newComment: CommentDBType,
    userId: string,
  ): Promise<CommentViewType> {
    const result = await this.commentModel.insertMany(newComment);
    const viewComment: CommentViewType = new CommentViewType(
      newComment.id,
      newComment.content,
      {
        userId: newComment.commentatorInfo.userId,
        userLogin: newComment.commentatorInfo.userLogin,
      },
      newComment.createdAt,
      {
        likesCount: newComment.likesInfo.likesCount,
        dislikesCount: newComment.likesInfo.dislikesCount,
        myStatus: 'None',
      },
    );
    return viewComment;
  }
}
