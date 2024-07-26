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
  @Column()
  score: string;
  @Column()
  currentGameId: number;
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
