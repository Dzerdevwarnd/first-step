import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Question {
  @PrimaryColumn()
  id: string;

  @Column()
  body: string;
  @Column('text', { array: true })
  correctAnswers: string[];
  @Column()
  published: boolean;
  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;
}
////
