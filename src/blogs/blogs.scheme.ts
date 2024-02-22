import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<BlogDBType>;

@Schema()
export class BlogDBType {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  description: string;
  @Prop()
  websiteUrl: string;
  @Prop()
  createdAt: Date;
  @Prop()
  isMembership: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(BlogDBType);
