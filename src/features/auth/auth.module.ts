import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailAdapter } from '../../application/emailAdapter/emailAdapter';
import { BlacklistTokensMongoRepository } from '../blacklistTokens/blacklistTokens.MongoRepository';
import { BlacklistTokensService } from '../blacklistTokens/blacklistTokens.Service';
import { BlacklistTokensTypeOrmRepository } from '../blacklistTokens/blacklistTokens.TypeOrmRepository';
import { BlackListTokenEntity } from '../blacklistTokens/blacklistTokens.entitiy';
import {
  BlacklistToken,
  BlacklistTokenSchema,
} from '../blacklistTokens/blacklistTokens.scheme.types';
import { RefreshTokensMetaMongoRepository } from '../refreshTokenMeta/refreshTokenMeta.MongoRepository';
import { RefreshTokensMetaTypeOrmRepository } from '../refreshTokenMeta/refreshTokenMeta.TypeOrmRepository';
import { RefreshTokenMetaEntity } from '../refreshTokenMeta/refreshTokenMeta.entity';
import {
  RefreshTokenMeta,
  RefreshTokenMetaSchema,
} from '../refreshTokenMeta/refreshTokenMeta.scheme.types';
import { RefreshTokensMetaService } from '../refreshTokenMeta/refreshTokenMeta.service';
import { SecurityController } from '../security/securityController';
import { isEmailAlreadyInUseConstraint } from '../users/customValidators/isEmailAlreadyInUse.validator';
import { LoginAlreadyInUseConstraint } from '../users/customValidators/loginInUse.validator';
import { SaUsersController } from '../users/sa.users.controller';
import { UsersController } from '../users/users.controller';
import { UserEntity } from '../users/users.entity';
import { User, UserSchema } from '../users/users.mongo.scheme';
import { UsersService } from '../users/users.service';
import { UsersMongoRepository } from '../users/usersMongo.repository';
import { UsersPgSqlRepository } from '../users/usersPgSql.Repository';
import { UsersTypeOrmRepository } from '../users/usersTypeOrm.Repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IsEmailIsAlreadyConfirmedConstraint } from './customValidators/EmailIsAlreadyConfirmed.validator';
import { ConfirmationCodeValidationConstraint } from './customValidators/confCode.validator';
import { IsEmailExistInDBConstraint } from './customValidators/emailExistInDB.validator';
import { jwtKeyValidationConstraint } from './customValidators/jwtKey.validator';
import { BasicAuthGuard } from './guards/basic.auth.guard';
import { JwtService } from './jwt/jwtService';
import { AccessTokenAuthStrategy } from './strategies/accessToken.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenAuthStrategy } from './strategies/refreshToken.strategy';

const customValidators = [
  isEmailAlreadyInUseConstraint,
  LoginAlreadyInUseConstraint,
  ConfirmationCodeValidationConstraint,
  IsEmailExistInDBConstraint,
  IsEmailIsAlreadyConfirmedConstraint,
  jwtKeyValidationConstraint,
];
const strategies = [
  BasicStrategy,
  LocalStrategy,
  AccessTokenAuthStrategy,
  RefreshTokenAuthStrategy,
];

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || '123',
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      RefreshTokenMetaEntity,
      BlackListTokenEntity,
    ]),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshTokenMeta.name, schema: RefreshTokenMetaSchema },
      { name: BlacklistToken.name, schema: BlacklistTokenSchema },
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    SaUsersController,
    SecurityController,
  ],
  providers: [
    ...strategies,
    ...customValidators,
    EmailAdapter,
    AuthService,
    JwtService,
    UsersService,
    UsersPgSqlRepository,
    UsersMongoRepository,
    UsersTypeOrmRepository,
    BasicAuthGuard,
    RefreshTokensMetaService,
    RefreshTokensMetaMongoRepository,
    RefreshTokensMetaTypeOrmRepository,
    BlacklistTokensService,
    BlacklistTokensMongoRepository,
    BlacklistTokensTypeOrmRepository,
  ],
  exports: [
    ...strategies,
    EmailAdapter,
    AuthService,
    JwtService,
    UsersService,
    RefreshTokensMetaService,
    BlacklistTokensService,
  ],
})
export class AuthModule {}
