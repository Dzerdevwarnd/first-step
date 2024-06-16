import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BlacklistTokensService } from 'src/DBEntities/blacklistTokens/blacklistTokens.Service';
import { settings } from 'src/settings';

@Injectable()
export class RefreshTokenAuthStrategy extends PassportStrategy(
  Strategy,
  'refreshToken-strategy',
) {
  constructor(private blacklistTokensService: BlacklistTokensService) {
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
      await this.blacklistTokensService.findTokenInBlacklist('');
    if (tokenInBlackList) {
      throw new UnauthorizedException();
    }
    return { deviceId: payload.deviceId };
  }
}
