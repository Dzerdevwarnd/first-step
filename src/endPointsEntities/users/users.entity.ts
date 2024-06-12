import { Column, Entity, PrimaryColumn } from 'typeorm';

class AccountData {
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  createdAt: string;
  @Column()
  passwordSalt: string;
  @Column()
  passwordHash: string;
  @Column()
  recoveryCode: string;
}

class EmailConfirmationData {
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: string;
  @Column()
  isConfirmed: boolean;
}

@Entity()
export class User {
  @PrimaryColumn()
  id: number;

  @Column(() => AccountData)
  accountData: AccountData;

  @Column(() => EmailConfirmationData)
  emailConfirmationData: EmailConfirmationData;
}
