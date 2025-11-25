import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Campaign } from '../campaigns/campaign.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30 })
  recipientPhone: string;

  @Column({ type: 'varchar', length: 255 })
  recipientName: string;

  @Column('text')
  content: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  wahaMessageId?: string;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Campaign, (campaign) => campaign.messages)
  campaign: Campaign;
}
