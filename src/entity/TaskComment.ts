import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Task } from './Task';
import { User } from './User';

@Entity()
export class TaskComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    comment: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ type: 'text', nullable: true })
    filePath?: string;

    // The task the comment belongs to
    @ManyToOne(() => Task, task => task.comments, { onDelete: 'CASCADE' })
    task: Task;

    // The user who posted the comment
    @ManyToOne(() => User, user => user.comments, { onDelete: 'CASCADE' })
    user: User;
}