import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { myJwtModule } from 'src/application/jwt/jwt.module';
import { RefreshTokensMetaMongoRepository } from './refreshTokenMeta.MongoRepository';
import { RefreshTokensMetaTypeOrmRepository } from './refreshTokenMeta.TypeOrmRepository';
import { RefreshTokenMetaEntity } from './refreshTokenMeta.entity';
import {
  RefreshTokenMeta,
  RefreshTokenMetaSchema,
} from './refreshTokenMeta.scheme.types';
import { RefreshTokensMetaService } from './refreshTokenMeta.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenMetaEntity]),
    MongooseModule.forFeature([
      { name: RefreshTokenMeta.name, schema: RefreshTokenMetaSchema },
    ]),
    myJwtModule,
  ],
  providers: [
    RefreshTokensMetaService,
    RefreshTokensMetaMongoRepository,
    RefreshTokensMetaTypeOrmRepository,
  ],
  exports: [
    RefreshTokensMetaService,
    RefreshTokensMetaTypeOrmRepository,
    RefreshTokensMetaMongoRepository,
  ],
})
export class RefreshTokensMetaModule {}
