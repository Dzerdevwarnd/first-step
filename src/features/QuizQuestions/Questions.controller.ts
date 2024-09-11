import { BasicAuthGuard } from '@app/src/features/auth/guards/basic.auth.guard';
import {
  Body,
  Controller,
  Delete, //
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { QuestionsService } from './Questions.service';
import {
  CreateAndUpdateQuestionsInputModelType,
  updateQuestionPublishInputType,
} from './Questions.types';

@Controller('sa/quiz/questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getQuestionsWithQuery(
    @Query()
    query: Record<string, any>,
    @Res()
    res: Response,
  ): Promise<void> {
    const questionsWithPagination =
      await this.questionsService.findQuestionsWithQuery(query);
    res.status(200).send(questionsWithPagination);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createQuestion(
    @Body()
    body: CreateAndUpdateQuestionsInputModelType,
    @Res() res: Response,
  ): Promise<void> {
    const newQuestion = await this.questionsService.createQuestion(body);
    res.status(201).send(newQuestion);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updateQuestion(
    @Param() params: { id: string },
    @Body()
    body: CreateAndUpdateQuestionsInputModelType,
    @Res() res: Response,
  ): Promise<void> {
    const updateResult = await this.questionsService.updateQuestion(
      params.id,
      body,
    );
    if (!updateResult) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/publish')
  async updateQuestionPublish(
    @Param() params: { id: string },
    @Body()
    body: updateQuestionPublishInputType,
    @Res() res: Response,
  ): Promise<void> {
    const updateResult = await this.questionsService.updateQuestionPublish(
      params.id,
      body,
    );
    if (!updateResult) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deleteQuestion(
    @Param() params: { id: string },
    @Res() res: Response,
  ): Promise<void> {
    const deleteResult = await this.questionsService.deleteQuestion(params.id);
    if (!deleteResult) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
    return;
  }
}
