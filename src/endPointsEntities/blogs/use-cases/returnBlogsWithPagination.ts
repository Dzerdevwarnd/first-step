import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';
import { blogsPaginationType } from '../blogs.types';

export class ReturnBlogsWithPaginationCommand {
  constructor(public query: string) {}
}

@CommandHandler(ReturnBlogsWithPaginationCommand)
export class ReturnBlogsWithPaginationUseCase
  implements ICommandHandler<ReturnBlogsWithPaginationCommand>
{
  constructor(protected blogsRepository: BlogsRepository) {}
  async execute(
    command: ReturnBlogsWithPaginationCommand,
  ): Promise<blogsPaginationType> {
    return this.blogsRepository.returnBlogsWithPagination(command.query);
  }
}
