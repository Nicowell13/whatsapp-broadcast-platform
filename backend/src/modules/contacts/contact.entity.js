import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'varchar', length: 255 })
  name;

  @Column({ type: 'varchar', length: 30 })
  phone; // Format: 628123456789

  @Column({ type: 'varchar', nullable: true, length: 255 })
  email;

  @Column('simple-json', { nullable: true })
  customFields;

  @Column({ type: 'boolean', default: true })
  isActive;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}
