import { FindBlogByIdCommand } from '@app/src/features/blogs/use-cases/findBlogById';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: true })
@Injectable()
export class BlogExistValidationConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected commandBus: CommandBus) {}
  async validate(blogId: any, args: ValidationArguments) {
    const blog = await this.commandBus.execute(
      new FindBlogByIdCommand({ id: blogId }),
    );
    if (!blog) {
      return false;
    }
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    return 'Blog with this blogId isnt exist';
  }
}

export function blogExistValidation(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BlogExistValidationConstraint,
    });
  };
}
