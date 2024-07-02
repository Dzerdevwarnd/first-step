import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class CommentLikeEntity {
  @PrimaryColumn()
  userId: string;
  @Column()
  commentId: string;
  @Column()
  likeStatus: string;
}
