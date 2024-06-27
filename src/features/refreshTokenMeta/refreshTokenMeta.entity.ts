import { UserEntity } from '@app/src/features/users/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class RefreshTokenMetaEntity {
  @PrimaryColumn()
  deviceId: string;
  @Column()
  title: string;
  @Column()
  ip: string;
  @Column()
  lastActiveDate: Date;
  @Column()
  expiredAt: Date;
  //
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;
}
