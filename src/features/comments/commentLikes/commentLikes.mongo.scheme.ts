import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentLikeDocument = HydratedDocument<CommentLike>;

@Schema()
export class CommentLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  commentId: string;

  @Prop({ required: true })
  likeStatus: string;
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
