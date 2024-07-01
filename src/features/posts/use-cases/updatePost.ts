import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPgSqlRepository } from '../posts.PgSqlRepository';
import { PostsTypeOrmRepository } from '../posts.TypeOrm.repository';
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
  async execute(command: updatePostCommand): Promise<boolean> {
    const resultBoolean = this.postsRepository.updatePost(
      command.id,
      command.body,
    );
    return resultBoolean;
  }
}
