import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

export interface NestedObject {
  likesCount: { type: number; default: 0 };
  dislikesCount: { type: number; default: 0 };
}

@Schema()
export class Post {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ default: '' })
  blogName: string;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ required: true })
  likesInfo: {
    likesCount: { type: number; default: 0 };
    dislikesCount: { type: number; default: 0 };
  };
}

export const PostSchema = SchemaFactory.createForClass(Post);

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
    newestLikes: postLikeViewType[];
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
