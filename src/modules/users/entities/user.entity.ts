import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Following } from './following.entity';
import { Post } from 'src/modules/post/entities/post.entity';
import { Like } from 'src/modules/post/entities/like.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Vote } from 'src/modules/comment/entities/vote.entity';

export enum UserRoles {
  NORMAL_USER = 'NORMAL_USER',
  GOLD_USER = 'GOLD_USER',
  VERIFYED_USER = 'VERIFYED_USER',
  SUPER_USER = 'SUPER_USER',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.NORMAL_USER })
  role: UserRoles;

  @Column({ default: 'Comma User!' })
  bio: string;

  @OneToMany(() => Following, (follow) => follow.follower)
  following: Following[];

  @OneToMany(() => Following, (follow) => follow.following)
  followers: Following[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
