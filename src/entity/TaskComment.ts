import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
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

    @Column({ name: 'task_id', nullable: false })
    taskId: number;

    @Column({ name: 'user_id', nullable: false })
    userId: number;

    // The task the comment belongs to (relationship with Task entity)
    @ManyToOne(() => Task, task => task.comments, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'task_id' })
    task: Task;
    
    // The user who posted the comment
    @ManyToOne(() => User, user => user.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}