import { Post } from 'src/modules/post/entities/post.entity';
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
import { Vote } from './vote.entity';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Vote, (vote) => vote.comment)
  votes: Vote[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  hasVoted: boolean;
}
