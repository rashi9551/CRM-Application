import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, JoinColumn } from 'typeorm';
import { Task } from './Task';
import { User } from './User';

@Entity('TaskHistory')
export class TaskHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'taskId', nullable: false }) // Make sure taskId is not nullable
    taskId: number;
    

    // Use JoinColumn to specify the task relationship with the taskId
    @ManyToOne(() => Task, (task) => task.history, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'taskId' }) // Specify the column to join with
    task: Task; // Foreign key to the Task

    @Column({ name: 'userId', nullable: false }) // Set nullable to false
    userId: number;

    // Foreign key to the User who performed the action
    @ManyToOne(() => User, (user) => user.taskHistories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' }) // Specify the column to join with
    user: User; 

    @Column()
    action: string; // Action performed (e.g., created, assigned, status_changed, comment_added)

    @CreateDateColumn()
    createdAt: Date; // Timestamp for when the action occurred

    @Column({ type: 'text' })
    details: string; // Additional details about the action
    static save: jest.Mock<any, any, any>;
}
