import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BlogsEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: Date;
  @Column()
  isMembership: boolean;
}
