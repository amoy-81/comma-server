import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NewsPaperSection } from './news-paper-section.entity';

@Entity({name: 'news_paper'})
export class NewsPaper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.newsPapers)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(
    () => NewsPaperSection,
    (newsPaperSection) => newsPaperSection.newsPaper,
  )
  @JoinColumn({ name: 'sections' })
  sections: NewsPaperSection[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
