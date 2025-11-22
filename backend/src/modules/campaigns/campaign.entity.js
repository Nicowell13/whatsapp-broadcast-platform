import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Message } from '../messages/message.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  name;

  @Column('text', { nullable: true })
  message;

  @Column({ default: 'draft' }) // draft, scheduled, sending, completed, failed
  status;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt;

  @Column({ default: 0 })
  totalRecipients;

  @Column({ default: 0 })
  sentCount;

  @Column({ default: 0 })
  failedCount;

  @Column({ default: 0 })
  deliveredCount;

  @Column({ nullable: true })
  sessionId; // WAHA session ID

  @Column({ nullable: true })
  imageUrl; // URL gambar untuk broadcast

  @Column('simple-json', { nullable: true })
  buttons; // Array buttons [{ text: 'Text', url: 'https://...' }]

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;

  @ManyToOne(() => User, (user) => user.campaigns)
  user;

  @OneToMany(() => Message, (message) => message.campaign)
  messages;
}
