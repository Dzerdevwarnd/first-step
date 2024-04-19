import { Injectable } from '@nestjs/common';
import { JwtService as JwtNestService } from '@nestjs/jwt';
import { UserDbType } from 'src/endPointsEntities/users/users.types';
import { settings } from 'src/settings';

@Injectable()
export class JwtService {
  constructor(private jwtNestService: JwtNestService) {}
  async createAccessToken(user: UserDbType, expirationTime: string) {
    const AccessToken = this.jwtNestService.sign(
      { userId: user.id },
      { expiresIn: expirationTime },
    );
    return AccessToken;
  }
  async createRefreshToken(deviceId: string, expirationTime: string) {
    const RefreshToken = this.jwtNestService.sign(
      { deviceId: deviceId },
      { expiresIn: expirationTime },
    );
    return RefreshToken;
  }
  async verifyAndGetUserIdByToken(token: string) {
    try {
      const result: any = await this.jwtNestService.verify(token);
      return result.userId;
    } catch (error) {
      return;
    }
  }
  async verifyAndGetDeviceIdByToken(token: string) {
    try {
      const result: any = await this.jwtNestService.verify(token);
      return result.deviceId;
    } catch (error) {
      return;
    }
  }
  async createRecoveryCode(email: string) {
    const RecoveryCode = await this.jwtNestService.sign(
      { email: email },
      { expiresIn: settings.recoveryCodeLifeTime },
    );

    return RecoveryCode;
  }
  async verifyJwtToken(token: string) {
    try {
      const result: any = await this.jwtNestService.verify(token);
      return true;
    } catch (error) {
      return;
    }
  }
}
