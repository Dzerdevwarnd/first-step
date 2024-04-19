import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class LikesInfo {
  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

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
  @Prop({ required: true, type: LikesInfoSchema })
  likesInfo: LikesInfo;
}

export const PostSchema = SchemaFactory.createForClass(Post);
