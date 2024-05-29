import { IsIn, Length, NotContains } from 'class-validator';
import { blogExistValidation } from 'src/validation/customValidators/BlogExist.validator';

export class CreatePostInputModelType {
  @Length(1, 30)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  title: string;
  @Length(1, 100)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  shortDescription: string;
  @Length(1, 1000)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  content: string;
  @Length(1, 100)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  @blogExistValidation()
  blogId: string;
}

export class CreatePostByBlogIdInputModelType {
  @NotContains('  ', { message: 'Property should not contain spaces' })
  @Length(1, 30)
  title: string;
  @NotContains('  ', { message: 'Property should not contain spaces' })
  @Length(1, 100)
  shortDescription: string;
  @NotContains('  ', { message: 'Property should not contain spaces' })
  @Length(1, 1000)
  content: string;
}

export class UpdatePostMongoInputModelType {
  @Length(1, 30)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  title: string;
  @Length(1, 100)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  shortDescription: string;
  @Length(1, 1000)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  content: string;
  @Length(1, 100)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  @blogExistValidation()
  blogId: string;
}

export class UpdatePostPgSqlInputModelType {
  @Length(1, 30)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  title: string;
  @Length(1, 100)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  shortDescription: string;
  @Length(1, 1000)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  content: string;
}

export class UpdatePostLikeStatusInputModelType {
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: string;
}

export class postDBType {
  public likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: Date,
  ) {
    this.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };
  }
}

export class postViewType {
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: any; //postLikeViewType[];
  };
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: Date,
  ) {
    this.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };
  }
}

export type postsByBlogIdPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: postViewType[];
};
