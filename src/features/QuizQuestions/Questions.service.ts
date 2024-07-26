import { Injectable } from '@nestjs/common';
import { JwtService } from '../auth/jwt/jwtService';
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

  async findQuestionsWithQuery(
    query: Record<string, any>,
  ): Promise<EntityWithPagination<QuestionDBType>> {
    const questions =
      await this.questionsRepository.findQuestionsWithQuery(query);
    const pageNumber = query.pageNumber;
    const pageSize = query.pageSize;
    const pagesCount = questions.length / pageSize;
    const questionsWithPagination = {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: questions.length,
      items: questions,
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
