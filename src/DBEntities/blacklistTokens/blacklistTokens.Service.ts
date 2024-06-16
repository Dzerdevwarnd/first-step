import { Injectable } from '@nestjs/common';
import { settings } from 'src/settings';
import { BlacklistTokensMongoRepository } from './blacklistTokens.MongoRepository';
import { BlacklistTokensTypeOrmRepository } from './blacklistTokens.TypeOrmRepository';
import { TokenDBType } from './blacklistTokens.scheme.types';

@Injectable()
export class BlacklistTokensService {
  private blacklistTokensRepository;
  constructor(
    protected blacklistTokensMongoRepository: BlacklistTokensMongoRepository,
    protected blacklistTokensTypeOrmRepository: BlacklistTokensTypeOrmRepository,
  ) {
    this.blacklistTokensRepository = this.getBlacklistTokensRepository();
  }

  private getBlacklistTokensRepository() {
    const repositories = {
      Mongo: this.blacklistTokensMongoRepository,
      TypeOrm: this.blacklistTokensTypeOrmRepository,
    };
    return (
      repositories[process.env.REPOSITORY] ||
      this.blacklistTokensMongoRepository
    );
  }

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

    const resultBoolean =
      await this.blacklistTokensRepository.addTokensInBlacklist([
        accessTokenDB,
        refreshTokenDB,
      ]);

    return resultBoolean;
  }

  async addRefreshTokenInBlacklist(cookies): Promise<boolean> {
    const refreshTokenDB = {
      token: cookies.refreshToken,
      expireDate: new Date( //@ts-expect-error type error
        Date.now() + parseInt(settings.refreshTokenLifeTime.match(/\d+/)),
      ),
    };
    const resultBoolean =
      await this.blacklistTokensRepository.addRefreshTokenInBlacklist(
        refreshTokenDB,
      );

    return resultBoolean;
  }
  async findTokenInBlacklist(refreshToken: string): Promise<TokenDBType> {
    const TokenInBlackList =
      await this.blacklistTokensRepository.findTokenInBlacklist({
        token: refreshToken,
      });

    return TokenInBlackList;
  }
}
