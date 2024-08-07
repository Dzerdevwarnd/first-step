import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './Questions.entity';
import { QuestionDBType, QuestionQuizViewType } from './Questions.types';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async findQuestionById(id: number): Promise<Question> {
    const question = await this.questionsRepository
      .createQueryBuilder('Question')
      .where('Question.id = :id', { id })
      .getOne();

    return question;
  }

  async findQuestionsWithQuery(
    query: Record<string, any>,
  ): Promise<QuestionDBType[]> {
    const bodySearchTerm = query.bodySearchTerm;
    const publishedStatus = query.publishedStatus;
    const sortBy = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection === 'DESC' ? 'DESC' : 'ASC';

    const queryBuilder =
      this.questionsRepository.createQueryBuilder('Question');
    if (bodySearchTerm) {
      queryBuilder.andWhere('Question.body LIKE :bodySearchTerm', {
        bodySearchTerm: `%${bodySearchTerm}%`,
      });
    }
    if (publishedStatus) {
      queryBuilder.andWhere('Question.publishedStatus = :publishedStatus', {
        publishedStatus,
      });
    }
    queryBuilder.orderBy(`Question.${sortBy}`, sortDirection);
    const questions = await queryBuilder.getMany();
    return questions;
  }

  async findQuestionsForQuiz(): Promise<QuestionQuizViewType[]> {
    const queryBuilder =
      this.questionsRepository.createQueryBuilder('Question');
    queryBuilder
      .select(['Question.id', 'Question.body'])
      .orderBy('RANDOM()')
      .take(5);

    const questions = await queryBuilder.getMany();
    return questions as QuestionQuizViewType[];
  }

  async createQuestion(dto: {
    body: string;
    correctAnswers: string[];
  }): Promise<QuestionDBType> {
    const newQuestion = {
      body: dto.body,
      correctAnswers: dto.correctAnswers,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const savedNewQuestion = await this.questionsRepository.save(newQuestion);
    return savedNewQuestion;
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
