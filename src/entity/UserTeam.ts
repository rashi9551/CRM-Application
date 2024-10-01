// src/entities/UserTeam.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './User';
import { Team } from './Team';

@Entity()
export class UserTeam {
    @PrimaryGeneratedColumn() // This will create an auto-incrementing integer ID
    id: number;

    @ManyToOne(() => User, user => user.userTeams)
    user: User;

    @ManyToOne(() => Team, team => team.id)
    team: Team;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
