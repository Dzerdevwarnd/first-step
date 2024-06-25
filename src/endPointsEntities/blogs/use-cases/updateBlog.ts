import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPgSqlRepository } from '../blogs.PgSqlRepository';
import { BlogsMongoRepository } from '../blogs.mongoRepository';
import { BlogsTypeOrmRepository } from '../blogs.typeOrmRepository';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public body: { name: string; description: string; websiteUrl: string },
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
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
  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const resultBoolean = this.blogsRepository.updateBlog(
      command.id,
      command.body,
    );
    return resultBoolean;
  }
}
