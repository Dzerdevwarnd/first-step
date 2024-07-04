import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLikesService } from './postLikes/postLikes.service';
import { PostEntity } from './posts.entity';
import {
  postDBType,
  postViewType,
  postsByBlogIdPaginationType,
} from './posts.types';

@Injectable()
export class PostsTypeOrmRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    private postLikesService: PostLikesService,
  ) {}

  async findPost(params: { id: string }): Promise<postDBType | null> {
    const Post = await this.postsRepository.findOneBy({ id: params.id });
    if (!Post) {
      return null;
    }
    return Post;
  }

  async returnPostsWithQueryAndTotalCount(query: any) {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    const searchNameTerm: string = query.searchNameTerm || '';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    if (
      sortBy === 'title' ||
      sortBy === 'shortDescription' ||
      sortBy === 'blogName' ||
      sortBy === 'content'
    ) {
      queryBuilder.addOrderBy(`post.${sortBy} COLLATE "C"`, sortDirection);
    } else {
      queryBuilder.addOrderBy(`post.${sortBy}`, sortDirection);
    }

    queryBuilder
      .addOrderBy('post.createdAt', sortDirection)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const posts = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();

    return { posts, totalCount };
  }

  async findPostsByBlogId(
    params: {
      id: string;
    },
    query: any,
    userId: string,
  ): Promise<postsByBlogIdPaginationType | null> {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    const searchBlogIdTerm: string = params.id || '';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    if (searchBlogIdTerm) {
      queryBuilder.where('post.blogId ILIKE :searchBlogIdTerm', {
        searchBlogIdTerm: `%${searchBlogIdTerm}%`,
      });
    }
    if (
      sortBy === 'title' ||
      sortBy === 'shortDescription' ||
      sortBy === 'blogName' ||
      sortBy === 'content'
    ) {
      queryBuilder.addOrderBy(`post.${sortBy} COLLATE "C"`, sortDirection);
    } else {
      queryBuilder.addOrderBy(`post.${sortBy}`, sortDirection);
    }

    queryBuilder
      .addOrderBy('post.createdAt', sortDirection)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const posts = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();

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
          likesCount: post.likesInfo.likesCount,
          dislikesCount: post.likesInfo.dislikesCount,
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
      return null;
    }
  }

  async createPost(newPost: postDBType): Promise<postDBType> {
    const post = this.postsRepository.create(newPost);
    const result = await this.postsRepository.save(post);
    return post;
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
    const resultOfUpdate = await this.postsRepository
      .createQueryBuilder()
      .update(PostEntity)
      .set({
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogId: body.blogId,
      })
      .where('id = :id', {
        id,
      })
      .execute();

    return resultOfUpdate.affected === 1;
  }

  async updatePostLikesAndDislikesCount(
    postId: string,
    likesCount: number,
    dislikesCount: number,
  ): Promise<boolean> {
    const resultOfUpdate = await this.postsRepository
      .createQueryBuilder()
      .update(PostEntity)
      .set({
        likesInfo: { likesCount: likesCount, dislikesCount: dislikesCount },
      })
      .where('id = :postId', {
        postId,
      })
      .execute();

    return resultOfUpdate.affected === 1;
  }

  async deletePost(params: { postId: string }): Promise<boolean> {
    const result = await this.postsRepository.delete({ id: params.postId });
    return result.affected === 1;
  }
}
