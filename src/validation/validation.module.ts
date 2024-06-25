import { Module } from '@nestjs/common';
import { BlogExistValidationConstraint } from './customValidators/BlogExist.validator';
import { IsEmailIsAlreadyConfirmedConstraint } from './customValidators/EmailIsAlreadyConfirmed.validator';
import { ConfirmationCodeValidationConstraint } from './customValidators/confCode.validator';
import { IsEmailExistInDBConstraint } from './customValidators/emailExistInDB.validator';
import { isEmailAlreadyInUseConstraint } from './customValidators/isEmailAlreadyInUse.validator';
import { jwtKeyValidationConstraint } from './customValidators/jwtKey.validator';
import { LoginAlreadyInUseConstraint } from './customValidators/loginInUse.validator';

const constraints = [
  ConfirmationCodeValidationConstraint,
  BlogExistValidationConstraint,
  IsEmailExistInDBConstraint,
  isEmailAlreadyInUseConstraint,
  IsEmailIsAlreadyConfirmedConstraint,
  jwtKeyValidationConstraint,
  LoginAlreadyInUseConstraint,
];

@Module({
  imports: [],
  providers: [...constraints],

  exports: [...constraints],
})
export class ValidationModule {}
//
