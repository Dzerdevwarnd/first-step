import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { UsersService } from 'src/endPointsEntities/users/users.service';

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
    if (new Date() > user.emailConfirmationData.expirationDate) {
      return false;
    }
    if (user?.emailConfirmationData.isConfirmed === true) {
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
