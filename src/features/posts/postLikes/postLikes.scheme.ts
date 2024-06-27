import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostLikeDocument = HydratedDocument<PostLike>;

@Schema()
export class PostLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  likeStatus: string;
  @Prop({ default: '' })
  login: string;

  @Prop({ required: true })
  addedAt: Date;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
