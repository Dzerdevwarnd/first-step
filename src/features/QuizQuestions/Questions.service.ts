import { Injectable } from '@nestjs/common';
import { JwtService } from '../auth/jwt/jwtService';
import { Question } from './Questions.entity';
import { QuestionsRepository } from './Questions.repository';
import {
  EntityWithPagination,
  QuestionDBType,
  QuestionQuizViewType,
} from './Questions.types';

@Injectable()
export class QuestionsService {
  constructor(
    protected jwtService: JwtService,
    protected questionsRepository: QuestionsRepository,
  ) {}

  async findQuestionById(id: string): Promise<Question> {
    const question = await this.questionsRepository.findQuestionById(id);
    return question;
  }

  async findQuestionsWithQuery(
    query: Record<string, any>,
  ): Promise<EntityWithPagination<QuestionDBType>> {
    const questionsAndTotalCount =
      await this.questionsRepository.findQuestionsWithQuery(query);
    const pageNumber = query.pageNumber || 1;
    const pageSize = query.pageSize || 10;
    const pagesCount = Math.ceil(questionsAndTotalCount.totalCount / pageSize);
    const questionsWithPagination = {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: questionsAndTotalCount.totalCount,
      items: questionsAndTotalCount.questions,
    };
    return questionsWithPagination;
  }

  async findQuestionsForQuiz(): Promise<QuestionQuizViewType[]> {
    const questions = await this.questionsRepository.findQuestionsForQuiz();
    return questions;
  }

  async createQuestion(dto: { body: string; correctAnswers: string[] }) {
    const newQuestion = this.questionsRepository.createQuestion(dto);
    return newQuestion;
  }

  async updateQuestion(
    id: string,
    dto: {
      body: string;
      correctAnswers: string[];
    },
  ): Promise<boolean> {
    const updateResult = await this.questionsRepository.updateQuestion(id, dto);
    return updateResult;
  }

  async updateQuestionPublish(
    id: string,
    dto: { published: boolean },
  ): Promise<boolean> {
    const updateResult = await this.questionsRepository.updateQuestionPublish(
      id,
      dto,
    );
    return updateResult;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const deleteResult = await this.questionsRepository.deleteQuestion(id);
    return deleteResult;
  }
}
//
