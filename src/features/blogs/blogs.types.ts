import { IsUrl, Length, NotContains } from 'class-validator';

export class CreateBlogInputModelType {
  @NotContains('  ', { message: 'Property should not contain spaces' })
  @Length(1, 15)
  name: string;
  @Length(1, 500)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  description: string;
  @NotContains('  ', { message: 'Property should not contain spaces' })
  @Length(1, 100, { each: true })
  @IsUrl()
  websiteUrl: string;
}

export class UpdateBlogInputModelType {
  @Length(1, 15)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  name: string;
  @Length(1, 500)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  description: string;
  @Length(1, 100)
  @NotContains('  ', { message: 'Property should not contain spaces' })
  @IsUrl()
  websiteUrl: string;
}

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
