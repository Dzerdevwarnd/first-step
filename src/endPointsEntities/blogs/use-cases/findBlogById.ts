import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';
import { blogViewType } from '../blogs.types';

export class FindBlogByIdCommand {
  constructor(public params: { id: string }) {}
}

@CommandHandler(FindBlogByIdCommand)
export class FindBlogByIdUseCase
  implements ICommandHandler<FindBlogByIdCommand>
{
  constructor(protected blogsRepository: BlogsRepository) {}
  async execute(command: FindBlogByIdCommand): Promise<blogViewType> {
    return this.blogsRepository.findBlog(command.params);
  }
}
