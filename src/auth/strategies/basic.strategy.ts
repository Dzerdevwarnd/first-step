import { settings } from '@app/src/settings';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  public validate = async (username, password): Promise<boolean> => {
    if (
      settings.basicAuthLogin === username &&
      settings.basicAuthPassword === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
