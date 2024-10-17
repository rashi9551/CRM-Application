import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
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

    // Define the recipientId as a foreign key
    @Column()
    recipientId: number; // Store the recipient's user ID

    // Use JoinColumn to specify the recipient relationship with the recipientId
    @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'recipientId' }) // Specify the column to join with
    recipient: User; // Foreign key to the User who receives the notification

    @ManyToOne(() => Task, task => task.notifications, { nullable: true, onDelete: 'SET NULL' }) 
    task: Task;
}
