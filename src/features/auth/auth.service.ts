import { BlacklistTokensService } from '@app/src/features/blacklistTokens/blacklistTokens.Service';
import { UsersService } from '@app/src/features/users/users.service';
import { UserDbType, userViewType } from '@app/src/features/users/users.types';

import { settings } from '@app/src/settings';
import { Injectable } from '@nestjs/common';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from './jwt/jwtService';

@Injectable()
export class AuthService {
  constructor(
    protected jwtService: JwtService,
    protected usersService: UsersService,

    protected blacklistTokensService: BlacklistTokensService,
  ) {}
  async validateUser(loginOrEmail: string, password: string) {
    const user = await this.usersService.checkCredentialsAndReturnUser(
      loginOrEmail,
      password,
    );
    if (!user) {
      return null;
    } else {
      return user;
    }
  }

  async loginAndReturnJwtKeys(
    loginOrEmail: string,
    password: string,
    deviceId: string,
  ) {
    const user = await this.usersService.checkCredentialsAndReturnUser(
      loginOrEmail,
      password,
    );
    if (!user) {
      return;
    } else {
      const accessToken = await this.jwtService.createAccessToken(
        user,
        settings.accessTokenLifeTime,
      );
      const refreshToken = await this.jwtService.createRefreshToken(
        deviceId,
        settings.refreshTokenLifeTime,
      );
      return { accessToken: accessToken, refreshToken: refreshToken };
    }
  }
  async refreshTokens(user: UserDbType, deviceId: string) {
    const accessToken = await this.jwtService.createAccessToken(
      user,
      settings.accessTokenLifeTime,
    );
    const refreshToken = await this.jwtService.createRefreshToken(
      deviceId,
      settings.refreshTokenLifeTime,
    );
    return { accessToken: accessToken, refreshToken: refreshToken };
  }
  async createUser(
    password: string,
    email: string,
    login: string,
  ): Promise<userViewType> {
    const passwordSalt = await this.usersService.generateSalt();
    const passwordHash = await this.usersService.generateHash(
      password,
      passwordSalt,
    );
    const createdDate = new Date();
    const newUser: UserDbType = {
      id: String(Date.now()),
      accountData: {
        login: login,
        email: email,
        createdAt: createdDate,
        passwordSalt: passwordSalt,
        passwordHash: passwordHash,
      },
      emailConfirmationData: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
        isConfirmed: false,
      },
    };
    const userView = await this.usersService.createUser({
      login,
      password,
      email,
    });
    return userView;
  }
  async addTokensInBlacklist(
    reqBody: { accessToken: string },
    reqCookies: { refreshToken: string },
  ) {
    const isAdded = await this.blacklistTokensService.addTokensInBlacklist(
      reqBody,
      reqCookies,
    );
    return isAdded;
  }
}
////
