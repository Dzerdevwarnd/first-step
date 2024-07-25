import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  Length,
  NotContains,
} from 'class-validator';

export class CreateAndUpdateQuestionsInputModelType {
  @NotContains('  ', { message: 'Property should not contain spaces' })
  @Length(10, 500)
  body: string;
  @IsArray({ message: 'correctAnswers should be an array' })
  @ArrayNotEmpty({ message: 'correctAnswers should not be empty' })
  @IsString({ each: true, message: 'Each correct answer should be a string' })
  @NotContains('  ', {
    each: true,
    message: 'Property should not contain spaces',
  })
  @Length(1, 500, { each: true })
  correctAnswers: string[];
}

export class updateQuestionPublishInputType {
  @NotContains('  ', { message: 'Property should not contain spaces' })
  @Length(1, 500)
  published: boolean;
}

export type QuestionDBType = {
  id: number;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type EntityWithPagination<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};
