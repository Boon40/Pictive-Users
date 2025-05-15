import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  follower_id: string;

  @Column()
  followed_id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: false })
  isApproved: boolean;
}
