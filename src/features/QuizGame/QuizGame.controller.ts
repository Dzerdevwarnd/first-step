import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AccessTokenAuthGuard } from '../auth/guards/accessToken.auth.guard';
import { JwtService } from '../auth/jwt/jwtService';
import { UserEntity } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { QuizGame } from './QuizGame.entity';
import { QuizGameService } from './QuizGame.service';

@Controller('pair-game-quiz/pairs')
export class QuizGameController {
  constructor(
    protected usersService: UsersService,
    protected jwtService: JwtService,
    private quizGameService: QuizGameService,
  ) {}

  @UseGuards(AccessTokenAuthGuard)
  @Get('/my-current')
  async findMyCurrentGame(
    @Headers() headers: { authorization: string },
    @Res() res: Response,
  ): Promise<QuizGame> {
    const userId = await this.jwtService.verifyAndGetUserIdByToken(
      headers.authorization.split(' ')[1],
    );
    const user: UserEntity = await this.usersService.findUser(userId);
    const game = await this.quizGameService.findMyCurrentGame(user);
    if (!game) {
      res.status(404);
    }
    res.status(200).send(game);
    return;
  }

  @UseGuards(AccessTokenAuthGuard)
  @Get(':id')
  async findGamebyId(
    @Param() params: { id },
    @Headers() headers: { authorization: string },
    @Res() res: Response,
  ): Promise<QuizGame> {
    const game = await this.quizGameService.findGamebyId(params);
    if (!game) {
      res.status(404);
    }
    res.status(200).send(game);
    return;
  }

  @UseGuards(AccessTokenAuthGuard)
  @Post()
  async connectOrCreateGame(
    @Headers() headers: { authorization: string },
    @Res() res: Response,
  ): Promise<QuizGame> {
    const userId = await this.jwtService.verifyAndGetUserIdByToken(
      headers.authorization.split(' ')[1],
    );
    const user: UserEntity = await this.usersService.findUser(userId);
    if (user.quizGameDate.currentGameId === null) {
      const myGame = await this.quizGameService.connectOrCreateGame(user);
      res.status(200).send(myGame);
      return;
    } else {
      res.status(403);
    }
  }

  @UseGuards(AccessTokenAuthGuard)
  @Post('/answers')
  async giveAnswerForNestQuestion(
    @Headers() headers: { authorization: string },
    @Body() body: { answer: string },
    @Res() res: Response,
  ): Promise<QuizGame> {
    const userId = await this.jwtService.verifyAndGetUserIdByToken(
      headers.authorization.split(' ')[1],
    );
    const user: UserEntity = await this.usersService.findUser(userId);

    const answerData = await this.quizGameService.giveAnswerForNestQuestion(
      body,
      user,
    );
    res.status(200).send(answerData);
    return;
  }
}
