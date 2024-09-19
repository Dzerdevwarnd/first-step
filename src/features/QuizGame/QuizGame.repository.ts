import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { QuestionQuizViewType } from '../QuizQuestions/Questions.types';
import { UserEntity } from '../users/users.entity';
import { UserDbType } from '../users/users.types';
import { QuizGame } from './QuizGame.entity';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectRepository(QuizGame)
    private quizGameRepository: Repository<QuizGame>,
  ) {}

  async findMyCurrentGame(user: UserEntity): Promise<QuizGame | null> {
    const game = await this.quizGameRepository
      .createQueryBuilder('quiz_game')
      .where(`"quiz_game"."firstPlayerProgress"->'player'->>'id' = :userId`, {
        userId: user.id,
      })
      .orWhere(
        `"quiz_game"."secondPlayerProgress"->'player'->>'id' = :userId`,
        {
          userId: user.id,
        },
      )
      .getOne();

    return game;
  }
  //
  async findGamebyId(params: { id }): Promise<QuizGame | null> {
    const game = await this.quizGameRepository
      .createQueryBuilder('quiz_game')
      .where(`quiz_game.id = :gameId`, {
        gameId: params.id,
      })
      .getOne();

    return game;
  }

  async findOpenGame(): Promise<QuizGame> {
    const game = await this.quizGameRepository.findOne({
      where: { status: 'PendingSecondPlayer' },
    });
    return game;
  }

  async findOpenGameAndJoin(
    user: UserDbType,
    questions: QuestionQuizViewType[],
  ): Promise<QuizGame> {
    const game = await this.quizGameRepository.findOne({
      where: { status: 'PendingSecondPlayer' },
    });
    (game.secondPlayerProgress = {
      answers: null,
      player: {
        id: user.id,
        login: user.accountData.login,
      },
      score: 0,
    }),
      (game.questions = questions);
    game.status = 'Active';
    game.startGameDate = new Date();
    const updatedGame = this.quizGameRepository.save(game);
    return updatedGame;
  }

  async createGame(user: UserDbType): Promise<QuizGame> {
    const newGame = {
      id: uuidv4(),
      firstPlayerProgress: {
        answers: null,
        player: {
          id: user.id,
          login: user.accountData.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: [],
      status: 'PendingSecondPlayer',
      pairCreatedDate: new Date(),
      startGameDate: null,
      finishGameDate: null,
    };
    const game = this.quizGameRepository.save(newGame);
    return game;
  }

  async saveGame(game: QuizGame) {
    const savedGame = await this.quizGameRepository.save(game);
    return savedGame;
  }
}
///
