import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { UsersMongoRepository } from 'src/endPointsEntities/users/usersMongo.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailIsAlreadyConfirmedConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected userRepository: UsersMongoRepository) {}
  async validate(email: any, args: ValidationArguments) {
    const user = await this.userRepository.findDBUser(email);
    if (user?.emailConfirmationData.isConfirmed === true) {
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
