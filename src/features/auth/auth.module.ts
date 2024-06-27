import { BlacklistTokensModule } from '@app/src/features/blacklistTokens/blacklistTokens.module';
import { RefreshTokensMetaModule } from '@app/src/features/refreshTokenMeta/refreshTokenMeta.module';
import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { EmailAdapter } from '../../application/emailAdapter/emailAdapter';
import { myJwtModule } from '../../application/jwt/jwt.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenAuthStrategy } from './strategies/accessToken.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenAuthStrategy } from './strategies/refreshToken.strategy';

const strategies = [
  BasicStrategy,
  LocalStrategy,
  AccessTokenAuthStrategy,
  RefreshTokenAuthStrategy,
];

@Module({
  imports: [
    PassportModule,
    RefreshTokensMetaModule,
    BlacklistTokensModule,
    UsersModule,
    myJwtModule,
    forwardRef(() => PostsModule),
  ],
  providers: [...strategies, EmailAdapter, AuthService],
  controllers: [AuthController],
  exports: [...strategies, EmailAdapter, AuthService],
})
export class AuthModule {}
