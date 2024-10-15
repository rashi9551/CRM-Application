import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BrandContact } from './BrandContact';
import { BrandOwnership } from './BrandOwnership';
import { Task } from './Task';

@Entity()
export class Brand {
    @PrimaryGeneratedColumn() // This will create an auto-incrementing integer ID
    id: number;

    @Column({ name: 'brand_name' })
    brandName: string;

    @Column({ type: 'decimal' })
    revenue: number;

    @Column({ name: 'deal_closed_value', type: 'decimal' })
    dealClosedValue: number;

    @Column({ name: 'createdAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    // Cascade delete on BrandContact entities
    @OneToMany(() => BrandContact, brandContact => brandContact.brand, { cascade: true, onDelete: 'CASCADE' })
    contacts: BrandContact[];

    // Cascade delete on BrandOwnership entities
    @OneToMany(() => BrandOwnership, brandOwnership => brandOwnership.brand, { cascade: true, onDelete: 'CASCADE' })
    brandOwnerships: BrandOwnership[];

    @OneToMany(() => Task, task => task.brand)
    tasks: Task[];
}
