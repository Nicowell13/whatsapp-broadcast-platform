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

  // ===============================
  // Recipient Info
  // ===============================

  @Column({ type: 'varchar', length: 30 })
  recipientPhone: string;

  @Column({ type: 'varchar', length: 255 })
  recipientName: string;

  // ===============================
  // Message Content
  // ===============================

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'error';

  // WhatsApp / WAHA reference (optional)
  @Column({ type: 'varchar', length: 255, nullable: true })
  wahaMessageId: string | null;

  // errorMessage → legacy field (keep for compatibility)
  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  // ===============================
  // NEW FIELDS REQUIRED BY PROCESSOR
  // ===============================

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta: any | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  // ===============================
  // Timestamps
  // ===============================

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  // ===============================
  // Relations
  // ===============================

  @ManyToOne(() => Campaign, (campaign) => campaign.messages, {
    onDelete: 'CASCADE',
  })
  campaign: Campaign;
}
