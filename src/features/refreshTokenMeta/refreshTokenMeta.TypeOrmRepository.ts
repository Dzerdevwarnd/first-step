import { settings } from '@app/src/settings';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { JwtService } from '../auth/jwt/jwtService';
import { RefreshTokenMetaEntity } from './refreshTokenMeta.entity';

@Injectable()
export class RefreshTokensMetaTypeOrmRepository {
  constructor(
    @InjectRepository(RefreshTokenMetaEntity)
    private readonly refreshTokenMetaRepository: Repository<RefreshTokenMetaEntity>,
    protected jwtService: JwtService,
  ) {}

  async createRefreshTokenMeta(
    refreshTokenMeta: Partial<RefreshTokenMetaEntity>,
  ): Promise<boolean> {
    const result = await this.refreshTokenMetaRepository.save(refreshTokenMeta);

    setTimeout(async () => {
      await this.refreshTokenMetaRepository.delete({
        deviceId: refreshTokenMeta.deviceId,
      });
    }, parseInt(settings.refreshTokenLifeTime));

    return !!result;
  }

  async updateRefreshTokenMeta(
    deviceId: string,
    refreshTokenMetaUpd: { lastActiveDate: Date; expiredAt: Date },
  ): Promise<boolean> {
    const result = await this.refreshTokenMetaRepository.update(
      { deviceId: deviceId },
      refreshTokenMetaUpd,
    );
    return result.affected === 1;
  }

  async findUserIdByDeviceId(deviceId: string): Promise<string | undefined> {
    const refreshTokenMeta = await this.refreshTokenMetaRepository.findOne({
      where: { deviceId: deviceId },
    });
    return refreshTokenMeta?.userId;
  }

  async returnAllUserDevices(
    userId: string,
  ): Promise<RefreshTokenMetaEntity[]> {
    return await this.refreshTokenMetaRepository.find({
      where: { userId: userId },
    });
  }

  async deleteAllUserDevices(deviceIdAndUserId: {
    deviceId: string;
    userId: string;
  }): Promise<boolean> {
    const resultOfDelete = await this.refreshTokenMetaRepository.delete({
      userId: deviceIdAndUserId.userId,
      deviceId: Not(deviceIdAndUserId.deviceId),
    });
    return resultOfDelete.affected > 0;
  }

  async findRefreshTokenMetaByDeviceId(
    deviceId: string,
  ): Promise<RefreshTokenMetaEntity | undefined> {
    return await this.refreshTokenMetaRepository.findOne({
      where: { deviceId: deviceId },
    });
  }

  async deleteRefreshTokenMetaByDeviceId(deviceId: string): Promise<boolean> {
    const resultOfDelete = await this.refreshTokenMetaRepository.delete({
      deviceId: deviceId,
    });
    return resultOfDelete.affected === 1;
  }
}
