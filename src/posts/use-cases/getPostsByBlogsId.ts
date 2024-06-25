import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikesService } from '../postLikes/postLikes.service';
import { PostsPgSqlRepository } from '../posts.PgSqlRepository';
import { PostsMongoRepository } from '../posts.mongoRepository';
import { postsByBlogIdPaginationType } from '../posts.types';

export class GetPostsByBlogIdCommand {
  constructor(
    public params: { id: string },
    public query: any,
    public userId: string,
  ) {}
}

@CommandHandler(GetPostsByBlogIdCommand)
export class GetPostsByBlogIdUseCase
  implements ICommandHandler<GetPostsByBlogIdCommand>
{
  private postsRepository;
  constructor(
    protected postsMongoRepository: PostsMongoRepository,
    protected postsPgSqlRepository: PostsPgSqlRepository,
    protected postLikesService: PostLikesService,
  ) {
    this.postsRepository = this.getUsersRepository();
  }

  private getUsersRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.postsMongoRepository
      : this.postsPgSqlRepository;
  }
  async execute(
    command: GetPostsByBlogIdCommand,
  ): Promise<postsByBlogIdPaginationType> {
    const postsWithPagination = await this.postsRepository.findPostsByBlogId(
      command.params,
      command.query,
      command.userId,
    );

    return postsWithPagination;
  }
}
