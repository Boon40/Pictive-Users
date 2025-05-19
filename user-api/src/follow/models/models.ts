import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/models/models';

@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  follower_id: string;

  @Column()
  followed_id: string;

  @Column({ default: false })
  is_approved: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'followed_id' })
  followed: User;
}
