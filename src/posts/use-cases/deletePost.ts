import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPgSqlRepository } from '../posts.PgSqlRepository';
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
  ) {
    this.postsRepository = this.getPostsRepository();
  }

  private getPostsRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.postsMongoRepository
      : this.postsPgSqlRepository;
  }
  async execute(command: deletePostCommand): Promise<boolean> {
    const resultBoolean = this.postsRepository.deletePost(command.params);
    return resultBoolean;
  }
}
