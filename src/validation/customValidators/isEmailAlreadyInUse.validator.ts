import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { UsersMongoRepository } from 'src/endPointsEntities/users/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class isEmailAlreadyInUseConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected usersMongoRepository: UsersMongoRepository) {}
  async validate(email: any, args: ValidationArguments) {
    const user = await this.usersMongoRepository.findDBUser(email);
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
