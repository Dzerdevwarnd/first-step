import { IsEmail, Length } from 'class-validator';
import { IsEmailIsAlreadyConfirmed } from './customValidators/EmailIsAlreadyConfirmed.validator';
import { confirmationCodeValidation } from './customValidators/confCode.validator';
import { IsEmailExistInDB } from './customValidators/emailExistInDB.validator';
import { jwtKeyValidation } from './customValidators/jwtKey.validator';

export class EmailInputModelType {
  @IsEmail()
  @Length(1, 100)
  email: string;
}

export class EmailResendingModelType {
  @IsEmail()
  @IsEmailExistInDB({
    message: 'Email is dont exist',
  })
  @IsEmailIsAlreadyConfirmed({
    message: 'Email is already confirmed',
  })
  @Length(1, 100, {
    message: 'Email is already confirmed',
  })
  // @isEmailAlreadyInUse({ message: 'Email is already in use' })
  email: string;
}

export class NewPasswordWithRecoveryCodeInputModelType {
  @IsEmail()
  @Length(1, 100)
  email: string;
}

export class confirmationCodeType {
  @confirmationCodeValidation({
    message: 'Confirmation code is invalid, or expired, or already confirmed.',
  })
  code: string;
}

export class RecoveryCodeAndNewPasswordType {
  @Length(6, 20)
  newPassword: string;

  @jwtKeyValidation({
    message: 'invalid jwt key.',
  })
  recoveryCode: string;
}
