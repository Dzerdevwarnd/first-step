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

  async findQuestionById(id: string): Promise<Question> {
    const question = await this.questionsRepository
      .createQueryBuilder('question')
      .where('question.id = :id', { id })
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
      this.questionsRepository.createQueryBuilder('question');
    if (bodySearchTerm) {
      queryBuilder.andWhere('question.body LIKE :bodySearchTerm', {
        bodySearchTerm: `%${bodySearchTerm}%`,
      });
    }
    if (publishedStatus === 'published') {
      queryBuilder.andWhere('question.published = true', {});
    } else if (publishedStatus === 'notPublished') {
      queryBuilder.andWhere('question.published = false', {});
    }
    queryBuilder.orderBy(`question.${sortBy}`, sortDirection);
    const questions = await queryBuilder.getMany();
    return questions;
  }

  async findQuestionsForQuiz(): Promise<QuestionQuizViewType[]> {
    const queryBuilder =
      this.questionsRepository.createQueryBuilder('question');
    queryBuilder
      .select(['question.id', 'question.body'])
      .where('published = true')
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
      updatedAt: null,
    };
    const savedNewQuestion = await this.questionsRepository.save(newQuestion);
    return savedNewQuestion;
  }

  async updateQuestion(
    id: string,
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
        updatedAt: new Date(),
      })
      .where('id = :id', { id })
      .execute();
    return updateResult.affected === 1;
  }

  async updateQuestionPublish(
    id: string,
    dto: { published: boolean },
  ): Promise<boolean> {
    const updateResult = await this.questionsRepository
      .createQueryBuilder()
      .update(Question)
      .set({
        published: dto.published,
        updatedAt: new Date(),
      })
      .where('id = :id', { id })
      .execute();
    return updateResult.affected === 1;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const updateResult = await this.questionsRepository.delete({ id: id });
    return updateResult.affected === 1;
  }
}
