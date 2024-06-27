import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlackListTokenEntity } from './blacklistTokens.entitiy';

@Injectable()
export class BlacklistTokensTypeOrmRepository {
  constructor(
    @InjectRepository(BlackListTokenEntity)
    private readonly blacklistTokenRepository: Repository<BlackListTokenEntity>,
  ) {}

  async addTokensInBlacklist(
    tokens: Array<{ token: string; expireDate: Date }>,
  ): Promise<boolean> {
    const tokenEntities = tokens.map((token) =>
      this.blacklistTokenRepository.create(token),
    );
    const result = await this.blacklistTokenRepository.save(tokenEntities);

    tokens.forEach((token) => {
      const timeToExpire = token.expireDate.getTime() - Date.now();
      setTimeout(
        () => this.blacklistTokenRepository.delete({ token: token.token }),
        timeToExpire,
      );
    });

    return result.length === tokens.length;
  }

  async addRefreshTokenInBlacklist(refreshTokenDB: {
    token: string;
    expireDate: Date;
  }): Promise<boolean> {
    const tokenEntity = this.blacklistTokenRepository.create(refreshTokenDB);
    const result = await this.blacklistTokenRepository.save(tokenEntity);

    const timeToExpire = refreshTokenDB.expireDate.getTime() - Date.now();
    setTimeout(
      () =>
        this.blacklistTokenRepository.delete({ token: refreshTokenDB.token }),
      timeToExpire,
    );

    return !!result;
  }

  async findTokenInBlacklist(tokenObject: {
    token: string;
  }): Promise<BlackListTokenEntity | undefined> {
    return this.blacklistTokenRepository.findOne({
      where: { token: tokenObject.token },
    });
  }
}
