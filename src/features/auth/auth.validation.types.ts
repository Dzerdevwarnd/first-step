import { confirmationCodeValidation } from '@app/src/validation/customValidators/confCode.validator';

import { IsEmailIsAlreadyConfirmed } from '@app/src/validation/customValidators/EmailIsAlreadyConfirmed.validator';
import { IsEmailExistInDB } from '@app/src/validation/customValidators/emailExistInDB.validator';
import { jwtKeyValidation } from '@app/src/validation/customValidators/jwtKey.validator';
import { IsEmail, Length } from 'class-validator';

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
