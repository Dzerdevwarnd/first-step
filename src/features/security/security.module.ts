import { RefreshTokensMetaModule } from '@app/src/features/refreshTokenMeta/refreshTokenMeta.module';
import { Module } from '@nestjs/common';
import { SecurityController } from './securityController';

@Module({
  imports: [RefreshTokensMetaModule],
  controllers: [SecurityController],
  exports: [],
})
export class SecurityModule {}
