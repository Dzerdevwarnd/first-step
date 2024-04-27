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
export class LoginAlreadyInUseConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected usersMongoRepository: UsersMongoRepository) {}
  async validate(login: any, args: ValidationArguments) {
    const user = await this.usersMongoRepository.findDBUser(login);
    if (user) {
      return false;
    }
    return true;
  }
}

export function LoginAlreadyInUse(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: LoginAlreadyInUseConstraint,
    });
  };
}
