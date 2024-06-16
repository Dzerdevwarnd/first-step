import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { settings } from 'src/settings';
import {
  BlacklistToken,
  BlacklistTokenDocument,
  TokenDBType,
} from './blacklistTokens.scheme.types';

@Injectable()
export class BlacklistTokensMongoRepository {
  constructor(
    @InjectModel(BlacklistToken.name)
    private blacklistTokenModel: Model<BlacklistTokenDocument>,
  ) {}
  async addTokensInBlacklist(
    tokens: Array<{ token: string; expireDate: Date }>,
  ): Promise<boolean> {
    const result = await this.blacklistTokenModel.insertMany(tokens);

    setTimeout(
      () => this.blacklistTokenModel.deleteMany(tokens),
      parseInt(settings.accessTokenLifeTime),
    );

    return result.length == tokens.length;
  }

  async addRefreshTokenInBlacklist(refreshTokenDB): Promise<boolean> {
    const result = await this.blacklistTokenModel.insertMany(refreshTokenDB);

    setTimeout(
      () => this.blacklistTokenModel.deleteOne({ token: refreshTokenDB.token }),
      parseInt(settings.refreshTokenLifeTime),
    );
    return result.length == 1;
  }
  async findTokenInBlacklist(refreshToken: string): Promise<TokenDBType> {
    const TokenInBlackList = await this.blacklistTokenModel.findOne({
      token: refreshToken,
    });

    return TokenInBlackList;
  }
}
