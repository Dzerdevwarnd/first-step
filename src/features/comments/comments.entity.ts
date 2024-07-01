import { Column, Entity, PrimaryColumn } from 'typeorm';

class CommentatorInfo {
  @Column()
  userId: string;
  @Column()
  userLogin: string;
}

class LikesInfo {
  @Column()
  likesCount: number;
  @Column()
  dislikesCount: number;
}

@Entity()
export class CommentsEntity {
  @PrimaryColumn()
  id: string;
  @Column()
  postId: string;
  @Column()
  content: string;
  @Column()
  createdAt: Date;

  @Column(() => CommentatorInfo)
  commentatorInfo: CommentatorInfo;

  @Column(() => LikesInfo)
  likesInfo: LikesInfo;
}
