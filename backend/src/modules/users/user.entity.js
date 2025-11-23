import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Campaign } from '../campaigns/campaign.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'varchar', unique: true, length: 255 })
  email;

  @Column({ type: 'varchar', length: 255 })
  password;

  @Column({ type: 'varchar', length: 255 })
  name;

  @Column({ type: 'boolean', default: true })
  isActive;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;

  @OneToMany(() => Campaign, (campaign) => campaign.user)
  campaigns;
}
