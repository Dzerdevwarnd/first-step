import { RefreshTokenMetaEntity } from '@app/src/DBEntities/refreshTokenMeta/refreshTokenMeta.entity';
import { RefreshTokensMetaModule } from '@app/src/DBEntities/refreshTokenMeta/refreshTokenMeta.module';
import { myJwtModule } from '@app/src/application/jwt/jwt.module';
import { BasicAuthGuard } from '@app/src/auth/guards/basic.auth.guard';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaUsersController } from '../sa/sa.users.controllet';
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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RefreshTokensMetaModule,
    myJwtModule,
  ],
  providers: [
    UsersService,
    UsersPgSqlRepository,
    UsersMongoRepository,
    UsersTypeOrmRepository,
    BasicAuthGuard,
  ],
  controllers: [UsersController, SaUsersController],
  exports: [
    UsersService,
    UsersPgSqlRepository,
    UsersMongoRepository,
    UsersTypeOrmRepository,
    BasicAuthGuard,
  ],
})
export class UsersModule {}
//
