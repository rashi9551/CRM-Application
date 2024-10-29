import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index, Column } from 'typeorm';
import { Task } from './Task';
import { User } from './User';

@Entity()
@Index(['task', 'user'], { unique: true }) // Ensure unique task-user pair
export class Contributes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    taskId: number;

    @Column()
    userId: number;

    // Each contribution is associated with one task
    @ManyToOne(() => Task, task => task.contributions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'taskId' })
    task: Task;

    // Each contribution is associated with one user
    @ManyToOne(() => User, user => user.contributions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
