import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'auth' })
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  sessionId: string;

  @Column()
  userId: number;

  @Column({ type: 'timestamp' })
  expireDate: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // before Insert
  @BeforeInsert()
  setExpireDate() {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);
    this.expireDate = expiration;
  }
}
