import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PostEntity } from '../posts.entity';

@Entity()
export class PostLikesEntity {
  @Column()
  userId: string;
  @Column()
  likeStatus: string;
  @Column()
  login: string;
  @PrimaryColumn()
  addedAt: Date;

  @ManyToOne(() => PostEntity)
  @JoinColumn({ name: 'postId' })
  post: { PostEntity };
  @Column()
  postId: string;
}
