import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsUrl, Length } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export class CreateBlogInputModelType {
  @Length(1, 15)
  name: string;
  @Length(1, 500)
  description: string;
  @Length(1, 100)
  @IsUrl()
  websiteUrl: string;
}

export class UpdateBlogInputModelType {
  @Length(1, 15)
  name: string;
  @Length(1, 500)
  description: string;
  @Length(1, 100)
  @IsUrl()
  websiteUrl: string;
}

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ default: true })
  isMembership: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

export type blogDBType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

export type blogViewType = {
  createdAt: Date;
  description: string;
  id: string;
  isMembership: boolean;
  name: string;
};

export type blogsPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: blogDBType[];
};
