import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from 'src/application/jwt/jwtService';
import { UsersService } from 'src/endPointsEntities/users/users.service';
import { PostLikesService } from '../postLikes/postLikes.service';
import { PostsRepository } from '../posts.repository';
import { PostsService } from '../posts.service';

export class updatePostLikeStatusCommand {
  constructor(
    public id: string,
    public body: {
      likeStatus: string;
    },
    public accessToken: string,
  ) {}
}

@CommandHandler(updatePostLikeStatusCommand)
export class updatePostLikeStatusUseCase
  implements ICommandHandler<updatePostLikeStatusCommand>
{
  constructor(
    protected postsRepository: PostsRepository,
    protected jwtService: JwtService,
    protected postsService: PostsService,
    protected postLikesService: PostLikesService,
    protected usersService: UsersService,
  ) {}
  async execute(command: updatePostLikeStatusCommand): Promise<boolean> {
    const userId = await this.jwtService.verifyAndGetUserIdByToken(
      command.accessToken,
    );
    const id = command.id;
    const post = await this.postsService.findPost({ id }, userId);
    let likesCount = post!.extendedLikesInfo.likesCount;
    let dislikesCount = post!.extendedLikesInfo.dislikesCount;
    if (
      command.body.likeStatus === 'Like' &&
      post?.extendedLikesInfo.myStatus !== 'Like'
    ) {
      likesCount = +likesCount + 1;
      if (post?.extendedLikesInfo.myStatus === 'Dislike') {
        dislikesCount = +dislikesCount - 1;
      }
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    } else if (
      command.body.likeStatus === 'Dislike' &&
      post?.extendedLikesInfo.myStatus !== 'Dislike'
    ) {
      dislikesCount = +dislikesCount + 1;
      if (post?.extendedLikesInfo.myStatus === 'Like') {
        likesCount = +likesCount - 1;
      }
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    } else if (
      command.body.likeStatus === 'None' &&
      post?.extendedLikesInfo.myStatus === 'Like'
    ) {
      likesCount = likesCount - 1;
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    } else if (
      command.body.likeStatus === 'None' &&
      post?.extendedLikesInfo.myStatus === 'Dislike'
    ) {
      dislikesCount = dislikesCount - 1;
      this.postsRepository.updatePostLikesAndDislikesCount(
        id,
        likesCount,
        dislikesCount,
      );
    }
    const like = await this.postLikesService.findPostLikeFromUser(userId, id);
    const user = await this.usersService.findUser(userId);
    if (!like) {
      await this.postLikesService.addLikeToBdFromUser(
        userId,
        id,
        command.body.likeStatus,
        user?.accountData.login,
      );
      return true;
    } else {
      if (like.likeStatus === command.body.likeStatus) {
        return false;
      }
      this.postLikesService.updateUserLikeStatus(
        userId,
        id,
        command.body.likeStatus,
      );
      return true;
    }
  }
}
