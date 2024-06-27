import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentLikesPgSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findCommentLikeFromUser(userId: string, commentId: string) {
    const like = await this.dataSource.query(
      `
      SELECT "userId","commentId","likeStatus" FROM "CommentLikes"
      WHERE "userId" ILIKE $1 AND "commentId" ILIKE $2
  `,
      [userId, commentId],
    );
    return like[0] || undefined;
  }

  async addLikeToBdFromUser(like: {
    userId: string;
    commentId: string;
    likeStatus: string;
  }) {
    const result = await this.dataSource.query(
      `
    INSERT INTO "CommentLikes" ("userId","commentId","likeStatus")
    VALUES ($1, $2, $3)
    RETURNING *
`,
      [like.userId, like.commentId, like.likeStatus],
    );
    return result.length == 1;
  }

  async updateUserLikeStatus(
    userId: string,
    commentId: string,
    likeStatus: string,
  ) {
    const result = await this.dataSource.query(
      `
			UPDATE "CommentLikes"
			SET "likeStatus" = $3
			WHERE "userId" = $1 AND  "commentId" = $2
			RETURNING *
			`,
      [userId, commentId, likeStatus],
    );
    return result.length == 1;
  }
}
