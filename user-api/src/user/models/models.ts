import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, { lazy: true })
  user: Promise<User>;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: false })
  is_private: boolean;

  @Column()
  credential_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Credential, { lazy: true })
  @JoinColumn({ name: 'credential_id' })
  credential: Promise<Credential>;
} 