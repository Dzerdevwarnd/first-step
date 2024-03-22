/* eslint-disable prefer-const */
import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BlacklistRepository } from 'src/blacklistTokens/blacklistTokens.repository';
import { EmailAdapter } from 'src/emailAdapter/emailAdapter';
import { JwtService } from 'src/jwt/jwtService';
import { RefreshTokensMetaRepository } from 'src/refreshTokenMeta/refreshTokenMeta.repository';
import { refreshTokensMetaTypeDB } from 'src/refreshTokenMeta/refreshTokenMeta.scheme.types';
import { settings } from 'src/settings';
import { UsersRepository } from 'src/users/users.repository';
import { UserDbType } from 'src/users/users.scheme.types';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    protected emailAdapter: EmailAdapter,
    protected authService: AuthService,
    protected jwtService: JwtService,
    protected usersService: UsersService,
    protected usersRepository: UsersRepository,
    protected blacklistRepository: BlacklistRepository,
    protected refreshTokenMetaRepository: RefreshTokensMetaRepository,
  ) {}
  @Get('/me')
  async getInformationAboutMe(
    @Query() query: { object },
    @Headers() headers: { authorization: string },
    @Res() res: Response,
  ) {
    if (!headers.authorization) {
      res.sendStatus(401);
      return;
    }
    const token = headers.authorization!.split(' ')[1];
    const userId = await this.jwtService.verifyAndGetUserIdByToken(token);
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    const user = await this.usersService.findUser(userId);
    const userInfo = {
      userId: userId,
      login: user!.accountData.login,
      email: user!.accountData.email,
    };
    res.status(200).send(userInfo);
    return;
  }

  @Post('/login')
  async userLogin(
    @Param() params: { id: string },
    @Ip() ip: string,
    @Headers() headers: { authorization: string },
    @Body()
    body: {
      loginOrEmail: string;
      password: string;
    },
    @Res() res: Response,
  ) {
    const deviceId = String(Date.now());
    const tokens = await this.authService.loginAndReturnJwtKeys(
      body.loginOrEmail,
      body.password,
      deviceId,
    );
    if (!tokens?.accessToken) {
      res.sendStatus(401);
      return;
    } else {
      const user = await this.usersRepository.findDBUser(body.loginOrEmail);
      const ipAddress =
        ip || headers['x-forwarded-for'] || headers['x-real-ip'];
      //req.socket.remoteAddress;
      const RefreshTokenMeta: refreshTokensMetaTypeDB = {
        userId: user!.id,
        deviceId: deviceId,
        title: headers['user-agent'] || 'unknown',
        ip: ipAddress,
        lastActiveDate: new Date(),
        expiredAt: new Date(Date.now() + +settings.refreshTokenLifeTime), //
      };
      const isCreated =
        await this.refreshTokenMetaRepository.createRefreshToken(
          RefreshTokenMeta,
        );
      if (!isCreated) {
        res.status(400).send('RefreshTokenMeta error');
        return;
      }
      res
        .cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: true,
        })
        .status(200)
        .send({ accessToken: tokens.accessToken });
      return;
    }
  }
  @Post('/refresh-token')
  async refreshAccessAndRefreshTokens(
    @Headers() headers: { authorization: string },
    @Req() req: Request,
    @Param() params: { id: string },
    @Body() body: { title: string; shortDescription: string; content: string },
    @Res() res: Response,
  ) {
    const tokenInBlackList =
      await this.blacklistRepository.findTokenInBlacklist(
        req.cookies.refreshToken,
      );
    if (tokenInBlackList) {
      res.sendStatus(401);
      return;
    }
    const userId: string | undefined =
      await this.usersService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    const user: UserDbType | null = await this.usersRepository.findUser(userId);
    if (!user) {
      res.sendStatus(401);
      return;
    }
    const deviceId = await this.jwtService.verifyAndGetDeviceIdByToken(
      req.cookies.refreshToken,
    );
    const tokens = await this.authService.refreshTokens(user!, deviceId);
    if (!tokens?.accessToken || !tokens.refreshToken) {
      res.sendStatus(401);
      return;
    }
    const isAdded = await this.blacklistRepository.addRefreshTokenInBlacklist(
      req.cookies,
    );
    if (!isAdded) {
      res.status(555).send('BlacklistError');
      return;
    }
    const ipAddress =
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress;
    const RefreshTokenMetaUpd = {
      lastActiveDate: new Date(),
      expiredAt: new Date(Date.now() + +settings.refreshTokenLifeTime),
    };
    const isUpdated =
      await this.refreshTokenMetaRepository.updateRefreshTokenMeta(
        deviceId,
        RefreshTokenMetaUpd,
      );
    if (!isUpdated) {
      res.status(400).send('RefreshTokenMeta error');
      return;
    }
    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .send({ accessToken: tokens.accessToken });
    return;
  }

  @Post('/logout')
  async logout(
    @Headers() headers: { authorization: string },
    @Req() req: Request,
    @Param() params: { id: string },
    @Body() body: { title: string; shortDescription: string; content: string },
    @Res() res: Response,
  ) {
    const tokenInBlackList =
      await this.blacklistRepository.findTokenInBlacklist(
        req.cookies.refreshToken,
      );
    if (tokenInBlackList) {
      res.sendStatus(401);
      return;
    }
    const userId = await this.usersService.getUserIdFromRefreshToken(
      req.cookies.refreshToken,
    );
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    const deviceId = await this.jwtService.verifyAndGetDeviceIdByToken(
      req.cookies.refreshToken,
    );
    const isDeletedFromRefreshTokenMeta =
      await this.refreshTokenMetaRepository.deleteOneUserDeviceAndReturnStatusCode(
        deviceId,
        req.cookies.refreshToken,
      );
    const isAddedToBlacklist =
      await this.blacklistRepository.addRefreshTokenInBlacklist({
        refreshToken: req.cookies.refreshToken,
      });
    if (!isAddedToBlacklist) {
      res.sendStatus(555);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }

  @Post('/registration')
  async registration(
    @Headers() headers: { authorization: string },
    @Req() req: Request,
    @Param() params: { id: string },
    @Body() body: { title: string; shortDescription: string; content: string },
    @Res() res: Response,
  ) {
    const newUser = await this.authService.createUser(
      req.body.password,
      req.body.email,
      req.body.login,
    );
    if (!newUser) {
      res.status(400).send('User create error');
      return;
    }
    await this.emailAdapter.sendConfirmEmail(req.body.email);
    res.sendStatus(204);
    return;
  }

  @Post('/registration-confirmation')
  async registrationConfirmation(
    @Headers() headers: { authorization: string },
    @Req() req: Request,
    @Param() params: { id: string },
    @Body() body: { title: string; shortDescription: string; content: string },
    @Res() res: Response,
  ) {
    const isConfirmationAccept =
      await this.usersService.userEmailConfirmationAccept(req.body.code);
    if (!isConfirmationAccept) {
      res.status(400).send('user confirm error');
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }

  @Post('/registration-email-resending')
  async registrationEmailResending(
    @Headers() headers: { authorization: string },
    @Req() req: Request,
    @Param() params: { id: string },
    @Body() body: { title: string; shortDescription: string; content: string },
    @Res() res: Response,
  ) {
    await this.usersRepository.userConfirmationCodeUpdate(req.body.email);
    await this.emailAdapter.sendConfirmEmail(req.body.email);
    res.sendStatus(204);
    return;
  }

  @Post('/password-recovery')
  async passwordRecovery(
    @Headers() headers: { authorization: string },
    @Req() req: Request,
    @Param() params: { id: string },
    @Body() body: { title: string; shortDescription: string; content: string },
    @Res() res: Response,
  ) {
    const recoveryCode = await this.jwtService.createRecoveryCode(
      req.body.email,
    );
    console.log(recoveryCode);
    await this.emailAdapter.sendRecoveryCode(req.body.email, recoveryCode);
    const result = await this.usersService.updateRecoveryCode(
      req.body.email,
      recoveryCode,
    );
    //Ошибка на случай неудачного поиска и обновления данных пользователя
    /*if (!result) {
			res.sendStatus(999)
			return
		}*/
    res.sendStatus(204);
    return;
  }

  @Post('/new-password')
  async newPassword(
    @Headers() headers: { authorization: string },
    @Req() req: Request,
    @Param() params: { id: string },
    @Body() body: { title: string; shortDescription: string; content: string },
    @Res() res: Response,
  ) {
    const resultOfUpdate = await this.usersService.updateUserPassword(
      req.body.recoveryCode,
      req.body.newPassword,
    );
    //Ошибка на случай неудачного поиска и/или обновления данных пользователя
    /*if (!resultOfUpdate) {
			res.sendStatus(999)
			return
		}*/
    res.sendStatus(204);
    return;
  }
}
