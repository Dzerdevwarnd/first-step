import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsModule } from '../features/blogs/blogs.module';
import { PostsModule } from '../features/posts/posts.module';
import { UsersModule } from '../features/users/users.module';
import { BlogExistValidationConstraint } from './customValidators/BlogExist.validator';
import { IsEmailIsAlreadyConfirmedConstraint } from './customValidators/EmailIsAlreadyConfirmed.validator';
import { ConfirmationCodeValidationConstraint } from './customValidators/confCode.validator';
import { IsEmailExistInDBConstraint } from './customValidators/emailExistInDB.validator';
import { isEmailAlreadyInUseConstraint } from './customValidators/isEmailAlreadyInUse.validator';
import { jwtKeyValidationConstraint } from './customValidators/jwtKey.validator';
import { LoginAlreadyInUseConstraint } from './customValidators/loginInUse.validator';

const constraints = [
  ConfirmationCodeValidationConstraint,
  BlogExistValidationConstraint,
  IsEmailExistInDBConstraint,
  isEmailAlreadyInUseConstraint,
  IsEmailIsAlreadyConfirmedConstraint,
  jwtKeyValidationConstraint,
  LoginAlreadyInUseConstraint,
];

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => BlogsModule),
    forwardRef(() => PostsModule),
    CqrsModule,
  ],
  providers: [...constraints],

  exports: [...constraints],
})
export class ValidationModule {}
//
