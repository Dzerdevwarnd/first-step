import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CommentLikeEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  userId: string;
  @Column()
  commentId: string;
  @Column()
  likeStatus: string;
}
