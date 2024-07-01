import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPgSqlRepository } from '../posts.PgSqlRepository';
import { PostsTypeOrmRepository } from '../posts.TypeOrm.repository';
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
    protected postsTypeOrmRepository: PostsTypeOrmRepository,
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
