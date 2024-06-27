import { isEmailAlreadyInUse } from '@app/src/validation/customValidators/isEmailAlreadyInUse.validator';
import { LoginAlreadyInUse } from '@app/src/validation/customValidators/loginInUse.validator';
import { IsEmail, Length } from 'class-validator';

export class CreateUserInputModelType {
  @LoginAlreadyInUse({ message: 'Email is already in use' })
  @Length(3, 10)
  login: string;

  @Length(6, 20)
  password: string;

  @IsEmail()
  @isEmailAlreadyInUse({ message: 'Email is already in use' })
  email: string;
}

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
