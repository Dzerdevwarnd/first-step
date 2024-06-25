import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPgSqlRepository } from '../blogs.PgSqlRepository';
import { BlogsMongoRepository } from '../blogs.mongoRepository';
import { BlogsTypeOrmRepository } from '../blogs.typeOrmRepository';
import { blogViewType } from '../blogs.types';

export class FindBlogByIdCommand {
  constructor(public params: { id: string }) {}
}

@CommandHandler(FindBlogByIdCommand)
export class FindBlogByIdUseCase
  implements ICommandHandler<FindBlogByIdCommand>
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
  async execute(command: FindBlogByIdCommand): Promise<blogViewType> {
    return this.blogsRepository.findBlog(command.params);
  }
}
