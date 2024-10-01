import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { User } from './User';

@Entity('Team') // Ensure this matches the table name in your database
export class Team {
    @PrimaryGeneratedColumn() // Auto-incrementing integer ID
    id: number;

    @ManyToOne(() => User, user => user.userTeams) // Relation to User
    @Index() 
    toUser: User; // Foreign key reference to User

    @Column({ name: 'createdAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
