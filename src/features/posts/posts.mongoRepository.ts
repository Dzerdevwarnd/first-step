import { PostLikesService } from '@app/src/features/posts/postLikes/postLikes.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './posts.mongo.scheme';
import {
  postDBType,
  postViewType,
  postsByBlogIdPaginationType,
} from './posts.types';

@Injectable()
export class PostsMongoRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    protected postLikesService: PostLikesService,
  ) {}
  async findPostsWithQuery(query: any) {
    const pageSize = Number(query?.pageSize) || 10;
    const page = Number(query?.pageNumber) || 1;
    const sortBy: string = query?.sortBy ?? 'createdAt';
    let sortDirection = query?.sortDirection ?? 'desc';
    if (sortDirection === 'desc') {
      sortDirection = -1;
    } else {
      sortDirection = 1;
    }
    const posts = await this.postModel
      .find({}, '-_id -__v')
      .skip((page - 1) * pageSize)
      .sort({ [sortBy]: sortDirection, createdAt: sortDirection })
      .limit(pageSize)
      .lean();
    const totalCount = await this.postModel.countDocuments();
    return { posts, totalCount };
  }
  async findPost(params: { id: string }): Promise<postDBType | null> {
    const post: postDBType | null = await this.postModel.findOne({
      id: params.id,
    });
    return post;
  }

  async findPostsByBlogId(
    params: {
      id: string;
    },
    query: any,
    userId: string,
  ): Promise<postsByBlogIdPaginationType | undefined> {
    const totalCount: number = await this.postModel.countDocuments({
      blogId: params.id,
    });
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = -1;
    } else {
      sortDirection = 1;
    }
    const postsDB: postDBType[] = await this.postModel
      .find({ blogId: params.id }, { projection: { _id: 0 } })
      .skip((page - 1) * pageSize)
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .lean();
    const postsView: postViewType[] = [];
    for (const post of postsDB) {
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
      return;
    }
  }

  async createPost(newPost: postDBType): Promise<boolean> {
    const result = await this.postModel.insertMany(newPost);
    return result.length == 1;
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
    const result = await this.postModel.updateOne(
      { id: id },
      {
        $set: {
          title: body.title,
          shortDescription: body.shortDescription,
          content: body.content,
          blogId: body.blogId,
        },
      },
    );
    return result.matchedCount === 1;
  }

  async updatePostLikesAndDislikesCount(
    postId: string,
    likesCount: number,
    dislikesCount: number,
  ): Promise<boolean> {
    const resultOfUpdate = await this.postModel.updateOne(
      { id: postId },
      {
        $set: {
          'likesInfo.likesCount': likesCount,
          'likesInfo.dislikesCount': dislikesCount,
        },
      },
    );
    return resultOfUpdate.matchedCount === 1;
  }

  async deletePost(params: { id: string }): Promise<boolean> {
    const result = await this.postModel.deleteOne({ id: params.id });
    return result.deletedCount === 1;
  }
}
