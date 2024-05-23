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
export class IsEmailIsAlreadyConfirmedConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected usersService: UsersService) {}
  async validate(email: any, args: ValidationArguments) {
    const user: any = await this.usersService.findDBUser(email);
    const isConfirmed =
      user?.emailConfirmationData?.isConfirmed || user?.isConfirmed;
    if (isConfirmed === true) {
      return false;
    }
    return true;
  }
}

export function IsEmailIsAlreadyConfirmed(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailIsAlreadyConfirmedConstraint,
    });
  };
}
