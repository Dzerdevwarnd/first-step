import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BlacklistTokensModule } from 'src/DBEntities/blacklistTokens/blacklistTokens.module';
import { RefreshTokensMetaModule } from 'src/DBEntities/refreshTokenMeta/refreshTokenMeta.module';
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
