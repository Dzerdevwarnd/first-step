import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ required: true })
  commentatorInfo: {
    type: {
      userId: { type: string; required: true };
      userLogin: { type: string; required: true };
    };
    required: true;
  };
  @Prop({ required: true })
  likesInfo: {
    type: {
      likesCount: { type: number; required: true; default: '0' };
      dislikesCount: { type: number; required: true; default: '0' };
    };
    required: true;
  };
}

export const PostSchema = SchemaFactory.createForClass(Post);

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
    public _id: ObjectId,
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
