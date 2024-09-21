import { v4 as uuidv4 } from 'uuid';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Chat } from './chat.entity';

@Entity({ name: 'chat_room' })
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: null })
  avatar: string | null;

  @Column({ name: 'owner' })
  owner_id: number;

  @Column({ name: 'admins', type: 'int', array: true, default: [] })
  admins_id: number[];

  @Column({ name: 'members', type: 'int', array: true, default: [] })
  members_id: number[];

  @Column({ type: 'varchar', default: uuidv4(), unique: true })
  invite_link: string;

  // relashins
  @ManyToOne(() => User, (user) => user.chatRooms)
  @JoinColumn({ name: 'owner' })
  owner: User;

  @JoinColumn({ name: 'admins' })
  @ManyToMany(() => User, (user) => user.managesGroup)
  admins: User[];

  @JoinColumn({ name: 'members' })
  @ManyToMany(() => User, (user) => user.groups)
  members: User[];

  @JoinColumn({ name: 'chats' })
  @OneToMany(() => Chat, (repo) => repo.room)
  messages: Chat[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
