import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
    recipient: User;

    @ManyToOne(() => Task, task => task.notifications, { nullable: true })
    task: Task; // Optional task reference if related to a task
}
