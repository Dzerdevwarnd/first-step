import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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
      .where(
        new Brackets((qb) => {
          qb.where(
            `"quiz_game"."firstPlayerProgress"->'player'->>'id' = :userId`,
            {
              userId: user.id,
            },
          ).orWhere(
            `"quiz_game"."secondPlayerProgress"->'player'->>'id' = :userId`,
            {
              userId: user.id,
            },
          );
        }),
      )
      .andWhere(`"quiz_game"."status" != 'Finished'`)
      .getOne();

    return game;
  }

  async findMyGamesWithQuery(
    query: Record<string, any>,
  ): Promise<{ games; totalCount }> {
    const bodySearchTerm = query.bodySearchTerm;
    const publishedStatus = query.publishedStatus;
    const sortBy = query.sortBy || 'pairCreatedDate';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const page = query.pageNumber || 1;
    const limit = query.pageSize || 10;
    ///
    const queryBuilder =
      this.quizGameRepository.createQueryBuilder('quiz_game');
    if (sortDirection === 'DESC') {
      queryBuilder.orderBy(`quiz_game.${sortBy}`, sortDirection, 'NULLS FIRST');
    } else if (sortDirection === 'ASC') {
      queryBuilder.orderBy(`quiz_game.${sortBy}`, sortDirection, 'NULLS LAST');
    }
    queryBuilder.orderBy(`quiz_game.${sortBy}`, sortDirection);
    queryBuilder.skip((page - 1) * limit).take(limit);
    const games = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();
    return { games: games, totalCount: totalCount };
  }
  ///
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
  //
  async findOpenGameAndJoin(
    user: UserDbType,
    questions: QuestionQuizViewType[],
  ): Promise<QuizGame> {
    const game = await this.quizGameRepository.findOne({
      where: { status: 'PendingSecondPlayer' },
    });
    (game.secondPlayerProgress = {
      answers: [],
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
        answers: [],
        player: {
          id: user.id,
          login: user.accountData.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: 'PendingSecondPlayer',
      pairCreatedDate: new Date(),
      startGameDate: null,
      finishGameDate: null,
    };
    const game = this.quizGameRepository.save(newGame);
    return game;
  }
  //
  async saveGame(game: QuizGame) {
    const savedGame = await this.quizGameRepository.save(game);
    return savedGame;
  }
}
///
