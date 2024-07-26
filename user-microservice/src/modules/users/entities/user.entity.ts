import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Following } from './following.entity';

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

  @Column()
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

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
