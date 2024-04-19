import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';

export class DeleteBlogCommand {
  constructor(public params: { id: string }) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const resultBoolean = await this.blogsRepository.deleteBlog(command.params);
    return resultBoolean;
  }
}
