import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CommentDBType,
  CommentViewType,
  CommentsPaginationType,
} from './comments.types';

@Injectable()
export class CommentsPgSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findComment(commentId: string): Promise<CommentViewType | null> {
    const foundComment = await this.dataSource.query(
      `
      SELECT id,content,"userId","userLogin","createdAt","likesCount","dislikesCount","myStatus" FROM "Comments"
      WHERE id ILIKE $1
  `,
      [commentId],
    );
    if (!foundComment[0]) {
      return null;
    }

    return foundComment[0];
  }

  async findDBCommentsByPostIdWithoutLikeStatus(postId: string, query: any) {
    const pageSize = Number(query?.pageSize) || 10;
    const page = Number(query?.pageNumber) || 1;
    const sortBy: string = query?.sortBy ?? 'createdAt';
    let sortDirection = query?.sortDirection ?? 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const commentsDB = await this.dataSource.query(
      `
      SELECT * FROM "Comments"
      WHERE "postId" ILIKE $1
      ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}
      OFFSET $2 LIMIT $3
  `,
      [`%${postId}%`, (page - 1) * pageSize, pageSize],
    );
    const commentsView = commentsDB.map((comment) => ({
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: 'None',
      },
    }));
    return commentsView;
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
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const commentsDB = await this.dataSource.query(
      `
      SELECT * FROM "Comments"
      WHERE "postId" ILIKE $1
      ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}
      OFFSET $2 LIMIT $3
  `,
      [`%${id}%`, (page - 1) * pageSize, pageSize],
    );
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
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesCount,
          dislikesCount: comment.dislikesCount,
          myStatus: 'None', //userLikeStatus
        },
      };
    });
    const totalCountQuery = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM "Comments"
    WHERE "postId" ILIKE $1 
`,
      [`%${id}%`],
    );
    const totalCount = parseInt(totalCountQuery[0].count, 10);
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
    const result = await this.dataSource.query(
      `
    DELETE FROM "Comments"
    WHERE id = $1
  `,
      [id],
    );
    return result[1] === 1;
  }

  async updateComment(id: string, body: { content: string }): Promise<boolean> {
    const resultOfUpdate = await this.dataSource.query(
      `
			UPDATE "Comments"
			SET "content" = $2
			WHERE "id" = $1
			RETURNING *
			`,
      [id, body.content],
    );
    return resultOfUpdate[1] === 1;
  }

  async updateCommentLikesAndDislikesCount(
    commentId: string,
    likesCount: number,
    dislikesCount: number,
  ): Promise<boolean> {
    const resultOfUpdate = await this.dataSource.query(
      `
			UPDATE "Comments"
			SET "likesCount" = $2, "dislikesCount" = $3,
			WHERE "id" = $1
			RETURNING *
			`,
      [commentId, likesCount, dislikesCount],
    );
    return resultOfUpdate.length === 1;
  }

  async createComment(
    newComment: CommentDBType,
    userId: string,
  ): Promise<CommentViewType> {
    const result = await this.dataSource.query(
      `
    INSERT INTO "Comments" (id,"postId",content,"createdAt","userId","userLogin","likesCount","dislikesCount","myStatus")
    VALUES ($1, $2, $3, $4, $5, $6,$7,$8,$9)
`,
      [
        newComment.id,
        newComment.postId,
        newComment.content,
        newComment.createdAt.toISOString(),
        newComment.commentatorInfo.userId,
        newComment.commentatorInfo.userLogin,
        newComment.likesInfo.likesCount,
        newComment.likesInfo.dislikesCount,
        'None',
      ],
    );
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
//
