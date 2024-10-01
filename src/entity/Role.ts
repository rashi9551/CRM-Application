// src/entities/Role.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { RoleName } from '../interfaces/interface';


@Entity()
export class Role {
    @PrimaryGeneratedColumn() // This will create an auto-incrementing integer ID
    id: number;

    @Column({ name: 'role_name', type: 'enum', enum: ['ADMIN', 'PO', 'BO', 'TO'] })
    roleName: RoleName;

    @ManyToOne(() => User, user => user.roles, { onDelete: 'CASCADE' }) // Optional: cascade on delete
    @JoinColumn({ name: 'user_id' }) // Optional: specify the foreign key column name
    user: User;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
