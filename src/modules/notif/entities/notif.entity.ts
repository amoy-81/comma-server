import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotifSubject {
  Post = 'POST',
  Like = 'LIKE',
  Comment = 'COMMENT',
  Vote = 'VOTE',
  Follow = 'FOLLOW',
}

@Entity('notif')
export class Notif {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column()
  senderId: number;

  @ManyToOne(() => User, (user) => user.sentNotifications)
  sender: User;

  @Column()
  receiverId: number;

  @ManyToOne(() => User, (user) => user.receivedNotifications)
  receiver: User;

  @Column()
  subject: NotifSubject;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
