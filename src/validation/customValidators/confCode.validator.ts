import { UsersService } from '@app/src/features/users/users.service';
import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: true })
@Injectable()
export class ConfirmationCodeValidationConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected usersService: UsersService) {}
  async validate(code: any, args: ValidationArguments) {
    const user = await this.usersService.findDBUserByConfirmationCode(code);
    if (!user) {
      return false;
    }
    const expirationDate =
      user.emailConfirmationData?.expirationDate || user.expirationDate;
    if (new Date() > expirationDate) {
      return false;
    }
    const isConfirmed =
      user.emailConfirmationData?.isConfirmed || user.isConfirmed;
    if (isConfirmed === true) {
      return false;
    }
    return true;
  }
}

export function confirmationCodeValidation(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ConfirmationCodeValidationConstraint,
    });
  };
}
