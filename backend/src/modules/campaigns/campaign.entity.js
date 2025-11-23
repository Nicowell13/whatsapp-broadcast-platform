import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Message } from '../messages/message.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'varchar', length: 255 })
  name;

  @Column('text', { nullable: true })
  message;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status; 

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt;

  @Column({ type: 'int', default: 0 })
  totalRecipients;

  @Column({ type: 'int', default: 0 })
  sentCount;

  @Column({ type: 'int', default: 0 })
  failedCount;

  @Column({ type: 'int', default: 0 })
  deliveredCount;

  @Column({ type: 'varchar', nullable: true })
  sessionId;

  @Column({ type: 'varchar', nullable: true })
  imageUrl;

  @Column('simple-json', { nullable: true })
  buttons;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;

  @ManyToOne(() => User, (user) => user.campaigns)
  user;

  @OneToMany(() => Message, (message) => message.campaign)
  messages;
}
