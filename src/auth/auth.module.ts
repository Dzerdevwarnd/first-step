import { BlacklistTokensModule } from '@app/src/DBEntities/blacklistTokens/blacklistTokens.module';
import { RefreshTokensMetaModule } from '@app/src/DBEntities/refreshTokenMeta/refreshTokenMeta.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './strategies/basic.strategy';

const strategies = [
  BasicStrategy,
  /* LocalStrategy,
  AccessTokenAuthStrategy,
  RefreshTokenAuthStrategy, */
];

@Module({
  imports: [PassportModule, RefreshTokensMetaModule, BlacklistTokensModule],
  providers: [...strategies],
  controllers: [],
  exports: [...strategies],
})
export class AuthModule {}
