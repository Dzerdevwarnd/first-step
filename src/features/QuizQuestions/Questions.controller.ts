import { BasicAuthGuard } from '@app/src/features/auth/guards/basic.auth.guard';
import {
  Body,
  Controller, //
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { QuestionsService } from './Questions.service';
import {
  CreateAndUpdateQuestionsInputModelType,
  QuestionDBType,
  updateQuestionPublishInputType,
} from './Questions.types';

@Controller('sa/quiz/questions')
export class QuestionsController {
  constructor(
    private commandBus: CommandBus,
    private questionsService: QuestionsService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getQuestionsWithQuery(
    @Query()
    query: Record<string, any>,
    @Body()
    body: CreateAndUpdateQuestionsInputModelType,
    @Res() res: Response,
  ) {
    const questionsWithPagination =
      await this.questionsService.findQuestionsWithQuery(query);
    res.status(201).send(questionsWithPagination);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createQuestion(
    @Body()
    body: CreateAndUpdateQuestionsInputModelType,
    @Res() res: Response,
  ): Promise<QuestionDBType> {
    const newQuestion = await this.questionsService.createQuestion(body);
    res.status(201).send(newQuestion);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updateQuestion(
    @Param() params: { id: number },
    @Body()
    body: CreateAndUpdateQuestionsInputModelType,
    @Res() res: Response,
  ) {
    const updateResult = await this.questionsService.updateQuestion(
      params.id,
      body,
    );
    if (!updateResult) {
      res.status(404);
    }
    res.status(204);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/publish')
  async updateQuestionPublish(
    @Param() params: { id: number },
    @Body()
    body: updateQuestionPublishInputType,
    @Res() res: Response,
  ) {
    const updateResult = await this.questionsService.updateQuestionPublish(
      params.id,
      body,
    );
    if (!updateResult) {
      res.status(404);
    }
    res.status(204);
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async deleteQuestion(@Param() params: { id: number }, @Res() res: Response) {
    const deleteResult = await this.questionsService.deleteQuestion(params.id);
    if (!deleteResult) {
      res.status(404);
    }
    res.status(204);
    return;
  }
}
