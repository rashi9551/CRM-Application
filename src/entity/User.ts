// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './Role';
import { UserTeam } from './UserTeam';
import { BrandOwnership } from './BrandOwnership';

@Entity()
export class User {
    @PrimaryGeneratedColumn() // This will create an auto-incrementing integer ID
    id: number;

    @Column()
    name: string;

    @Column()
    department: string;

    @Column({ name: 'phone_number' })
    phoneNumber: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;  // Added password field

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @OneToMany(() => Role, role => role.user)
    roles: Role[];

    @OneToMany(() => UserTeam, userTeam => userTeam.user)
    userTeams: UserTeam[];

    @ManyToOne(() => User, user => user.children)
    @JoinColumn({ name: 'parent_id' })  // This column references the parent user
    parent: User;

    @OneToMany(() => User, user => user.parent)
    children: User[];

    @OneToMany(() => BrandOwnership, brandOwnership => brandOwnership.boUser)
    brandOwnerships: BrandOwnership[];
}
