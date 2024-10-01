// src/entities/Team.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Team {
    @PrimaryGeneratedColumn() // This will create an auto-incrementing integer ID
    id: number;

    @ManyToOne(() => User, user => user.userTeams)
    toUser: User;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
