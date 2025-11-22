import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Campaign } from '../campaigns/campaign.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  recipientPhone;

  @Column()
  recipientName;

  @Column('text')
  content;

  @Column({ default: 'pending' }) // pending, queued, sent, delivered, failed
  status;

  @Column({ nullable: true })
  wahaMessageId;

  @Column('text', { nullable: true })
  errorMessage;

  @Column({ type: 'timestamp', nullable: true })
  sentAt;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt;

  @CreateDateColumn()
  createdAt;

  @ManyToOne(() => Campaign, (campaign) => campaign.messages)
  campaign;
}
