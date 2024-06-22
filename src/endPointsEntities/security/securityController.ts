import { RefreshTokenAuthGuard } from '@app/src/auth/guards/refreshToken.auth.guard';
import { RefreshTokensMetaService } from '@app/src/DBEntities/refreshTokenMeta/refreshTokenMeta.service';
import {
  Controller,
  Delete,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

//export const securityRouter = Router({});
@UseGuards(RefreshTokenAuthGuard)
@Controller('security')
export class SecurityController {
  constructor(protected RefreshTokensMetaService: RefreshTokensMetaService) {}
  @Get('/devices')
  async getAllUserDevices(@Res() res: Response, @Req() req: Request) {
    const devices = await this.RefreshTokensMetaService.returnAllUserDevices(
      req.cookies.refreshToken,
    );
    if (!devices) {
      res.sendStatus(401);
      return;
    }
    res.status(200).send(devices);
    return;
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Delete('/devices')
  async deleteAllUserDevices(@Res() res: Response, @Req() req: Request) {
    const isDeleted = await this.RefreshTokensMetaService.deleteAllUserDevices(
      req.cookies.refreshToken,
    );
    if (!isDeleted) {
      res.sendStatus(401);
      return;
    }
    res.sendStatus(204);
    return;
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Delete('/devices/:id')
  async deleteOneUserDevice(
    @Res() res: Response,
    @Req() req: Request,
    @Param() params: { id: string },
  ) {
    const StatusCode =
      await this.RefreshTokensMetaService.deleteOneUserDeviceAndReturnStatusCode(
        req.params.id,
        req.cookies.refreshToken,
      );
    res.sendStatus(StatusCode);
    return;
  }
}
