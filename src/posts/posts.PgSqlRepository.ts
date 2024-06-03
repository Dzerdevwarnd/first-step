import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostLikesService } from 'src/posts/postLikes/postLikes.service';
import { DataSource } from 'typeorm';
import {
  postDBType,
  postViewType,
  postsByBlogIdPaginationType,
} from './posts.types';

@Injectable()
export class PostsPgSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected postLikesService: PostLikesService,
  ) {}
  async findPostsWithQuery(query: any) {
    const pageSize = Number(query?.pageSize) || 10;
    const page = Number(query?.pageNumber) || 1;
    const sortBy: string = query?.sortBy ?? 'createdAt';
    let sortDirection = query?.sortDirection ?? 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const posts = await this.dataSource.query(
      `
      SELECT id,title,"shortDescription","content","blogId","blogName","createdAt" FROM "Posts"
      ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}
      OFFSET $1 LIMIT $2
  `,
      [(page - 1) * pageSize, pageSize],
    );
    const totalCountQuery = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM "Posts"

`,
    );
    const totalCount = await parseInt(totalCountQuery[0].count, 10);
    return { posts, totalCount };
  }
  async findPost(params: { id: string }): Promise<postDBType | null> {
    const post = await this.dataSource.query(
      `
      SELECT id,title,"shortDescription","content","blogId","blogName","createdAt" FROM "Posts"
			WHERE id ILIKE $1
  `,
      [params.id],
    );
    return post[0];
  }

  async findPostsByBlogId(
    params: {
      id: string;
    },
    query: any,
    userId: string,
  ): Promise<postsByBlogIdPaginationType | undefined> {
    const totalCountQuery = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM "Posts"
		WHERE "blogId" ILIKE $1
`,
      [params.id],
    );
    const totalCount = await parseInt(totalCountQuery[0].count, 10);
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const posts = await this.dataSource.query(
      `
      SELECT id,title,"shortDescription","content","blogId","blogName","createdAt" FROM "Posts"
			WHERE "blogId" ILIKE $1
      ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}
      OFFSET $2 LIMIT $3
  `,
      [params.id, (page - 1) * pageSize, pageSize],
    );
    const postsView: postViewType[] = [];
    for (const post of posts) {
      const like = await this.postLikesService.findPostLikeFromUser(
        userId,
        post.id,
      );
      const last3DBLikes = await this.postLikesService.findLast3Likes(post.id);

      const postView = {
        title: post.title,
        id: post.id,
        content: post.content,
        shortDescription: post.shortDescription,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.likesInfo?.likesCount || 0,
          dislikesCount: post.likesInfo?.dislikesCount || 0,
          myStatus: like?.likeStatus || 'None',
          newestLikes: last3DBLikes || [],
        },
      };
      postsView.push(postView);
    }
    const pageCount = Math.ceil(totalCount / pageSize);
    const postsPagination = {
      pagesCount: pageCount,
      page: page,
      pageSize: pageSize,
      totalCount: totalCount,
      items: postsView,
    };
    if (postsView.length > 0) {
      return postsPagination;
    } else {
      return;
    }
  }

  async createPost(newPost: postDBType): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    INSERT INTO "Posts" (id,title,"shortDescription","content","blogId","blogName","createdAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
`,
      [
        newPost.id,
        newPost.title,
        newPost.shortDescription,
        newPost.content,
        newPost.blogId,
        newPost.blogName,
        newPost.createdAt.toISOString(),
      ],
    );
    return result[1] == 1;
  }

  async updatePost(
    id: string,
    body: {
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
    },
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
			UPDATE "Posts"
			SET "title" = $3,
					"shortDescription" = $4,
					"content" = $5
			WHERE "id" = $1 AND "blogId" = $2 
			RETURNING *
			`,
      [id, body.blogId, body.title, body.shortDescription, body.content],
    );
    return result[1] === 1;
  }
  async updatePostLikesAndDislikesCount(
    postId: string,
    likesCount: number,
    dislikesCount: number,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
			UPDATE "Posts"
			SET "likesCount" = $2,
					"dislikesCount" = $3
			WHERE "id" = $1
			RETURNING *
			`,
      [postId, likesCount, dislikesCount],
    );
    return result[1] === 1;
  }

  async deletePost(params: {
    postId: string;
    blogId: string;
  }): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM "Posts"
    WHERE id = $1 AND "blogId" = $2
  `,
      [params.postId, params.blogId],
    );
    return result[1] === 1;
  }
}
