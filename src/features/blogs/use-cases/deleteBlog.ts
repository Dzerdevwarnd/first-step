import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPgSqlRepository } from '../blogs.PgSqlRepository';
import { BlogsMongoRepository } from '../blogs.mongoRepository';
import { BlogsTypeOrmRepository } from '../blogs.typeOrmRepository';

export class DeleteBlogCommand {
  constructor(public params: { id: string }) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
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
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const resultBoolean = await this.blogsRepository.deleteBlog(command.params);
    return resultBoolean;
  }
}
