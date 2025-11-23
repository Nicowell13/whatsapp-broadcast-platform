import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Campaign } from '../campaigns/campaign.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'varchar', length: 30 })
  recipientPhone;

  @Column({ type: 'varchar', length: 255 })
  recipientName;

  @Column('text')
  content;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status;

  @Column({ type: 'varchar', nullable: true })
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
