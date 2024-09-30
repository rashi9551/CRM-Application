// src/entities/UserTeam.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './User';
import { Team } from './Team';

@Entity()
export class UserTeam {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.userTeams)
    user: User;

    @ManyToOne(() => Team, team => team.id)
    team: Team;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
