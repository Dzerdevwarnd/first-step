import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BlogsEntity } from '../blogs/blogs.entity';

class LikesInfo {
  @Column()
  likesCount: number;
  @Column()
  dislikesCount: number;
}
@Entity()
export class PostEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column()
  blogName: string;
  @Column()
  createdAt: Date;

  @Column(() => LikesInfo)
  likesInfo: LikesInfo;

  @ManyToOne(() => BlogsEntity)
  @JoinColumn({ name: 'blogId' })
  blog: BlogsEntity;

  @Column()
  blogId: string;
}
