import { Injectable } from '@nestjs/common';
import { JwtService } from '../auth/jwt/jwtService';
import { QuestionsService } from '../QuizQuestions/Questions.service';

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
  //
  async giveAnswerForNestQuestion(body: { answer: string }, user: UserEntity) {
    const currentGame = await this.findMyCurrentGame(user);
    if (!currentGame || currentGame.status === 'Finished') {
      return null;
    }
    let playerProgress: PlayerProgress;
    if (currentGame.firstPlayerProgress.player.id === user.id) {
      playerProgress = currentGame.firstPlayerProgress;
    } else {
      playerProgress = currentGame.secondPlayerProgress;
    }
    const currentQuestionNumber =
      playerProgress.answers === null ? 1 : playerProgress.answers.length;
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
    }; ///
    if (rightAnswers.includes(body.answer)) {
      playerProgress.answers[currentQuestionIndex].answerStatus = 'Correct';
      playerProgress.score += 1;
    } else {
      playerProgress.answers[currentQuestionIndex].answerStatus = 'Incorrect';
    }
    playerProgress.answers[currentQuestionIndex].addedAt = new Date();
    playerProgress.answers[currentQuestionIndex].questionId = questionId;
    currentGame.finishGameDate = new Date();
    if (playerProgress.answers.length === 5) {
      currentGame.status = 'Finished';
      currentGame.finishGameDate = new Date();
      await this.usersService.updateUserQuizGameCurrentId(user.id, null);
      const userTotalScore = user.quizGameDate.score + playerProgress.score;
      await await this.usersService.updateUserQuizGameScore(
        user.id,
        userTotalScore,
      );
    } //
    await this.quizGameRepository.saveGame(currentGame);
    return playerProgress.answers[currentQuestionIndex];
  }
}
//
