import { User } from '../../../modules/users/entities/user.entity';
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
import { Poster } from '../../../modules/theme/entities/poster.entity';

@Entity({ name: 'news_paper' })
export class NewsPaper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'My Daily News' })
  title: string;

  @Column({ default: 'Discover the latest stories and updates of the day.' })
  description: string;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ name: 'posterId', default: 1 })
  posterId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Poster, (poster) => poster.newsPapers)
  @JoinColumn({ name: 'posterId' })
  poster: Poster;

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
