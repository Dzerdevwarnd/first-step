import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistTokensMongoRepository } from './blacklistTokens.MongoRepository';
import { BlacklistTokensService } from './blacklistTokens.Service';
import { BlacklistTokensTypeOrmRepository } from './blacklistTokens.TypeOrmRepository';
import { BlackListTokenEntity } from './blacklistTokens.entitiy';
import {
  BlacklistToken,
  BlacklistTokenSchema,
} from './blacklistTokens.scheme.types';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlackListTokenEntity]),
    MongooseModule.forFeature([
      { name: BlacklistToken.name, schema: BlacklistTokenSchema },
    ]),
  ],
  providers: [
    BlacklistTokensService,
    BlacklistTokensMongoRepository,
    BlacklistTokensTypeOrmRepository,
  ],
  exports: [
    BlacklistTokensService,
    BlacklistTokensMongoRepository,
    BlacklistTokensTypeOrmRepository,
  ],
})
export class BlacklistTokensModule {}
//
