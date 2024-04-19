import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../posts.repository';

export class deletePostCommand {
  constructor(public params: { id: string }) {}
}

@CommandHandler(deletePostCommand)
export class deletePostUseCase implements ICommandHandler<deletePostCommand> {
  constructor(protected postsRepository: PostsRepository) {}
  async execute(command: deletePostCommand): Promise<boolean> {
    const resultBoolean = this.postsRepository.deletePost(command.params);
    return resultBoolean;
  }
}
