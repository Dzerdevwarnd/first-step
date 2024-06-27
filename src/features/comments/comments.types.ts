import { IsIn, Length } from 'class-validator';

export class CommentCreateInputModelType {
  @Length(20, 300)
  content: string;
}

export class CommentUpdateInputModelType {
  @Length(20, 300)
  content: string;
}

export class UpdateCommentLikeStatusInputModelType {
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: string;
}

export class CommentViewType {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public createdAt: Date,
    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
    },
  ) {}
}

export class CommentDBType {
  public likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
  constructor(
    //public _id: ObjectId,
    public id: string,
    public postId: string,
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public createdAt: Date,
  ) {
    this.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };
  }
}

export class CommentsPaginationType {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,
    public items: CommentViewType[],
  ) {}
}
