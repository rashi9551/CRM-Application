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

    @ManyToOne(() => User, user => user.team, { nullable: false })
    @JoinColumn({ name: 'to_user_id' }) // This specifies the foreign key column in the Team table
    teamOwner: User;

    @OneToMany(() => User, user => user.team)
    users: User[]; // This will hold the users associated with the team

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
