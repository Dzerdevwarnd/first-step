import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { postLikeViewType } from './postLikes.types';

@Injectable()
export class PostLikesPgSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findPostLikeFromUser(userId: string, postId: string) {
    const like = await this.dataSource.query(
      `
      SELECT * FROM "PostLikes"
      WHERE "userId" ILIKE $1 AND "postId" ILIKE $2
  `,
      [userId, postId],
    );
    return like[0] || undefined;
  }

  async findLast3Likes(postId: string): Promise<postLikeViewType[]> {
    const last3Likes = await this.dataSource.query(
      `
			SELECT "userId", "login", "addedAt" 
			FROM "PostLikes"
			ORDER BY "addedAt" DESC
			LIMIT 3
  `,
    );
    if ((last3Likes.length = 0)) {
      return undefined;
    }
    return last3Likes;
  }

  async addLikeToBdFromUser(like: {
    userId: string;
    postId: string;
    likeStatus: string;
    login: string;
  }) {
    const result = await this.dataSource.query(
      `
    INSERT INTO "PostLikes" ("userId","postId","likeStatus","login")
    VALUES ($1, $2, $3,$4)
    RETURNING *
`,
      [like.userId, like.postId, like.likeStatus, like.login],
    );
    return result.length == 1;
  }
  async updateUserLikeStatus(
    userId: string,
    postId: string,
    likeStatus: string,
  ) {
    const result = await this.dataSource.query(
      `
			UPDATE "PostLikes"
			SET "likeStatus" = $3
			WHERE "userId" = $1 AND  "postId" = $2
			RETURNING *
			`,
      [userId, postId, likeStatus],
    );
    return result.length == 1;
  }
}
