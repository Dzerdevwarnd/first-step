import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../posts.repository';

export class updatePostCommand {
  constructor(
    public id: string,
    public body: {
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
    },
  ) {}
}

@CommandHandler(updatePostCommand)
export class updatePostUseCase implements ICommandHandler<updatePostCommand> {
  constructor(protected postsRepository: PostsRepository) {}
  async execute(command: updatePostCommand): Promise<boolean> {
    const resultBoolean = this.postsRepository.updatePost(
      command.id,
      command.body,
    );
    return resultBoolean;
  }
}
