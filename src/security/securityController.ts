import { Controller, Delete, Get, Req, Res } from '@nestjs/common';
import { Request, Response, Router } from 'express';
import { RefreshTokensMetaRepository } from 'src/refreshTokenMeta/refreshTokenMeta.repository';

export const securityRouter = Router({});

@Controller('security')
export class SecurityController {
  constructor(
    protected refreshTokensMetaRepository: RefreshTokensMetaRepository,
  ) {}
  @Get('/devices')
  async getAllUserDevices(@Res() res: Response, @Req() req: Request) {
    const devices = await this.refreshTokensMetaRepository.returnAllUserDevices(
      req.cookies.refreshToken,
    );
    if (!devices) {
      res.sendStatus(401);
      return;
    }
    res.status(200).send(devices);
    return;
  }
  @Delete('/devices')
  async deleteAllUserDevices(@Res() res: Response, @Req() req: Request) {
    const isDeleted =
      await this.refreshTokensMetaRepository.deleteAllUserDevices(
        req.cookies.refreshToken,
      );
    if (!isDeleted) {
      res.sendStatus(401);
      return;
    }
    res.sendStatus(204);
    return;
  }
  @Delete('/devices/:id')
  async deleteOneUserDevice(@Res() res: Response, @Req() req: Request) {
    const StatusCode =
      await this.refreshTokensMetaRepository.deleteOneUserDeviceAndReturnStatusCode(
        req.params.id,
        req.cookies.refreshToken,
      );
    res.sendStatus(StatusCode);
    return;
  }
}
