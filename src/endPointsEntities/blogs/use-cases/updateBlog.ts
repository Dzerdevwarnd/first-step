import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public body: { name: string; description: string; websiteUrl: string },
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}
  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const resultBoolean = this.blogsRepository.updateBlog(
      command.id,
      command.body,
    );
    return resultBoolean;
  }
}
