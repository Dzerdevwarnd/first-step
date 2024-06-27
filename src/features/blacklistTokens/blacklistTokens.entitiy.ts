import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BlackListTokenEntity {
  @PrimaryColumn()
  token: string;

  @Column()
  expireDate: Date;
}
