import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Campaign } from '../campaigns/campaign.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ unique: true })
  email;

  @Column()
  password;

  @Column()
  name;

  @Column({ default: true })
  isActive;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;

  @OneToMany(() => Campaign, (campaign) => campaign.user)
  campaigns;
}
