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

@Entity()
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column(() => AccountData)
  accountData: AccountData;

  @Column(() => EmailConfirmationData)
  emailConfirmationData: EmailConfirmationData;
}
