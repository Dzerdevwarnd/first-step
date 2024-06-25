import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPgSqlRepository } from '../blogs.PgSqlRepository';
import { BlogsMongoRepository } from '../blogs.mongoRepository';
import { BlogsTypeOrmRepository } from '../blogs.typeOrmRepository';
import {
  CreateBlogInputModelType,
  blogDBType,
  blogViewType,
} from '../blogs.types';

export class PostBlogCommand {
  constructor(public body: CreateBlogInputModelType) {}
}

@CommandHandler(PostBlogCommand)
export class PostBlogUseCase implements ICommandHandler<PostBlogCommand> {
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
  async execute(command: PostBlogCommand): Promise<blogViewType> {
    const createdDate = new Date();
    const newBlog: blogDBType = {
      id: String(Date.now()),
      name: command.body.name,
      description: command.body.description,
      websiteUrl: command.body.websiteUrl,
      createdAt: createdDate,
      isMembership: false,
    };
    const newBlogWithout_id = this.blogsRepository.createBlog(newBlog);
    return newBlogWithout_id;
  }
}
