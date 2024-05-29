import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPgSqlRepository } from '../posts.PgSqlRepository';
import { PostsMongoRepository } from '../posts.mongoRepository';

export class updatePostCommand {
  constructor(
    public id: string,
    public body: {
      title: string;
      shortDescription: string;
      content: string;
      blogId?: string;
    },
  ) {}
}

@CommandHandler(updatePostCommand)
export class updatePostUseCase implements ICommandHandler<updatePostCommand> {
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
  async execute(command: updatePostCommand): Promise<boolean> {
    const resultBoolean = this.postsRepository.updatePost(
      command.id,
      command.body,
    );
    return resultBoolean;
  }
}
