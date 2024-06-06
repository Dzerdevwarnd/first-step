/* import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikesService } from '../postLikes/postLikes.service';
import { PostsPgSqlRepository } from '../posts.PgSqlRepository';
import { PostsMongoRepository } from '../posts.mongoRepository';
import { postViewType } from '../posts.types';

export class FindPostCommand {
  constructor(
    public params: { id: string },
    public userId: string,
  ) {}
}

@CommandHandler(FindPostCommand)
export class FindPostUseCase implements ICommandHandler<FindPostCommand> {
  private postsRepository;
  constructor(
    protected postsMongoRepository: PostsMongoRepository,
    protected postsPgSqlRepository: PostsPgSqlRepository,
    protected postLikesService: PostLikesService,
  ) {
    this.postsRepository = this.getPostsRepository();
  }

  private getPostsRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.postsMongoRepository
      : this.postsPgSqlRepository;
  }
  async execute(command: FindPostCommand): Promise<postViewType | null> {
    const foundPost = await this.postsRepository.findPost(command.params);
    if (!foundPost) {
      return null;
    }
    const like = await this.postLikesService.findPostLikeFromUser(
      command.userId,
      command.params.id,
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
        likesCount: foundPost.likesInfo.likesCount || foundPost.likesCount || 0,
        dislikesCount:
          foundPost.likesInfo.dislikesCount || foundPost.dislikesCount || 0,
        myStatus: like?.likeStatus || 'None',
        newestLikes: last3DBLikes || [],
      },
    };
    return postView;
  }
}
 */
