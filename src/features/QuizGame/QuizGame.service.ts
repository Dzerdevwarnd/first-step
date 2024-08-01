import { Injectable } from '@nestjs/common';
import { JwtService } from '../auth/jwt/jwtService';
import { QuestionsService } from '../QuizQuestions/Questions.service';

import { UserEntity } from '../users/users.entity';
import { UsersService } from '../users/users.service';
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
    const game = await this.quizGameRepository.findGamebyId(user);
    return game;
  }

  async findGamebyId(params: { id }): Promise<QuizGame> {
    const game = await this.quizGameRepository.findGamebyId(params);
    return game;
  }

  async connectOrCreateGame(user: UserEntity): Promise<QuizGame> {
    const openGame = await this.quizGameRepository.findOpenGame();
    const questions = await this.questionsService.findQuestionsForQuiz();
    let game: QuizGame;
    if (openGame) {
      game = await this.quizGameRepository.findOpenGameAndJoin(user, questions);
      await this.usersService.updateUserQuizGameCurrentId(user.id, game.id);
    } else if (!openGame) {
      game = await this.quizGameRepository.createGame(user);
      await this.usersService.updateUserQuizGameCurrentId(user.id, game.id);
    }
    return game;
  }

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
      playerProgress.answers.length === 0 ? 1 : playerProgress.answers.length;
    const currentQuestionIndex = currentQuestionNumber - 1;
    const questionId = currentGame.questions[currentQuestionIndex].id;
    const rightAnswers = (
      await this.questionsService.findQuestionById(questionId)
    ).correctAnswers;
    if (rightAnswers.includes(body.answer)) {
      playerProgress.answers[currentQuestionIndex].answerStatus = 'Correct';
      playerProgress.score += 1;
    } else {
      playerProgress.answers[currentQuestionIndex].answerStatus = 'Incorrect';
    }
    playerProgress.answers[currentQuestionNumber].addedAt = new Date();
    playerProgress.answers[currentQuestionNumber].questionId = questionId;
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
    }
    this.quizGameRepository.saveGame(currentGame);
  }
}
//
