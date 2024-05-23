import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsMongoRepository } from '../blogs.mongoRepository';
import { BlogsPgSqlRepository } from '../blogs.postgreRepository';

export class DeleteBlogCommand {
  constructor(public params: { id: string }) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  private blogsRepository;
  constructor(
    protected blogsMongoRepository: BlogsMongoRepository,
    protected blogsPgSqlRepository: BlogsPgSqlRepository,
  ) {
    this.blogsRepository = this.getUsersRepository();
  }

  private getUsersRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.blogsMongoRepository
      : this.blogsPgSqlRepository;
  }
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const resultBoolean = await this.blogsRepository.deleteBlog(command.params);
    return resultBoolean;
  }
}
