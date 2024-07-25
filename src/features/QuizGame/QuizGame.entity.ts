import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

class Answer {
  questionId: string;
  answerStatus: string;
  addedAt: Date;
}

class Player {
  id: string;
  login: string;
}
class PlayerProgress {
  /*   @ValidateNested({ each: true })
  @Type(() => Answer) */
  answers: Answer[];

  /*   @ValidateNested()
  @Type(() => Player) */
  player: Player;
  score: number;
}

class questions {
  id: string;
  body: string;
}

@Entity()
export class QuizGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /*   @ValidateNested()
  @Type(() => PlayerProgress) */
  firstPlayerProgress: PlayerProgress;

  /*   @ValidateNested()
  @Type(() => PlayerProgress) */
  secondPlayerProgress: PlayerProgress;

  /*   @Column('json')
  @ValidateNested({ each: true })
  @Type(() => Question) */
  questions: Question[];

  @Column()
  status: string;

  @Column()
  pairCreatedDate: Date;

  @Column()
  startGameDate: Date;

  @Column()
  finishGameDate: Date;
}

export class Question {
  id: string;
  body: string;
}