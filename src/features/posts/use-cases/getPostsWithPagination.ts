import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikesService } from '../postLikes/postLikes.service';
import { PostsPgSqlRepository } from '../posts.PgSqlRepository';
import { PostsTypeOrmRepository } from '../posts.TypeOrm.repository';
import { PostsMongoRepository } from '../posts.mongoRepository';
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
  private postsRepository;
  constructor(
    protected postsMongoRepository: PostsMongoRepository,
    protected postsPgSqlRepository: PostsPgSqlRepository,
    protected postsTypeOrmRepository: PostsTypeOrmRepository,
    protected postLikesService: PostLikesService,
  ) {
    this.postsRepository = this.getPostsRepository();
  }

  private getPostsRepository() {
    const repositories = {
      Mongo: this.postsMongoRepository,
      PgSql: this.postsPgSqlRepository,
      TypeOrm: this.postsTypeOrmRepository,
    };

    return repositories[process.env.REPOSITORY] || this.postsMongoRepository;
  } ////
  async execute(
    command: GetPostsWithPaginationCommand,
  ): Promise<postsByBlogIdPaginationType> {
    const postsDBAndTotalCount =
      await this.postsRepository.returnPostsWithQueryAndTotalCount(
        command.query,
      );
    const postsView: postViewType[] = [];
    for (const post of postsDBAndTotalCount.posts) {
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
          likesCount: post.likesInfo?.likesCount || post.likesCount,
          dislikesCount: post.likesInfo?.dislikesCount || post.dislikesCount,
          myStatus: like?.likeStatus || 'None',
          newestLikes: last3DBLikes || [],
        },
      }; ////

      postsView.push(postView);
    }
    const totalCount = postsDBAndTotalCount.totalCount;
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
