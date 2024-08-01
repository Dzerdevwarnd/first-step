import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

class Answer {
  questionId: number;
  answerStatus: string;
  addedAt: Date;
}

class Player {
  id: string;
  login: string;
}
export class PlayerProgress {
  /*   @ValidateNested({ each: true })
  @Type(() => Answer) */
  answers: Answer[];

  /*   @ValidateNested()
  @Type(() => Player) */
  player: Player;
  score: number;
}

class questions {
  id: number;
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
  questions: questions[];

  @Column()
  status: string;

  @Column()
  pairCreatedDate: Date;

  @Column()
  startGameDate: Date;

  @Column()
  finishGameDate: Date;
}
