import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from 'src/jwt/jwtService';
import { settings } from 'src/settings';
import {
  RefreshTokenMeta,
  RefreshTokenMetaDocument,
  refreshTokensMetaTypeDB,
} from './refreshTokenMeta.scheme.types';

@Injectable()
export class RefreshTokensMetaRepository {
  constructor(
    @InjectModel(RefreshTokenMeta.name)
    private refreshTokenMetaModel: Model<RefreshTokenMetaDocument>,
    protected jwtService: JwtService,
  ) {}
  async createRefreshToken(refreshTokenMeta: refreshTokensMetaTypeDB) {
    const expireDate = new Date( //@ts-expect-error Argument of type 'RegExpMatchArray' is not assignable to parameter of type 'string'.ts(2345)
      Date.now() + parseInt(settings.refreshTokenLifeTime.match(/\d+/)),
    );
    const result =
      await this.refreshTokenMetaModel.insertMany(refreshTokenMeta);

    setTimeout(
      () =>
        this.refreshTokenMetaModel.deleteOne({
          deviceId: refreshTokenMeta.deviceId,
        }),
      parseInt(settings.refreshTokenLifeTime),
    );

    return result.length == 1;
  }
  async updateRefreshTokenMeta(
    deviceId: string,
    refreshTokenMetaUpd: { lastActiveDate: Date; expiredAt: Date },
  ) {
    const result = await this.refreshTokenMetaModel.updateOne(
      { deviceId: deviceId },
      {
        $set: {
          lastActiveDate: refreshTokenMetaUpd.lastActiveDate,
          expiredAt: refreshTokenMetaUpd.expiredAt,
        },
      },
    );
    return result.matchedCount === 1;
  }
  async findUserIdByDeviceId(deviceId: string) {
    const refreshTokenMeta = await this.refreshTokenMetaModel.findOne({
      deviceId: deviceId,
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
    const devicesDB = await this.refreshTokenMetaModel
      .find({ userId: UserId })
      .lean();
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
    const UserId = await this.findUserIdByDeviceId(deviceId);
    const resultOfDelete = await this.refreshTokenMetaModel.deleteMany({
      deviceId: { $ne: deviceId },
      userId: UserId,
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
