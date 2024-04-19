import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLikesService } from '../postLikes/postLikes.service';
import { Post, PostDocument } from '../posts.mongo.scheme';
import { PostsRepository } from '../posts.repository';
import { postViewType } from '../posts.types';

export class FindPostCommand {
  constructor(
    public params: { id: string },
    public userId: string,
  ) {}
}

@CommandHandler(FindPostCommand)
export class FindPostUseCase implements ICommandHandler<FindPostCommand> {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    protected postsRepository: PostsRepository,
    protected postLikesService: PostLikesService,
  ) {}
  async execute(command: FindPostCommand): Promise<postViewType | null> {
    const foundPost = await this.postsRepository.findPost(command.params);
    if (!foundPost) {
      return null;
    }
    const like = await this.postLikesService.findPostLikeFromUser(
      command.userId,
      command.params.id,
    );
    const last3DBLikes = await this.postLikesService.findLast3Likes(
      foundPost.id,
    );
    const postView = {
      title: foundPost.title,
      id: foundPost.id,
      content: foundPost.content,
      shortDescription: foundPost.shortDescription,
      blogId: foundPost.blogId,
      blogName: foundPost.blogName,
      createdAt: foundPost.createdAt,
      extendedLikesInfo: {
        likesCount: foundPost.likesInfo.likesCount,
        dislikesCount: foundPost.likesInfo.dislikesCount,
        myStatus: like?.likeStatus || 'None',
        newestLikes: last3DBLikes || [],
      },
    };
    return postView;
  }
}
