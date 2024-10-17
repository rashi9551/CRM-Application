import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';
@Entity()
export class Team {
    @PrimaryGeneratedColumn() // This will create an auto-incrementing integer ID
    id: number;

    @Column({ name: 'to_user_id' })
    toUserId: number; // This will store the ID of the team owner (User)

    @ManyToOne(() => User, user => user.userTeams, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'to_user_id' })
    teamOwner: User;

    @OneToMany(() => User, user => user.team, { onDelete: 'CASCADE' }) // Cascade delete for users in this team
    users: User[]; 
    
    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
