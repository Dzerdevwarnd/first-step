import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLikesService } from '../postLikes/postLikes.service';
import { Post, PostDocument } from '../posts.mongo.scheme';
import { PostsRepository } from '../posts.repository';
import { postViewType, postsByBlogIdPaginationType } from '../posts.types';

export class GetPostsWithPaginationCommand {
  constructor(
    public query: any,
    public userId: string,
  ) {}
}

@CommandHandler(GetPostsWithPaginationCommand)
export class GetPostsWithPaginationUseCase
  implements ICommandHandler<GetPostsWithPaginationCommand>
{
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    protected postsRepository: PostsRepository,
    protected postLikesService: PostLikesService,
  ) {}
  async execute(
    command: GetPostsWithPaginationCommand,
  ): Promise<postsByBlogIdPaginationType> {
    const postsDB = await this.postsRepository.findPostsWithQuery(
      command.query,
    );
    const postsView: postViewType[] = [];
    for (const post of postsDB) {
      const like = await this.postLikesService.findPostLikeFromUser(
        command.userId,
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
      }; //

      postsView.push(postView);
    }
    const totalCount = await this.postModel.countDocuments();
    const pageSize = command.query.pageSize || 10;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const postsPagination = {
      pagesCount: pagesCount || 1,
      page: Number(command.query.pageNumber) || 1,
      pageSize: Number(pageSize),
      totalCount: totalCount || 0,
      items: postsView,
    };
    return postsPagination;
  }
}
