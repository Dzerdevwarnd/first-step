import { Injectable } from '@nestjs/common';
import { add } from 'date-fns';
import { BlacklistRepository } from 'src/DBEntities/blacklistTokens/blacklistTokens.repository';
import { JwtService } from 'src/application/jwt/jwtService';
import { UsersRepository } from 'src/endPointsEntities/users/users.repository';
import { UsersService } from 'src/endPointsEntities/users/users.service';
import {
  UserDbType,
  userViewType,
} from 'src/endPointsEntities/users/users.types';
import { settings } from 'src/settings';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    protected jwtService: JwtService,
    protected usersService: UsersService,
    protected usersRepository: UsersRepository,
    protected blacklistRepository: BlacklistRepository,
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
    const userView = await this.usersRepository.createUser(newUser);
    return userView;
  }
  async addTokensInBlacklist(
    reqBody: { accessToken: string },
    reqCookies: { refreshToken: string },
  ) {
    const isAdded = await this.blacklistRepository.addTokensInBlacklist(
      reqBody,
      reqCookies,
    );
    return isAdded;
  }
}
////
