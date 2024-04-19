import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';
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
  constructor(protected blogsRepository: BlogsRepository) {}
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
