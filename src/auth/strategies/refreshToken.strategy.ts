import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BlacklistRepository } from 'src/DBEntities/blacklistTokens/blacklistTokens.repository';
import { settings } from 'src/settings';

@Injectable()
export class RefreshTokenAuthStrategy extends PassportStrategy(
  Strategy,
  'refreshToken-strategy',
) {
  constructor(private blacklistRepository: BlacklistRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenAuthStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: settings.JWT_SECRET,
    });
  }

  private static extractJWT(req: Request): string | null {
    if (
      req.cookies &&
      'refreshToken' in req.cookies &&
      req.cookies.refreshToken.length > 0
    ) {
      return req.cookies.refreshToken;
    }
    return null;
  }

  async validate(payload: any) {
    const tokenInBlackList =
      await this.blacklistRepository.findTokenInBlacklist('');
    if (tokenInBlackList) {
      throw new UnauthorizedException();
    }
    return { deviceId: payload.deviceId };
  }
}
