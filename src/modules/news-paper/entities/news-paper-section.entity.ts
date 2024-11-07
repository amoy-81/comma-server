import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NewsPaper } from './news-paper.entity';

export enum NewsPaperSectionType {
  TopNewsCard = 'TopNewsCard',
  NewsSummarySection = 'NewsSummarySection',
  FullArticleSection = 'FullArticleSection',
  HeaderBanner = 'HeaderBanner',
}

@Entity({ name: 'news_paper_section' })
export class NewsPaperSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'news_paper_id' })
  newsPaperId: number;

  @ManyToOne(() => NewsPaper, (newPaper) => newPaper.sections)
  newsPaper: NewsPaper;

  @Column({ type: 'enum', enum: NewsPaperSectionType })
  type: NewsPaperSectionType;

  @Column('text', { array: true })
  title: string[];

  @Column()
  image: string;

  @Column('text', { array: true })
  paragraph: string[];

  @Column()
  order: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
