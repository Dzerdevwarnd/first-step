import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Post,
  PostDocument,
  postDBType,
  postViewType,
  postsByBlogIdPaginationType,
} from './posts.scheme.types';

@Injectable()
export class PostsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}
  async returnAllPosts(
    query: any,
    userId: string,
  ): Promise<postsByBlogIdPaginationType> {
    const pageSize = Number(query?.pageSize) || 10;
    const page = Number(query?.pageNumber) || 1;
    const sortBy: string = query?.sortBy ?? 'createdAt';
    let sortDirection = query?.sortDirection ?? 'desc';
    if (sortDirection === 'desc') {
      sortDirection = -1;
    } else {
      sortDirection = 1;
    }
    const postsDB = await this.postModel
      .find({}, '-_id -__v')
      .skip((page - 1) * pageSize)
      .sort({ [sortBy]: sortDirection, createdAt: sortDirection })
      .limit(pageSize)
      .lean();
    const totalCount = await this.postModel.countDocuments();
    const postsView: postViewType[] = [];
    for (const post of postsDB) {
      const like = await postLikesService.findPostLikeFromUser(userId, post.id);
      const last3DBLikes = await postLikesService.findLast3Likes(post.id);
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
      }; //

      postsView.push(postView);
    }
    const pagesCount = Math.ceil(totalCount / query.pageSize);
    const postsPagination = {
      pagesCount: pagesCount || 0,
      page: Number(query.page) || 1,
      pageSize: query.pageSize || 10,
      totalCount: totalCount || 0,
      items: postsView,
    };
    return postsPagination;
  }

  async findPost(
    params: { id: string },
    userId: string,
  ): Promise<postViewType | null> {
    const foundPost = await this.postModel.findOne({ id: params.id });
    if (!foundPost) {
      return null;
    }
    const like = await postLikesService.findPostLikeFromUser(userId, params.id);
    const last3DBLikes = await postLikesService.findLast3Likes(foundPost.id);
    const postView = {
      title: foundPost.title,
      id: foundPost.id,
      content: foundPost.content,
      shortDescription: foundPost.shortDescription,
      blogId: foundPost.blogId,
      blogName: foundPost.blogName,
      createdAt: foundPost.createdAt,
      extendedLikesInfo: {
        likesCount: foundPost.likesInfo.likesCount,
        dislikesCount: foundPost.likesInfo.dislikesCount,
        myStatus: like?.likeStatus || 'None',
        newestLikes: last3DBLikes || [],
      },
    };
    return postView;
  }
  async createPost(body: {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
  }): Promise<postViewType> {
    const createdDate = new Date();
    const newPost: postDBType = {
      id: String(Date.now()),
      title: body.title,
      shortDescription: body.shortDescription,
      content: body.content,
      blogId: body.blogId,
      blogName: '',
      createdAt: createdDate,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    };
    const result = await this.postModel.insertMany(newPost);
    const postView: postViewType = {
      id: newPost.id,
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
    return postView;
  }
  async createPostByBlogId(
    body: {
      title: string;
      shortDescription: string;
      content: string;
    },
    id: string,
  ): Promise<postViewType> {
    const createdDate = new Date();
    const newPost: postDBType = {
      id: String(Date.now()),
      title: body.title,
      shortDescription: body.shortDescription,
      content: body.content,
      blogId: id,
      blogName: '',
      createdAt: createdDate,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    };
    await this.postModel.insertMany(newPost);
    const postView: postViewType = {
      id: newPost.id,
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
    return postView;
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
    const resultBoolean = await this.postModel.updateOne(
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
    return resultBoolean.matchedCount === 1;
  }

  async updatePostLikeStatus(
    id: string,
    body: { likeStatus: string },
    accessToken: string,
  ): Promise<boolean> {
    const userId = await jwtService.verifyAndGetUserIdByToken(accessToken);
    const post = await this.findPost({ id }, userId);
    let likesCount = post!.extendedLikesInfo.likesCount;
    let dislikesCount = post!.extendedLikesInfo.dislikesCount;
    if (
      body.likeStatus === 'Like' &&
      post?.extendedLikesInfo.myStatus !== 'Like'
    ) {
      likesCount = +likesCount + 1;
      if (post?.extendedLikesInfo.myStatus === 'Dislike') {
        dislikesCount = +dislikesCount - 1;
      }
      await this.postModel.updateOne(
        { id: id },
        {
          $set: {
            'likesInfo.likesCount': likesCount,
            'likesInfo.dislikesCount': dislikesCount,
          },
        },
      );
    } else if (
      body.likeStatus === 'Dislike' &&
      post?.extendedLikesInfo.myStatus !== 'Dislike'
    ) {
      dislikesCount = +dislikesCount + 1;
      if (post?.extendedLikesInfo.myStatus === 'Like') {
        likesCount = +likesCount - 1;
      }
      await this.postModel.updateOne(
        { id: id },
        {
          $set: {
            'likesInfo.likesCount': likesCount,
            'likesInfo.dislikesCount': dislikesCount,
          },
        },
      );
    } else if (
      body.likeStatus === 'None' &&
      post?.extendedLikesInfo.myStatus === 'Like'
    ) {
      likesCount = likesCount - 1;
      await this.postModel.updateOne(
        { id: id },
        {
          $set: {
            'likesInfo.likesCount': likesCount,
            'likesInfo.dislikesCount': dislikesCount,
          },
        },
      );
    } else if (
      body.likeStatus === 'None' &&
      post?.extendedLikesInfo.myStatus === 'Dislike'
    ) {
      dislikesCount = dislikesCount - 1;
      await this.postModel.updateOne(
        { id: id },
        {
          $set: {
            'likesInfo.likesCount': likesCount,
            'likesInfo.dislikesCount': dislikesCount,
          },
        },
      );
    }
    const like = await postLikesService.findPostLikeFromUser(userId, id);
    const user = await userService.findUser(userId);
    if (!like) {
      await postLikesService.addLikeToBdFromUser(
        userId,
        id,
        body.likeStatus,
        user?.accountData.login,
      );
      return true;
    } else {
      if (like.likeStatus === body.likeStatus) {
        return false;
      }
      postLikesService.updateUserLikeStatus(userId, id, body.likeStatus);
      return true;
    }
  }

  async deletePost(params: { id: string }): Promise<boolean> {
    const result = await this.postModel.deleteOne({ id: params.id });
    return result.deletedCount === 1;
  }
}
