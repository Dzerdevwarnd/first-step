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
export class isEmailAlreadyInUseConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected usersService: UsersService) {}
  async validate(email: any, args: ValidationArguments) {
    const user = await this.usersService.findDBUser(email);
    if (user) {
      return false;
    }
    return true;
  }
}

export function isEmailAlreadyInUse(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: isEmailAlreadyInUseConstraint,
    });
  };
}
