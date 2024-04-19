import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BlacklistRepository } from 'src/DBEntities/blacklistTokens/blacklistTokens.repository';
import { settings } from 'src/settings';

@Injectable()
export class AccessTokenAuthStrategy extends PassportStrategy(
  Strategy,
  'accessToken-strategy',
) {
  constructor(private blacklistRepository: BlacklistRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: settings.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const tokenInBlackList =
      await this.blacklistRepository.findTokenInBlacklist(payload.userId);
    if (tokenInBlackList) {
      throw new UnauthorizedException();
    }
    return { userId: payload.userId };
  }
}
