import { Injectable } from '@nestjs/common';
import { JwtService } from '../auth/jwt/jwtService';
import { QuestionsService } from '../QuizQuestions/Questions.service';

import { EntityWithPagination } from '../QuizQuestions/Questions.types';
import { UserEntity } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { UserDbType } from '../users/users.types';
import { PlayerProgress, QuizGame } from './QuizGame.entity';
import { QuizGameRepository } from './QuizGame.repository';

@Injectable()
export class QuizGameService {
  constructor(
    protected jwtService: JwtService,
    protected quizGameRepository: QuizGameRepository,
    protected questionsService: QuestionsService,
    protected usersService: UsersService,
  ) {}

  async findMyCurrentGame(user: UserEntity): Promise<QuizGame> {
    const game = await this.quizGameRepository.findMyCurrentGame(user);
    return game;
  }
  //
  async findMyGamesWithQuery(
    user: UserEntity,
    query: any,
  ): Promise<EntityWithPagination<QuizGame>> {
    const gamesAndTotalCountObject =
      await this.quizGameRepository.findMyGamesWithQuery(query);
    const pageNumber = query.pageNumber || 1;
    const pageSize = query.pageSize || 10;
    const pagesCount = Math.ceil(
      gamesAndTotalCountObject.totalCount / pageSize,
    );
    const gamesWithPagination = {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: gamesAndTotalCountObject.totalCount,
      items: gamesAndTotalCountObject.games,
    };
    return gamesWithPagination;
  }

  async findMyStatistic(user: UserEntity): Promise<QuizGame> {
    const gamesWithPagination = await this.findMyGamesWithQuery(user, {
      status: 'Finished',
    });
    return game;
  }
  ////
  async findGamebyId(
    params: { id },
    user: UserDbType | null,
  ): Promise<QuizGame | string> {
    const game = await this.quizGameRepository.findGamebyId(params);
    if (game === null) {
      return game;
    } else if (
      game?.firstPlayerProgress?.player?.id !== user.id &&
      game?.secondPlayerProgress?.player?.id !== user.id
    ) {
      return 'forbidden';
    }
    return game;
  }
  //
  async connectOrCreateGame(user: UserEntity): Promise<QuizGame> {
    const openGame = await this.quizGameRepository.findOpenGame();
    let game: QuizGame;
    if (openGame) {
      const questions = await this.questionsService.findQuestionsForQuiz();
      game = await this.quizGameRepository.findOpenGameAndJoin(user, questions);
      await this.usersService.updateUserQuizGameCurrentId(user.id, game.id);
    } else if (!openGame) {
      game = await this.quizGameRepository.createGame(user);
      await this.usersService.updateUserQuizGameCurrentId(user.id, game.id);
    }
    return game;
  }
  ///
  async giveAnswerForNestQuestion(body: { answer: string }, user: UserEntity) {
    const currentGame = await this.findMyCurrentGame(user);
    if (!currentGame || currentGame?.status !== 'Active') {
      return null;
    }
    let playerProgress: PlayerProgress;
    let secondPlayerProgress: PlayerProgress;
    if (currentGame.firstPlayerProgress.player.id === user.id) {
      playerProgress = currentGame.firstPlayerProgress;
      secondPlayerProgress = currentGame.secondPlayerProgress;
    } else {
      playerProgress = currentGame.secondPlayerProgress;
      secondPlayerProgress = currentGame.firstPlayerProgress;
    }
    const currentQuestionNumber =
      playerProgress.answers === null ? 1 : playerProgress.answers.length + 1;
    if (currentQuestionNumber > 5) {
      return null;
    }
    const currentQuestionIndex = currentQuestionNumber - 1;
    const questionId = currentGame.questions[currentQuestionIndex].id;
    const rightAnswers = (
      await this.questionsService.findQuestionById(questionId)
    ).correctAnswers;
    if (!playerProgress.answers) {
      playerProgress.answers = [];
    }
    playerProgress.answers[currentQuestionIndex] = {
      questionId: null,
      answerStatus: null,
      addedAt: null,
    }; ////
    if (rightAnswers.includes(body.answer)) {
      playerProgress.answers[currentQuestionIndex].answerStatus = 'Correct';
      playerProgress.score += 1;
    } else {
      playerProgress.answers[currentQuestionIndex].answerStatus = 'Incorrect';
    }
    playerProgress.answers[currentQuestionIndex].addedAt = new Date();
    playerProgress.answers[currentQuestionIndex].questionId = questionId;

    if (
      playerProgress.answers.length >= 5 &&
      secondPlayerProgress.answers.length >= 5
    ) {
      if (
        playerProgress.answers[playerProgress.answers.length - 1].addedAt <
        secondPlayerProgress.answers[secondPlayerProgress.answers.length - 1]
          .addedAt
      ) {
        if (playerProgress.score > 0) {
          playerProgress.score += 1;
        }
      } else if (secondPlayerProgress.score > 0) {
        secondPlayerProgress.score += 1;
      }

      currentGame.status = 'Finished';
      currentGame.finishGameDate = new Date();
      if (playerProgress.score > secondPlayerProgress.score) {
        await this.usersService.updateQuizGameUserGameResultCount({
          result: 'win',
          user1Id: playerProgress.player.id,
          user2Id: secondPlayerProgress.player.id,
        });
      } else if (secondPlayerProgress.score > playerProgress.score) {
        await this.usersService.updateQuizGameUserGameResultCount({
          result: 'win',
          user1Id: secondPlayerProgress.player.id,
          user2Id: playerProgress.player.id,
        });
      } else {
        await this.usersService.updateQuizGameUserGameResultCount({
          result: 'draw',
          user1Id: secondPlayerProgress.player.id,
          user2Id: playerProgress.player.id,
        });
      }

      await this.usersService.updateUserQuizGameCurrentId(
        playerProgress.player.id,
        null,
      );
      await this.usersService.updateUserQuizGameScore(
        playerProgress.player.id,
        playerProgress.score,
      );

      await this.usersService.updateUserQuizGameCurrentId(
        secondPlayerProgress.player.id,
        null,
      );
      await this.usersService.updateUserQuizGameScore(
        user.id,
        secondPlayerProgress.score,
      );
    } //
    await this.quizGameRepository.saveGame(currentGame);
    return playerProgress.answers[currentQuestionIndex];
  }
}
//
