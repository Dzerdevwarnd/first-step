import { Injectable } from '@nestjs/common';
import { JwtService } from '../auth/jwt/jwtService';
import { QuestionsService } from '../QuizQuestions/Questions.service';
import { UserDbType } from '../users/users.types';
import { Question } from './QuizGame.entity';
import { QuizGameRepository } from './QuizGame.repository';

@Injectable()
export class QuizGameService {
  constructor(
    protected jwtService: JwtService,
    protected quizGameRepository: QuizGameRepository,
    protected questionsService: QuestionsService,
  ) {}

  async connectOrCreateGame(user: UserDbType): Promise<Question> {
    const questions = await this.questionsService.findQuestionsForQuiz();
    let game = await this.quizGameRepository.findOpenGameAndJoin(
      user,
      questions,
    );
    if (!game) {
      game = await this.quizGameRepository.createGame(user);
    }
    return game;
  }

  async createQuestion(dto: { body: string; correctAnswers: string[] }) {
    const newQuestion = this.questionsRepository.createQuestion(dto);
    return newQuestion;
  }

  async updateQuestion(
    id: number,
    dto: {
      body: string;
      correctAnswers: string[];
    },
  ): Promise<boolean> {
    const updateResult = await this.questionsRepository.updateQuestion(id, dto);
    return updateResult;
  }

  async updateQuestionPublish(
    id: number,
    dto: { published: boolean },
  ): Promise<boolean> {
    const updateResult = await this.questionsRepository.updateQuestionPublish(
      id,
      dto,
    );
    return updateResult;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const deleteResult = await this.questionsRepository.deleteQuestion(id);
    return deleteResult;
  }
}
//
