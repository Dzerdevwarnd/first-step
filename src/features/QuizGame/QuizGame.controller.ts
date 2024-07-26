import { BasicAuthGuard } from '@app/src/features/auth/guards/basic.auth.guard';
import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { AccessTokenAuthGuard } from '../auth/guards/accessToken.auth.guard';
import { JwtService } from '../auth/jwt/jwtService';
import { UsersService } from '../users/users.service';
import {
  CreateAndUpdateQuestionsInputModelType,
  updateQuestionPublishInputType,
} from './Questiong.types';
import { QuizGame } from './QuizGame.entity';
import { QuizGameService } from './QuizGame.service';

@Controller('pair-game-quiz/pairs')
export class QuizGamelController {
  constructor(
    protected usersService: UsersService,
    protected jwtService: JwtService,
    private commandBus: CommandBus,
    private quizGameService: QuizGameService,
  ) {}

  @UseGuards(AccessTokenAuthGuard)
  @Post()
  async findGameById(
    @Headers() headers: { authorization: string },
    @Res() res: Response,
  ): Promise<QuizGame> {
    const userId = await this.jwtService.verifyAndGetUserIdByToken(
      headers.authorization.split(' ')[1],
    );
    const user = await this.usersService.findUser(userId);
    const myGame = await this.quizGameService.connectOrCreateGame(user);
    res.status(200).send(myGame);
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
    const user = await this.usersService.findUser(userId);
    const myGame = await this.quizGameService.connectOrCreateGame(user);
    res.status(200).send(myGame);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updateQuestion(
    @Param() params: { id: number },
    @Body()
    body: CreateAndUpdateQuestionsInputModelType,
    @Res() res: Response,
  ) {
    const updateResult = await this.questionsService.updateQuestion(
      params.id,
      body,
    );
    if (!updateResult) {
      res.status(404);
    }
    res.status(204);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/publish')
  async updateQuestionPublish(
    @Param() params: { id: number },
    @Body()
    body: updateQuestionPublishInputType,
    @Res() res: Response,
  ) {
    const updateResult = await this.questionsService.updateQuestionPublish(
      params.id,
      body,
    );
    if (!updateResult) {
      res.status(404);
    }
    res.status(204);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async deleteQuestion(@Param() params: { id: number }, @Res() res: Response) {
    const deleteResult = await this.questionsService.deleteQuestion(params.id);
    if (!deleteResult) {
      res.status(404);
    }
    res.status(204);
    return;
  }
}
