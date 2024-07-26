import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionQuizViewType } from '../QuizQuestions/Questions.types';
import { UserDbType } from '../users/users.types';
import { QuizGame } from './QuizGame.entity';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectRepository(QuizGame)
    private quizGameRepository: Repository<QuizGame>,
  ) {}

  async findOpenGameAndJoin(
    user: UserDbType,
    questions: QuestionQuizViewType[],
  ): Promise<QuizGame> {
    const game = await this.quizGameRepository.findOne({
      where: { status: 'PendingSecondPlayer' },
    });
    game.secondPlayerProgress.player.id = user.id;
    game.secondPlayerProgress.player.login = user.accountData.login;
    game.questions = questions;
    game.status = 'Active';
    game.startGameDate = new Date();
    return game;
  }

  async createGame(user: UserDbType): Promise<QuizGame> {
    const newGame = {
      firstPlayerProgress: {
        answers: null,
        player: {
          id: user.id,
          login: user.accountData.login,
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: null,
        player: null,
        score: 0,
      },
      questions: null,
      status: 'PendingSecondPlayer',
      pairCreatedDate: new Date(),
      startGameDate: null,
      finishGameDate: null,
    };
    const game = this.quizGameRepository.save(newGame);
    return game;
  }

  async updateQuestion(
    id: number,
    dto: {
      body: string;
      correctAnswers: string[];
    },
  ): Promise<boolean> {
    const updateResult = await this.questionsRepository
      .createQueryBuilder()
      .update(Question)
      .set({
        body: dto.body,
        correctAnswers: dto.correctAnswers,
      })
      .where('id = :id', { id })
      .execute();
    return updateResult.affected === 1;
  }

  async updateQuestionPublish(
    id: number,
    dto: { published: boolean },
  ): Promise<boolean> {
    const updateResult = await this.questionsRepository
      .createQueryBuilder()
      .update(Question)
      .set({
        published: dto.published,
      })
      .where('id = :id', { id })
      .execute();
    return updateResult.affected === 1;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const updateResult = await this.questionsRepository.delete({ id: id });
    return updateResult.affected === 1;
  }
}
