import { UsersService } from '@app/src/features/users/users.service';
import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsEmailExistInDB', async: true })
@Injectable()
export class IsEmailExistInDBConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected usersService: UsersService) {}
  async validate(email: any, args: ValidationArguments) {
    const user = await this.usersService.findDBUser(email);
    if (!user) {
      return false;
    }
    return true;
  }
}

export function IsEmailExistInDB(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailExistInDBConstraint,
    });
  };
}
