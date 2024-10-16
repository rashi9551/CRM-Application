import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, Index } from 'typeorm';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDate, IsNumber, IsBoolean } from 'class-validator';
import { User } from './User';
import { Brand } from './Brand';
import { TaskComment } from './TaskComment';
import { Notification } from './Notification';
import { TaskHistory } from './TaskHistory';
import { Inventory } from './inventory';
import { Event } from './Event';


export enum TaskStatus {
    Pending = 'Pending',
    InProgress = 'In Progress',
    Completed = 'Completed'
}

@Entity()
@Index(['assignedTo']) // Index for tasks assigned to a user
@Index(['createdBy']) // Index for the user who created the task
@Index(['brand']) // Index for tasks related to a brand
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @IsNotEmpty({ message: 'Title is required' })
    @IsString({ message: 'Title must be a string' })
    @Column({ name: 'title' })
    title: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @Column({ name: 'description', nullable: true, type: 'text' })
    description?: string;

    @IsNotEmpty({ message: 'Type is required' })
    @IsString({ message: 'Type must be a string' })
    @Column({ name: 'type' }) // Task type: general service, brand-related, event-related, inventory-related
    type: string;

    @Column({ name: 'status', default: TaskStatus.Pending }) // Status: Pending, In Progress, Completed
    status: TaskStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @IsOptional()
    @IsDate({ message: 'Due date must be a valid date' })
    @Column({ name: 'due_date', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' }) // Task deadline
    due_date?: Date; // Use optional chaining for TypeScript

    @IsNotEmpty({ message: 'Assigned to is required' })
    @IsNumber({}, { message: 'Assigned to must be a number' })
    @Column({ name: 'assigned_to', nullable: false })
    assigned_to: number;
    

    // Many tasks can be assigned to a user
    @ManyToOne(() => User, user => user.assignedTasks, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assigned_to' })
    assignedTo: User;

    @IsNotEmpty({ message: 'Created by is required' })
    @IsNumber({}, { message: 'Created by must be a number' })
    @Column({ name: 'created_by', nullable: false })
    created_by: number;

    // A user creates the task
    @ManyToOne(() => User, user => user.createdTasks, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @IsOptional() // Brand ID is now optional
    @IsNumber({}, { message: 'Brand ID must be a number' })
    @Column({ name: 'brand_id', nullable: true })
    brand_id?: number;

    // Relations with Brand, Event, or Inventory depending on task type
    @ManyToOne(() => Brand, brand => brand.tasks, { nullable: true })
    @JoinColumn({ name: 'brand_id' })
    brand?: Brand;

    @IsOptional()
    @IsNumber({}, { message: 'Inventory ID must be a number' })
    @Column({ name: 'inventoryId', nullable: true })
    inventoryId?: number; // Directly storing inventory ID


    @IsOptional()
    @IsNumber({}, { message: 'Event ID must be a number' })
    @Column({ name: 'eventId', nullable: true })
    eventId?: number; // Directly storing event ID

    @ManyToOne(() => Inventory, inventory => inventory.tasks, { nullable: true })
    @JoinColumn({ name: 'inventoryId' })
    inventory?: Inventory;

    // Relationship with Event
    @ManyToOne(() => Event, event => event.tasks, { nullable: true })
    @JoinColumn({ name: 'eventId' })
    event?: Event;

    @OneToMany(() => TaskComment, comment => comment.task, { cascade: true })
    comments: TaskComment[];

    @OneToMany(() => Notification, notification => notification.recipient)
    notifications: Notification[];

    @OneToMany(() => TaskHistory, taskHistory => taskHistory.task)
    history: TaskHistory[]; // Task history records

    @IsOptional()
    @IsBoolean() // Validate that it is a boolean
    @Column({ name: 'sla', default: false }) // Default to false
    sla: boolean; // Service Level Agreement field
}
