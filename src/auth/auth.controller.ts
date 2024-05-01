/* eslint-disable prefer-const */
import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BlacklistRepository } from 'src/DBEntities/blacklistTokens/blacklistTokens.repository';
import { RefreshTokensMetaRepository } from 'src/DBEntities/refreshTokenMeta/refreshTokenMeta.repository';

import { ThrottlerGuard } from '@nestjs/throttler';
import { EmailAdapter } from 'src/application/emailAdapter/emailAdapter';
import { JwtService } from 'src/application/jwt/jwtService';
import { UsersMongoRepository } from 'src/endPointsEntities/users/users.repository';
import { UsersService } from 'src/endPointsEntities/users/users.service';
import {
  CreateUserInputModelType,
  UserDbType,
} from 'src/endPointsEntities/users/users.types';
import { settings } from 'src/settings';
import { AuthService } from './auth.service';
import {
  EmailInputModelType,
  EmailResendingModelType,
  RecoveryCodeAndNewPasswordType,
  confirmationCodeType,
} from './auth.validation.types';
import { AccessTokenAuthGuard } from './guards/accessToken.auth.guard';
import { LocalAuthGuard } from './guards/local.auth.guard';
import { RefreshTokenAuthGuard } from './guards/refreshToken.auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    protected emailAdapter: EmailAdapter,
    protected authService: AuthService,
    protected jwtService: JwtService,
    protected usersService: UsersService,
    protected usersMongoRepository: UsersMongoRepository,
    protected blacklistRepository: BlacklistRepository,
    protected refreshTokenMetaRepository: RefreshTokensMetaRepository,
  ) {}

  @UseGuards(ThrottlerGuard)
  @UseGuards(AccessTokenAuthGuard)
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
      login: user.login || user!.accountData.login,
      email: user.email || user!.accountData.email,
    };
    res.status(200).send(userInfo);
    return;
  }
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Post('/login')
  async userLogin(
    @Req() req: Request,
    @Ip() ip: string,
    @Headers() headers: { authorization: string },
    @Res() res: Response,
  ) {
    const deviceId = String(Date.now());
    const accessToken = await this.jwtService.createAccessToken(
      req.user,
      settings.accessTokenLifeTime,
    );
    const refreshToken = await this.jwtService.createRefreshToken(
      deviceId,
      settings.refreshTokenLifeTime,
    );
    const ipAddress = ip || headers['x-forwarded-for'] || headers['x-real-ip'];
    const isCreated =
      await this.refreshTokenMetaRepository.createRefreshTokenMeta(
        req.user!.id,
        deviceId,
        headers['user-agent'] || 'unknown',
        ipAddress,
      );
    if (!isCreated) {
      res.status(400).send('RefreshTokenMeta error');
      return;
    }
    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .send({ accessToken: accessToken });
    return;
  }

  @UseGuards(ThrottlerGuard)
  @UseGuards(RefreshTokenAuthGuard)
  @Post('/refresh-token')
  async refreshAccessAndRefreshTokens(
    @Req() req: Request,
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
    const user: UserDbType | null =
      await this.usersMongoRepository.findUser(userId);
    if (!user) {
      res.sendStatus(401);
      return;
    }
    const tokens = await this.authService.refreshTokens(
      user!,
      req.user.deviceId,
    );
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
        req.user.deviceId,
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

  @UseGuards(ThrottlerGuard)
  @UseGuards(RefreshTokenAuthGuard)
  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
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

  @UseGuards(ThrottlerGuard)
  @Post('/registration')
  async registration(
    @Req() req: Request,
    @Body() body: CreateUserInputModelType,
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

  @UseGuards(ThrottlerGuard)
  @Post('/registration-confirmation')
  async registrationConfirmation(
    @Req() req: Request,
    @Body() body: confirmationCodeType,
    @Res() res: Response,
  ) {
    const isConfirmationAccept =
      await this.usersService.userEmailConfirmationAccept(body.code);
    if (!isConfirmationAccept) {
      res.status(400).send('user confirm error');
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration-email-resending')
  async registrationEmailResending(
    @Req() req: Request,
    @Body() body: EmailResendingModelType,
    @Res() res: Response,
  ) {
    await this.usersMongoRepository.userConfirmationCodeUpdate(body.email);
    await this.emailAdapter.sendConfirmEmail(body.email);
    res.sendStatus(204);
    return;
  }

  @UseGuards(ThrottlerGuard)
  @Post('/password-recovery')
  async passwordRecovery(
    @Req() req: Request,
    @Body() body: EmailInputModelType,
    @Res() res: Response,
  ) {
    const recoveryCode = await this.jwtService.createRecoveryCode(body.email);
    await this.emailAdapter.sendRecoveryCode(body.email, recoveryCode);
    const result = await this.usersService.updateRecoveryCode(
      body.email,
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

  @UseGuards(ThrottlerGuard)
  @Post('/new-password')
  async newPassword(
    @Req() req: Request,
    @Body() body: RecoveryCodeAndNewPasswordType,
    @Res() res: Response,
  ) {
    const resultOfUpdate = await this.usersService.updateUserPassword(
      body.recoveryCode,
      body.newPassword,
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
