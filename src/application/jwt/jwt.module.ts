import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { settings } from 'src/settings';
import { JwtService } from './jwtService';

@Module({
  imports: [
    JwtModule.register({
      secret: settings.JWT_SECRET,
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class myJwtModule {}
//
