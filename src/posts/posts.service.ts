import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
  ) {}
  async returnAllPosts(
    query: any,
    userId: string,
  ): Promise<postsByBlogIdPaginationType> {
    const postsDB = await this.postsRepository.findPostsWithQuery(query);
    const postsView: postViewType[] = [];
    for (const post of postsDB) {
      let like = await postLikesService.findPostLikeFromUser(userId, post.id);
      let last3DBLikes = await postLikesService.findLast3Likes(post.id);
      let postView = {
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
    const totalCount = await postModel.countDocuments();
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
    const foundPost = await this.postsRepository.findPost(params);
    if (!foundPost) {
      return null;
    }
    let like = await postLikesService.findPostLikeFromUser(userId, params.id);
    let last3DBLikes = await postLikesService.findLast3Likes(foundPost.id);
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
    let like = await postLikesService.findPostLikeFromUser(userId, id);
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
    const resultBoolean = this.postsRepository.deletePost(params);
    return resultBoolean;
  }
}
