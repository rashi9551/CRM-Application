import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    BeforeInsert,
    BeforeUpdate,
    Index,
    JoinColumn
} from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { BrandOwnership } from './BrandOwnership';
import { RoleName } from '../interfaces/interface';
import { Team } from './Team'; // Import the Team entity

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty({ message: 'Name should not be empty.' })
    name: string;

    @Column()
    @IsNotEmpty({ message: 'Department should not be empty.' })
    department: string;

    @Column({ name: 'phone_number' })
    phoneNumber: string;

    @Column({ unique: true })
    @IsEmail({}, { message: 'Email is not valid.' })
    email: string;

    @Column()
    password: string;

    @Column({ name: 'createdAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column('simple-array', { nullable: true })
    roles: RoleName[];

    @Column({ name: 'parentId', nullable: true })
    parentId: number;

    @ManyToOne(() => User, user => user.children, { nullable: true, onDelete: 'SET NULL' })
    @Index()
    parent: User;

    @OneToMany(() => User, user => user.parent)
    children: User[];

    @OneToMany(() => BrandOwnership, brandOwnership => brandOwnership.boUser)
    brandOwnerships: BrandOwnership[];

    @Column({ name: 'team_id', nullable: true })
    teamId: number; // This will store the team ID

    @ManyToOne(() => Team, team => team.users, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'team_id' }) // This specifies the foreign key column in the User table
    team: Team;

    @OneToMany(() => Team, team => team.teamOwner) // Relation to owned teams
    userTeams: Team[]; // Teams owned by this user

    
    
}
