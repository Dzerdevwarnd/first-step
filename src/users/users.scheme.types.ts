import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  id: string;

  @Prop()
  accountData: {
    login: { type: string; required: true };
    email: { type: string; required: true };
    createdAt: { type: Date; required: true };
    passwordSalt: { type: string; required: true };
    passwordHash: { type: string; required: true };
    recoveryCode: { type: string; default: '' };
  };

  @Prop({ required: true })
  emailConfirmationData: {
    confirmationCode: { type: string; required: true };
    expirationDate: { type: Date; required: true };
    isConfirmed: { type: boolean; required: true };
  };
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
