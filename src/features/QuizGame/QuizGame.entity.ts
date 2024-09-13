import { Column, Entity, PrimaryColumn } from 'typeorm';

class Answer {
  @Column()
  questionId: string;

  @Column()
  answerStatus: string;

  @Column()
  addedAt: Date;
}

class Player {
  @Column()
  id: string;

  @Column()
  login: string;
}

export class PlayerProgress {
  @Column('json', { nullable: true })
  answers: Answer[];

  @Column((type) => Player)
  player: Player;

  @Column()
  score: number;
}

class Questions {
  @Column()
  id: string;

  @Column()
  body: string;
}

@Entity()
export class QuizGame {
  @PrimaryColumn()
  id: string;

  @Column('json')
  firstPlayerProgress: PlayerProgress;

  @Column('json', { nullable: true }) // Сохраняем второй прогресс игрока как nullable JSON
  secondPlayerProgress: PlayerProgress | null;

  @Column('json', { nullable: true }) // Если вопросы нужно хранить как JSON
  questions: Questions[];

  @Column()
  status: string;

  @Column()
  pairCreatedDate: Date;

  @Column({ nullable: true })
  startGameDate: Date | null;

  @Column({ nullable: true })
  finishGameDate: Date | null;
}
