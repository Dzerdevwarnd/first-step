import { Module } from '@nestjs/common';
import { RefreshTokensMetaModule } from 'src/DBEntities/refreshTokenMeta/refreshTokenMeta.module';
import { SecurityController } from './securityController';

@Module({
  imports: [RefreshTokensMetaModule],
  controllers: [SecurityController],
  exports: [],
})
export class SecurityModule {}
