import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Task } from './Task';

@Entity()
export class Inventory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column()
    quantity: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // One inventory item can be associated with many tasks
    @OneToMany(() => Task, task => task.inventory) // Assuming a task can relate to one inventory item
    tasks: Task[];
}
