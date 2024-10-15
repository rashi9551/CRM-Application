import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { Task } from './Task'; // Assuming the Task entity is defined in Task.ts
import { User } from './User'; // Assuming the User entity is defined in User.ts

@Entity('TaskHistory')
export class TaskHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Task, (task) => task.history, { onDelete: 'CASCADE' })
    task: Task; // Foreign key to the Task

    @ManyToOne(() => User, (user) => user.taskHistories)
    user: User; // Foreign key to the User who performed the action

    @Column()
    action: string; // Action performed (e.g., created, assigned, status_changed, comment_added)

    @CreateDateColumn()
    createdAt: Date; // Timestamp for when the action occurred

    @Column({ type: 'text' })
    details: string; // Additional details about the action
}
