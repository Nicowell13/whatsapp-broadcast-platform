import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  name;

  @Column()
  phone; // Format: 628123456789

  @Column({ nullable: true })
  email;

  @Column('simple-json', { nullable: true })
  customFields;

  @Column({ default: true })
  isActive;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}
