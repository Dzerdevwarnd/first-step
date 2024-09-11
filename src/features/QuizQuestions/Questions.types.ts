import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsString,
  Length,
} from 'class-validator';

export class CreateAndUpdateQuestionsInputModelType {
  /* @NotContains(' ', { message: 'Property should not contain spaces' }) */
  @Length(10, 500, {
    message: 'body must be longer than or equal to 10 characters',
  })
  body: string;
  @IsArray({ message: 'correctAnswers should be an array' })
  @ArrayNotEmpty({ message: 'correctAnswers should not be empty' })
  @IsString({ each: true, message: 'Each correct answer should be a string' })
  /*   @NotContains(' ', {
    each: true,
    message: 'Property should not contain spaces',
  }) */
  @Length(1, 500, {
    each: true,
    message: 'Each answer must be longer than or equal to 1 character',
  })
  correctAnswers: string[];
}

export class updateQuestionPublishInputType {
  /*   @NotContains(' ', { message: 'Property should not contain spaces' })
  @Length(1, 500) */
  @IsBoolean({ message: 'published must be a boolean value' })
  published: boolean;
}

export type QuestionQuizViewType = {
  id: string;
  body: string;
};

export type QuestionDBType = {
  id: string;
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
