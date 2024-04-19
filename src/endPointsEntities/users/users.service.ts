import { Injectable } from '@nestjs/common';
import { add } from 'date-fns';
import { RefreshTokensMetaRepository } from 'src/DBEntities/refreshTokenMeta/refreshTokenMeta.repository';
import { JwtService } from 'src/application/jwt/jwtService';
import { PostsRepository } from 'src/posts/posts.repository';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from './users.repository';
import { UserDbType, userViewType, usersPaginationType } from './users.types';
import bcrypt = require('bcrypt');
///
@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
    protected jwtService: JwtService,
    protected refreshTokensMetaRepository: RefreshTokensMetaRepository,
  ) {}
  async findUser(id: string): Promise<UserDbType | null> {
    const user = await this.usersRepository.findUser(id);
    return user;
  }
  async returnUsersWithPagination(query: any): Promise<usersPaginationType> {
    return await this.usersRepository.returnUsersWithPagination(query);
  }
  async createUser(body: {
    login: string;
    password: string;
    email: string;
  }): Promise<userViewType> {
    const passwordSalt = await this.generateSalt();
    const passwordHash = await this.generateHash(body.password, passwordSalt);
    const createdDate = new Date();
    const newUser: UserDbType = {
      id: String(Date.now()),
      accountData: {
        login: body.login,
        email: body.email,
        createdAt: createdDate,
        passwordSalt: passwordSalt,
        passwordHash: passwordHash,
      },
      emailConfirmationData: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
        isConfirmed: true,
      },
    };
    const userView = await this.usersRepository.createUser(newUser);
    return userView;
  }
  async deleteUser(params: { id: string }): Promise<boolean> {
    const resultBoolean = await this.usersRepository.deleteUser(params);
    return resultBoolean;
  }
  async generateHash(password: string, passwordSalt: string) {
    const hash = await bcrypt.hash(password, passwordSalt);
    return hash;
  }
  async generateSalt() {
    const salt = await bcrypt.genSalt(10);
    return salt;
  }
  async checkCredentialsAndReturnUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDbType | undefined> {
    const user = await this.usersRepository.findDBUser(loginOrEmail);
    if (!user) {
      return undefined;
    }
    if (
      user.accountData.passwordHash !==
      (await this.generateHash(password, user.accountData.passwordSalt))
    ) {
      return undefined;
    } else {
      return user;
    }
  }
  async userEmailConfirmationAccept(confirmationCode: any): Promise<boolean> {
    const isConfirmationAccept =
      await this.usersRepository.userEmailConfirmationAccept(confirmationCode);
    return isConfirmationAccept;
  }
  async findDBUserByConfirmationCode(confirmationCode: any) {
    const user =
      await this.usersRepository.findDBUserByConfirmationCode(confirmationCode);
    return user;
  }
  async getUserIdFromRefreshToken(
    refreshToken: string,
  ): Promise<string | undefined> {
    const deviceId =
      await this.jwtService.verifyAndGetDeviceIdByToken(refreshToken);
    const userId =
      this.refreshTokensMetaRepository.findUserIdByDeviceId(deviceId);
    return userId;
  }

  async updateRecoveryCode(
    email: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const result = await this.usersRepository.updateRecoveryCode(
      email,
      recoveryCode,
    );
    return result;
  }
  async updateUserPassword(
    recoveryCode: string,
    newPassword: string,
  ): Promise<boolean> {
    const passwordSalt = await this.generateSalt();
    const passwordHash = await this.generateHash(newPassword, passwordSalt);
    const result = await this.usersRepository.updateUserSaltAndHash(
      recoveryCode,
      passwordSalt,
      passwordHash,
    );
    return result;
  }
}
