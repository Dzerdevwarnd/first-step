import { Injectable } from '@nestjs/common';
import { JwtService } from 'src/application/jwt/jwtService';
import { settings } from 'src/settings';
import { RefreshTokensMetaMongoRepository } from './refreshTokenMeta.MongoRepository';
import { RefreshTokensMetaTypeOrmRepository } from './refreshTokenMeta.TypeOrmRepository';
import { refreshTokensMetaTypeDB } from './refreshTokenMeta.scheme.types';

@Injectable()
export class RefreshTokensMetaService {
  private refreshTokensMetaRepository;
  constructor(
    protected refreshTokensMetaMongoRepository: RefreshTokensMetaMongoRepository,
    protected refreshTokensMetaTypeOrmRepository: RefreshTokensMetaTypeOrmRepository,
    protected jwtService: JwtService,
  ) {
    this.refreshTokensMetaRepository = this.getRefreshTokensMetaRepository();
  }

  private getRefreshTokensMetaRepository() {
    const repositories = {
      Mongo: this.refreshTokensMetaMongoRepository,
      TypeOrm: this.refreshTokensMetaTypeOrmRepository,
    };
    return (
      repositories[process.env.REPOSITORY] ||
      this.refreshTokensMetaMongoRepository
    );
  }

  async createRefreshTokenMeta(userId, deviceId, title, ip) {
    const refreshTokenMeta: refreshTokensMetaTypeDB = {
      userId: userId,
      deviceId: deviceId,
      title: title,
      ip: ip,
      lastActiveDate: new Date(),
      expiredAt: new Date(Date.now() + +settings.refreshTokenLifeTime),
    };

    const result =
      await this.refreshTokensMetaRepository.createRefreshTokenMeta(
        refreshTokenMeta,
      );

    return result === true;
  }
  async updateRefreshTokenMeta(
    deviceId: string,
    refreshTokenMetaUpd: { lastActiveDate: Date; expiredAt: Date },
  ) {
    const result =
      await this.refreshTokensMetaRepository.updateRefreshTokenMeta(
        deviceId,
        refreshTokenMetaUpd,
      );
    return result === true;
  }
  async findUserIdByDeviceId(deviceId: string) {
    const userId =
      await this.refreshTokensMetaRepository.findUserIdByDeviceId(deviceId);
    return userId;
  }
  async returnAllUserDevices(refreshToken: string) {
    const deviceId =
      await this.jwtService.verifyAndGetDeviceIdByToken(refreshToken);
    if (!deviceId) {
      return;
    }
    const UserId = await this.findUserIdByDeviceId(deviceId);
    const devicesDB =
      await this.refreshTokensMetaRepository.returnAllUserDevices(UserId);
    const devicesView = [];
    for (let i = 0; i < devicesDB.length; i++) {
      const deviceView = {
        ip: devicesDB[i].ip,
        title: devicesDB[i].title,
        deviceId: devicesDB[i].deviceId,
        lastActiveDate: devicesDB[i].lastActiveDate,
      };
      devicesView.push(deviceView);
    }
    return devicesView;
  }
  async deleteAllUserDevices(refreshToken: string) {
    const deviceId =
      await this.jwtService.verifyAndGetDeviceIdByToken(refreshToken);
    if (!deviceId) {
      return;
    }
    const userId = await this.findUserIdByDeviceId(deviceId);
    const resultOfDelete =
      await this.refreshTokensMetaRepository.deleteAllUserDevices({
        deviceId,
        userId,
      });
    return resultOfDelete.acknowledged;
  }

  async deleteOneUserDeviceAndReturnStatusCode(
    requestDeviceId: string,
    refreshToken: string,
  ) {
    const existingUser = this.findUserIdByDeviceId(requestDeviceId);
    if (!existingUser) {
      return 404;
    }
    const deviceId =
      await this.jwtService.verifyAndGetDeviceIdByToken(refreshToken);
    if (!deviceId) {
      return 401;
    }
    const requestRefreshTokensMeta =
      await this.refreshTokensMetaRepository.findRefreshTokenMetaByDeviceId(
        deviceId,
      );
    if (!requestRefreshTokensMeta) {
      return 404;
    }
    const userIdOwner = await this.findUserIdByDeviceId(requestDeviceId);
    if (userIdOwner !== requestRefreshTokensMeta?.userId) {
      return 403;
    }
    const booleanResultOfDelete =
      await this.refreshTokensMetaRepository.deleteRefreshTokenMetaByDeviceId(
        deviceId,
      );
    if (booleanResultOfDelete === false) {
      return 404;
    }
    return 204;
  }
}
