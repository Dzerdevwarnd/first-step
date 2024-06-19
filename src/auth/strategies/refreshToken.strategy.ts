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
  private token: string | null = null;
  constructor(private blacklistTokensService: BlacklistTokensService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => this.extractJWT(req),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: settings.JWT_SECRET,
    });
  }

  private extractJWT(req: Request): string | null {
    if (
      req.cookies &&
      'refreshToken' in req.cookies &&
      req.cookies.refreshToken.length > 0
    ) {
      this.token = req.cookies.refreshToken;
      return req.cookies.refreshToken;
    }
    return null;
  }

  async validate(req: Request, payload: any) {
    const token = this.extractJWT(req);

    if (!token) {
      throw new UnauthorizedException('Token not found in cookies');
    }
    const tokenInBlackList =
      await this.blacklistTokensService.findTokenInBlacklist(token);
    if (tokenInBlackList) {
      throw new UnauthorizedException('Token found in blacklist');
    }

    return { deviceId: payload.deviceId };
  }
}
