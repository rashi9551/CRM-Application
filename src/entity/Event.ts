import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Task } from './Task';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ nullable: true })
    location?: string;

    @Column({ type: 'text', nullable: true })
    details?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // One event can be associated with many tasks
    @OneToMany(() => Task, task => task.event) // Assuming a task can relate to one event
    tasks: Task[];
}
