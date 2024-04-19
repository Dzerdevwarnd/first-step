import { JwtService } from '@nestjs/jwt';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { settings } from 'src/settings';

@ValidatorConstraint({ async: true })
export class jwtKeyValidationConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected jwtService: JwtService) {}
  async validate(recoveryCode: any, args: ValidationArguments) {
    try {
      const result = await this.jwtService.verifyAsync(recoveryCode, {
        secret: settings.JWT_SECRET,
      });
    } catch (error) {
      return false;
    }
    return true;
  }
}

export function jwtKeyValidation(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: jwtKeyValidationConstraint,
    });
  };
}
//
