import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPgSqlRepository } from '../posts.PgSqlRepository';
import { PostsTypeOrmRepository } from '../posts.TypeOrm.repository';
import { PostsMongoRepository } from '../posts.mongoRepository';

export class deletePostCommand {
  constructor(public params: { blogId?: string; postId: string }) {}
}

@CommandHandler(deletePostCommand)
export class deletePostUseCase implements ICommandHandler<deletePostCommand> {
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
  async execute(command: deletePostCommand): Promise<boolean> {
    const resultBoolean = this.postsRepository.deletePost(command.params);
    return resultBoolean;
  }
}
