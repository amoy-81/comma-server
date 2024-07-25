import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'likes' })
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ name: 'post_id' })
  postId: number;

  @ManyToOne(() => Post, (post) => post.like)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
