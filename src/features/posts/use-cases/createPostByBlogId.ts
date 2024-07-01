import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPgSqlRepository } from '../posts.PgSqlRepository';
import { PostsTypeOrmRepository } from '../posts.TypeOrm.repository';
import { PostsMongoRepository } from '../posts.mongoRepository';
import { postDBType, postViewType } from '../posts.types';

export class createPostByBlogIdCommand {
  constructor(
    public body: {
      title: string;
      shortDescription: string;
      content: string;
    },
    public id: string,
  ) {}
}

@CommandHandler(createPostByBlogIdCommand)
export class createPostByBlogIdUseCase
  implements ICommandHandler<createPostByBlogIdCommand>
{
  private postsRepository;
  constructor(
    protected postsMongoRepository: PostsMongoRepository,
    protected postsPgSqlRepository: PostsPgSqlRepository,
    protected postsTypeOrmRepository: PostsTypeOrmRepository,
  ) {
    this.postsRepository = this.getPostsRepository();
  }

  private getPostsRepository() {
    const repositories = {
      Mongo: this.postsMongoRepository,
      PgSql: this.postsPgSqlRepository,
      TypeOrm: this.postsTypeOrmRepository,
    };

    return repositories[process.env.REPOSITORY] || this.postsMongoRepository;
  }
  async execute(command: createPostByBlogIdCommand): Promise<postViewType> {
    const createdDate = new Date();
    const newPost: postDBType = {
      id: String(Date.now()),
      title: command.body.title,
      shortDescription: command.body.shortDescription,
      content: command.body.content,
      blogId: command.id,
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
