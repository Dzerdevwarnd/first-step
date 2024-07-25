import { Injectable } from '@nestjs/common';
import { JwtService } from '../auth/jwt/jwtService';
import { EntityWithPagination, QuestionDBType } from './Questiong.types';
import { QuestionsRepository } from './Questions.repository';

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
