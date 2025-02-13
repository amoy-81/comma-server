import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ForbiddenWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  word: string;
}
