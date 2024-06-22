import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from './jwtService';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || '123',
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class myJwtModule {}
//
