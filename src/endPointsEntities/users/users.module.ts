import { RefreshTokensMetaModule } from '@app/src/DBEntities/refreshTokenMeta/refreshTokenMeta.module';
import { myJwtModule } from '@app/src/application/jwt/jwt.module';
import { BasicAuthGuard } from '@app/src/auth/guards/basic.auth.guard';
import { PostsModule } from '@app/src/posts/posts.module';
import { ValidationModule } from '@app/src/validation/validation.module';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaUsersController } from '../sa/sa.users.controller';
import { UsersController } from './users.controller';
import { UserEntity } from './users.entity';
import { User, UserSchema } from './users.mongo.scheme';
import { UsersService } from './users.service';
import { UsersMongoRepository } from './usersMongo.repository';
import { UsersPgSqlRepository } from './usersPgSql.Repository';
import { UsersTypeOrmRepository } from './usersTypeOrm.Repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RefreshTokensMetaModule,
    myJwtModule,
    forwardRef(() => ValidationModule),
    forwardRef(() => PostsModule),
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
