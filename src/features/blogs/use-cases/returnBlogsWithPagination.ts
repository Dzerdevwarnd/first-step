import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPgSqlRepository } from '../blogs.PgSqlRepository';
import { BlogsMongoRepository } from '../blogs.mongoRepository';
import { BlogsTypeOrmRepository } from '../blogs.typeOrmRepository';
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
    protected blogsTypeOrmRepository: BlogsTypeOrmRepository,
  ) {
    this.blogsRepository = this.getBlogsRepository();
  }

  private getBlogsRepository() {
    const repositories = {
      Mongo: this.blogsMongoRepository,
      PgSql: this.blogsPgSqlRepository,
      TypeOrm: this.blogsTypeOrmRepository,
    };

    return repositories[process.env.REPOSITORY] || this.blogsMongoRepository;
  }
  async execute(
    command: ReturnBlogsWithPaginationCommand,
  ): Promise<blogsPaginationType> {
    return this.blogsRepository.returnBlogsWithPagination(command.query);
  }
}
