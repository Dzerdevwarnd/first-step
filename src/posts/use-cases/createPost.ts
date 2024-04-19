import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../posts.repository';
import { postDBType, postViewType } from '../posts.types';

export class CreatePostCommand {
  constructor(
    public body: {
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
    },
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(protected postsRepository: PostsRepository) {}
  async execute(command: CreatePostCommand): Promise<postViewType> {
    const createdDate = new Date();
    const newPost: postDBType = {
      id: String(Date.now()),
      title: command.body.title,
      shortDescription: command.body.shortDescription,
      content: command.body.content,
      blogId: command.body.blogId,
      blogName: '',
      createdAt: createdDate,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    };
    const postDB = await this.postsRepository.createPost(newPost);
    const postView: postViewType = {
      id: newPost.id,
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
    return postView;
  }
}
