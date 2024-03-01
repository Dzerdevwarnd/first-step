import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class AccountData {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  passwordSalt: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: '' })
  recoveryCode: string;
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);

@Schema()
export class EmailConfirmationData {
  @Prop({ required: true })
  confirmationCode: string;
  @Prop({ required: true })
  expirationDate: Date;
  @Prop({ required: true })
  isConfirmed: boolean;
}

export const EmailConfirmationDataSchema = SchemaFactory.createForClass(
  EmailConfirmationData,
);

@Schema()
export class User {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, type: AccountDataSchema })
  accountData: AccountData;

  @Prop({ required: true, type: EmailConfirmationDataSchema })
  emailConfirmationData: EmailConfirmationData;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type userViewType = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export type UserDbType = {
  id: string;
  accountData: {
    login: string;
    email: string;
    createdAt: Date;
    passwordSalt: string;
    passwordHash: string;
    recoveryCode?: string;
  };
  emailConfirmationData: {
    confirmationCode: any;
    expirationDate: Date;
    isConfirmed: boolean;
  };
};

export type usersPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: userViewType[];
};
