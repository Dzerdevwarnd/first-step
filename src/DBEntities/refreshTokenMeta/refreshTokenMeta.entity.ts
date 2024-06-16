import { UserEntity } from 'src/endPointsEntities/users/users.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class RefreshTokenMetaEntity {
  @ManyToOne(() => UserEntity)
  @Column()
  userId: string;

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
}
