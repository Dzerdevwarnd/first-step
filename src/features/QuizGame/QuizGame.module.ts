import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from '../QuizQuestions/Questions.controller';
import { Question } from '../QuizQuestions/Questions.entity';
import { QuestionsRepository } from '../QuizQuestions/Questions.repository';
import { QuestionsService } from '../QuizQuestions/Questions.service';
import { AuthModule } from '../auth/auth.module';
import { QuizGameController } from './QuizGame.controller';
import { QuizGame } from './QuizGame.entity';
import { QuizGameRepository } from './QuizGame.repository';
import { QuizGameService } from './QuizGame.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuizGame, Question]), AuthModule],
  controllers: [QuizGameController, QuestionsController],
  providers: [
    QuizGameService,
    QuestionsService,
    QuizGameRepository,
    QuestionsRepository,
  ],
  exports: [QuizGameService, QuestionsService],
})
export class QuizGameModule {}
///
