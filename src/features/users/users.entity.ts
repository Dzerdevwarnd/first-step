import { Column, Entity, PrimaryColumn } from 'typeorm';

class AccountData {
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  createdAt: Date;
  @Column()
  passwordSalt: string;
  @Column()
  passwordHash: string;
  @Column({ nullable: true })
  recoveryCode: string;
}

class EmailConfirmationData {
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;
  @Column()
  isConfirmed: boolean;
}

class QuizGameDate {
  @Column({ default: 0 })
  score: number;

  @Column({ nullable: true, default: null })
  currentGameId: string | null;

  @Column({ default: 0 })
  winsCount: number;
  @Column({ default: 0 })
  lossesCount: number;
  @Column({ default: 0 })
  drawsCount: number;
}

@Entity()
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column(() => AccountData)
  accountData: AccountData;

  @Column(() => EmailConfirmationData)
  emailConfirmationData: EmailConfirmationData;

  @Column(() => QuizGameDate)
  quizGameDate: QuizGameDate;
}
