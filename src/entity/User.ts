import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn,
    BeforeInsert,
    BeforeUpdate,
    Index
} from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Role } from './Role';
import { UserTeam } from './UserTeam';
import { BrandOwnership } from './BrandOwnership';

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

    @OneToMany(() => Role, role => role.user)
    roles: Role[];

    @OneToMany(() => UserTeam, userTeam => userTeam.user)
    userTeams: UserTeam[];

    @Column({ name: 'parentId', nullable: true })
    parentId: number;


    @ManyToOne(() => User, user => user.children, { nullable: true, onDelete: 'SET NULL' })
    @Index() 
    parent: User;

    @OneToMany(() => User, user => user.parent)
    children: User[];

    @OneToMany(() => BrandOwnership, brandOwnership => brandOwnership.boUser)
    brandOwnerships: BrandOwnership[];

    @BeforeInsert()
    @BeforeUpdate()
    validateEmail() {
        if (!this.email || this.email.trim() === '') {
            throw new Error('Email cannot be empty.');
        }
    }
}
