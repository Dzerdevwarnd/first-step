import { BlacklistTokensService } from '@app/src/DBEntities/blacklistTokens/blacklistTokens.Service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AccessTokenAuthStrategy extends PassportStrategy(
  Strategy,
  'accessToken-strategy',
) {
  constructor(private blacklistTokensService: BlacklistTokensService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const tokenInBlackList =
      await this.blacklistTokensService.findTokenInBlacklist(payload.userId);
    if (tokenInBlackList) {
      throw new UnauthorizedException();
    }
    return { userId: payload.userId };
  }
}
