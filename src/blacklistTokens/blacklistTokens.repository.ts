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
export class BlacklistRepository {
  constructor(
    @InjectModel(BlacklistToken.name)
    private blacklistTokenModel: Model<BlacklistTokenDocument>,
  ) {}
  async addTokensInBlacklist(
    reqBody: { accessToken: string },
    reqCookies: { refreshToken: string },
  ): Promise<boolean> {
    const accessTokenDB = {
      token: reqBody.accessToken,
      expireDate: new Date( //@ts-expect-error type error
        Date.now() + parseInt(settings.accessTokenLifeTime.match(/\d+/)),
      ),
    };
    const refreshTokenDB = {
      token: reqCookies.refreshToken,
      expireDate: new Date( //@ts-expect-error type error
        Date.now() + parseInt(settings.refreshTokenLifeTime.match(/\d+/)),
      ),
    };

    const result = await this.blacklistTokenModel.insertMany([
      accessTokenDB,
      refreshTokenDB,
    ]);

    setTimeout(
      () => this.blacklistTokenModel.deleteOne({ token: accessTokenDB.token }),
      parseInt(settings.accessTokenLifeTime),
    );

    setTimeout(
      () => this.blacklistTokenModel.deleteOne({ token: refreshTokenDB.token }),
      parseInt(settings.refreshTokenLifeTime),
    );
    return result.length == 2;
  }

  async addRefreshTokenInBlacklist(cookies: {
    refreshToken: string;
  }): Promise<boolean> {
    const refreshTokenDB = {
      token: cookies.refreshToken,
      expireDate: new Date( //@ts-expect-error type error
        Date.now() + parseInt(settings.refreshTokenLifeTime.match(/\d+/)),
      ),
    };

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
