import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsMongoRepository } from '../blogs.mongoRepository';
import { BlogsPgSqlRepository } from '../blogs.postgreRepository';
import { blogsPaginationType } from '../blogs.types';

export class ReturnBlogsWithPaginationCommand {
  constructor(public query: string) {}
}

@CommandHandler(ReturnBlogsWithPaginationCommand)
export class ReturnBlogsWithPaginationUseCase
  implements ICommandHandler<ReturnBlogsWithPaginationCommand>
{
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
  async execute(
    command: ReturnBlogsWithPaginationCommand,
  ): Promise<blogsPaginationType> {
    return this.blogsRepository.returnBlogsWithPagination(command.query);
  }
}
