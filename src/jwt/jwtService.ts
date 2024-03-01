import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { settings } from 'src/settings';
import { UserDbType } from 'src/users/users.scheme.types';

@Injectable()
export class JwtService {
  async createAccessToken(user: UserDbType, expirationTime: string) {
    const AccessToken = jwt.sign({ userId: user.id }, settings.JWT_SECRET, {
      expiresIn: expirationTime,
    });
    return AccessToken;
  }
  async createRefreshToken(deviceId: string, expirationTime: string) {
    const RefreshToken = jwt.sign({ deviceId: deviceId }, settings.JWT_SECRET, {
      expiresIn: expirationTime,
    });
    return RefreshToken;
  }
  async verifyAndGetUserIdByToken(token: string) {
    try {
      const result: any = await jwt.verify(token, settings.JWT_SECRET);
      return result.userId;
    } catch (error) {
      return;
    }
  }
  async verifyAndGetDeviceIdByToken(token: string) {
    try {
      const result: any = await jwt.verify(token, settings.JWT_SECRET);
      return result.deviceId;
    } catch (error) {
      return;
    }
  }
  async createRecoveryCode(email: string) {
    const RecoveryCode = await jwt.sign({ email: email }, settings.JWT_SECRET, {
      expiresIn: settings.recoveryCodeLifeTime,
    });

    return RecoveryCode;
  }
  async verifyJwtToken(token: string) {
    try {
      const result: any = await jwt.verify(token, settings.JWT_SECRET);
      return true;
    } catch (error) {
      return;
    }
  }
}
