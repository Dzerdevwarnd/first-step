import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class CommentatorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}
export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

@Schema()
export class LikesInfo {
  @Prop({ default: '0' })
  likesCount: number;

  @Prop({ default: '0' })
  dislikesCount: number;
}
export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

@Schema()
export class Comment {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ required: true, type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true, type: LikesInfoSchema })
  likesInfo: LikesInfo;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

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
