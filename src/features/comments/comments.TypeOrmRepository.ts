import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsEntity } from './comments.entity';
import {
  CommentDBType,
  CommentViewType,
  CommentsPaginationType,
} from './comments.types';

@Injectable()
export class CommentsTypeOrmRepository {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
  ) {}

  async findComment(commentId: string): Promise<CommentDBType | null> {
    const comment = this.commentsRepository.findOneBy({ id: commentId });
    if (!comment) {
      return null;
    }
    return comment;
  }

  async findDBCommentsByPostIdWithoutLikeStatus(
    postId: string,
    query: any,
  ): Promise<CommentDBType[] | null> {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const queryBuilder = this.commentsRepository.createQueryBuilder('comment');

    queryBuilder.where('comment.postId ILIKE :postId ', {
      postId: `%${postId}%`,
    });

    if (
      sortBy === 'content' ||
      sortBy === 'CommentatorInfo.userId' ||
      sortBy === 'CommentatorInfo.userLogin'
    ) {
      queryBuilder.addOrderBy(`user.${sortBy} COLLATE "C"`, sortDirection);
    } else {
      queryBuilder.addOrderBy(`user.${sortBy}`, sortDirection);
    }

    queryBuilder
      .addOrderBy('user.createdAt', sortDirection)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const comments = await queryBuilder.getMany();

    return comments;
  }

  async findCommentsByPostId(
    postId: string,
    query: any,
  ): Promise<CommentsPaginationType | null> {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const queryBuilder = this.commentsRepository.createQueryBuilder('comment');

    queryBuilder.where('comment.postId ILIKE :postId ', {
      postId: `%${postId}%`,
    });

    if (
      sortBy === 'content' ||
      sortBy === 'CommentatorInfo.userId' ||
      sortBy === 'CommentatorInfo.userLogin'
    ) {
      queryBuilder.addOrderBy(`comment.${sortBy} COLLATE "C"`, sortDirection);
    } else {
      queryBuilder.addOrderBy(`comment.${sortBy}`, sortDirection);
    }

    queryBuilder
      .addOrderBy('comment.createdAt', sortDirection)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const commentsDB = await queryBuilder.getMany();
    const commentsView = commentsDB.map((comment) => {
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
    const totalCount = await queryBuilder.getCount();
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
    const result = await this.commentsRepository.delete({ id: id });
    return result.affected === 1;
  }

  async updateComment(id: string, body: { content: string }): Promise<boolean> {
    const resultOfUpdate = await this.commentsRepository
      .createQueryBuilder()
      .update(CommentsEntity)
      .set({ content: body.content })
      .where('id = :id', {
        id,
      })
      .execute();

    return resultOfUpdate.affected === 1;
  }

  async updateCommentLikesAndDislikesCount(
    commentId: string,
    likesCount: number,
    dislikesCount: number,
  ): Promise<boolean> {
    const resultOfUpdate = await this.commentsRepository
      .createQueryBuilder()
      .update(CommentsEntity)
      .set({
        likesInfo: { likesCount: likesCount, dislikesCount: dislikesCount },
      })
      .where('id = :commentId', {
        commentId,
      })
      .execute();

    return resultOfUpdate.affected === 1;
  }

  async createComment(
    newComment: CommentDBType,
    userId: string,
  ): Promise<CommentViewType> {
    const comment = this.commentsRepository.create(newComment);
    const result = await this.commentsRepository.save(comment);
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
