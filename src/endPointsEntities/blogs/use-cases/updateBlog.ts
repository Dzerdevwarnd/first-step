import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsMongoRepository } from '../blogs.mongoRepository';
import { BlogsPgSqlRepository } from '../blogs.postgreRepository';

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
  ) {
    this.blogsRepository = this.getUsersRepository();
  }

  private getUsersRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.blogsMongoRepository
      : this.blogsPgSqlRepository;
  }
  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const resultBoolean = this.blogsRepository.updateBlog(
      command.id,
      command.body,
    );
    return resultBoolean;
  }
}
