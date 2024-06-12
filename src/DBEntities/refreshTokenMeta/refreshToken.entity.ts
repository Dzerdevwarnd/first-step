import { User } from 'src/endPointsEntities/users/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RefreshTokenMetaEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User)
  @Column()
  userId: string;

  @Column()
  deviceId: string;
  @Column()
  title: string;
  @Column()
  ip: string;
  @Column()
  lastActiveDate: string;
  @Column()
  expiredAt: string;
}
