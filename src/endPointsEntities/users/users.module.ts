import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenMetaEntity } from 'src/DBEntities/refreshTokenMeta/refreshToken.entity';
import { RefreshTokensMetaRepository } from 'src/DBEntities/refreshTokenMeta/refreshTokenMeta.repository';
import {
  RefreshTokenMeta,
  RefreshTokenMetaSchema,
} from 'src/DBEntities/refreshTokenMeta/refreshTokenMeta.scheme.types';
import { JwtService } from 'src/application/jwt/jwtService';
import { UsersController } from './users.controller';
import { UserEntity } from './users.entity';
import { User, UserSchema } from './users.mongo.scheme';
import { UsersService } from './users.service';
import { UsersMongoRepository } from './usersMongo.repository';
import { UsersPgSqlRepository } from './usersPgSql.Repository';
import { UsersTypeOrmRepository } from './usersTypeOrm.Repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenMetaEntity]),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshTokenMeta.name, schema: RefreshTokenMetaSchema },
    ]),
  ],
  providers: [
    UsersService,
    UsersPgSqlRepository,
    UsersMongoRepository,
    UsersTypeOrmRepository,
    RefreshTokensMetaRepository,
    JwtService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
