import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLikesService } from 'src/posts/postLikes/postLikes.service';
import { PostsPgSqlRepository } from './posts.PgSqlRepository';
import { Post, PostDocument } from './posts.mongo.scheme';
import { PostsMongoRepository } from './posts.mongoRepository';

@Injectable()
export class PostsService {
  private postsRepository;
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    protected postsMongoRepository: PostsMongoRepository,
    protected postsPgSqlRepository: PostsPgSqlRepository,
    protected postLikesService: PostLikesService,
  ) {
    this.postsRepository = this.getPostsRepository();
  } //

  private getPostsRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.postsMongoRepository
      : this.postsPgSqlRepository;
  }
  /*async getPostsWithPagination(
    query: any,
    userId: string,
  ): Promise<postsByBlogIdPaginationType> {
    const postsDB = await this.postsRepository.findPostsWithQuery(query);
    const postsView: postViewType[] = [];
    for (const post of postsDB) {
      const like = null; //await postLikesService.findPostLikeFromUser(userId, post.id);
      const last3DBLikes = null; //await postLikesService.findLast3Likes(post.id);
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
    const totalCount = await this.postModel.countDocuments();
    const pageSize = query.pageSize || 10;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const postsPagination = {
      pagesCount: pagesCount || 1,
      page: Number(query.pageNumber) || 1,
      pageSize: Number(pageSize),
      totalCount: totalCount || 0,
      items: postsView,
    };
    return postsPagination;
  }
*/
  async findPost(params: { id: string }, userId: string) {
    const foundPost = await this.postsRepository.findPost(params);
    if (!foundPost) {
      return null;
    }
    const like = await this.postLikesService.findPostLikeFromUser(
      userId,
      params.id,
    );
    const last3DBLikes = await this.postLikesService.findLast3Likes(
      foundPost.id,
    );
    const postView = {
      title: foundPost.title,
      id: foundPost.id,
      content: foundPost.content,
      shortDescription: foundPost.shortDescription,
      blogId: foundPost.blogId,
      blogName: foundPost.blogName,
      createdAt: foundPost.createdAt,
      extendedLikesInfo: {
        likesCount: foundPost.likesInfo?.likesCount || foundPost.likesCount,
        dislikesCount:
          foundPost.likesInfo?.dislikesCount || foundPost.dislikesCount,
        myStatus: like?.likeStatus || 'None',
        newestLikes: last3DBLikes || [],
      },
    };
    return postView;
  }
  /*
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
    const postDB = await this.postsRepository.createPost(newPost);
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
    const postDB = await this.postsRepository.createPost(newPost);
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
    const resultBoolean = this.postsRepository.updatePost(id, body);
    return resultBoolean;
  }

  async updatePostLikeStatus(
    id: string,
    body: { likeStatus: string },
    accessToken: string,
  ): Promise<boolean> {
    const userId = await this.jwtService.verifyAndGetUserIdByToken(accessToken);
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
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    } else if (
      body.likeStatus === 'Dislike' &&
      post?.extendedLikesInfo.myStatus !== 'Dislike'
    ) {
      dislikesCount = +dislikesCount + 1;
      if (post?.extendedLikesInfo.myStatus === 'Like') {
        likesCount = +likesCount - 1;
      }
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    } else if (
      body.likeStatus === 'None' &&
      post?.extendedLikesInfo.myStatus === 'Like'
    ) {
      likesCount = likesCount - 1;
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    } else if (
      body.likeStatus === 'None' &&
      post?.extendedLikesInfo.myStatus === 'Dislike'
    ) {
      dislikesCount = dislikesCount - 1;
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    }
    const like = await this.postLikesService.findPostLikeFromUser(userId, id);
    const user = await this.usersService.findUser(userId);
    if (!like) {
      await this.postLikesService.addLikeToBdFromUser(
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
      this.postLikesService.updateUserLikeStatus(userId, id, body.likeStatus);
      return true;
    }
  }

  async deletePost(params: { id: string }): Promise<boolean> {
    const resultBoolean = this.postsRepository.deletePost(params);
    return resultBoolean;
  }
  */
}
//
