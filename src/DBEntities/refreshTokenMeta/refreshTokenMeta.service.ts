import { Injectable } from '@nestjs/common';
import { JwtService } from 'src/application/jwt/jwtService';
import { settings } from 'src/settings';
import { refreshTokensMetaTypeDB } from './refreshTokenMeta.scheme.types';

@Injectable()
export class RefreshTokensMetaMongoRepository {
  private refreshTokensMetaRepository;
  constructor(
    protected refreshTokensMetaMongoRepository: RefreshTokensMetaMongoRepository,

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

    return result.length === true;
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
    return result.matchedCount === 1;
  }
  async findUserIdByDeviceId(deviceId: string) {
    const refreshTokenMeta =
      await this.refreshTokensMetaRepository.findUserIdByDeviceId({
        deviceId,
      });
    const userId = refreshTokenMeta?.userId;
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
    const resultOfDelete = await this.refreshTokensMetaRepository.deleteMany({
      deviceId,
      userId,
    });
    return resultOfDelete.acknowledged;
  }
  async deleteOneUserDeviceAndReturnStatusCode(
    requestDeviceId: string,
    refreshToken: string,
  ) {
    const deviceId =
      await this.jwtService.verifyAndGetDeviceIdByToken(refreshToken);
    if (!deviceId) {
      return 401;
    }
    const requestRefreshTokensMeta = await this.refreshTokenMetaModel.findOne({
      deviceId: requestDeviceId,
    });
    if (!requestRefreshTokensMeta) {
      return 404;
    }
    const userId = await this.findUserIdByDeviceId(deviceId);
    if (userId !== requestRefreshTokensMeta?.userId) {
      return 403;
    }
    const resultOfDelete = await this.refreshTokenMetaModel.deleteOne({
      deviceId: requestDeviceId,
    });
    if (resultOfDelete.deletedCount === 0) {
      return 404;
    }
    return 204;
  }
}
