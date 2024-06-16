import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from 'src/application/jwt/jwtService';
import { settings } from 'src/settings';
import {
  RefreshTokenMeta,
  RefreshTokenMetaDocument,
  refreshTokensMetaTypeDB,
} from './refreshTokenMeta.scheme.types';

@Injectable()
export class RefreshTokensMetaMongoRepository {
  constructor(
    @InjectModel(RefreshTokenMeta.name)
    private refreshTokenMetaModel: Model<RefreshTokenMetaDocument>,
    protected jwtService: JwtService,
  ) {}
  async createRefreshTokenMeta(refreshTokenMeta: refreshTokensMetaTypeDB) {
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
  async returnAllUserDevices(UserId: string) {
    const devicesDB = await this.refreshTokenMetaModel
      .find({ userId: UserId })
      .lean();
    return devicesDB;
  }
  async deleteAllUserDevices(deviceId: string, userId: string) {
    const resultOfDelete = await this.refreshTokenMetaModel.deleteMany({
      deviceId: { $ne: deviceId },
      userId: userId,
    });
    return resultOfDelete.acknowledged;
  }
  async findRefreshTokenMetaByDeviceId(deviceId: string) {
    const requestRefreshTokensMeta = await this.refreshTokenMetaModel.findOne({
      deviceId: deviceId,
    });
    return requestRefreshTokensMeta;
  }

  async deleteRefreshTokenMetaByDeviceId(deviceId: string): Promise<boolean> {
    const resultOfDelete = await this.refreshTokenMetaModel.deleteOne({
      deviceId: deviceId,
    });
    return resultOfDelete.deletedCount === 1;
  }
}
