import { IsString } from 'class-validator';

export class FindGameByIdParams {
  @IsString() // Валидация UUID v4
  id: string;
}
