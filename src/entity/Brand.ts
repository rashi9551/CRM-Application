// src/entities/Brand.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BrandContact } from './BrandContact';
import { BrandOwnership } from './BrandOwnership';

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

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @OneToMany(() => BrandContact, brandContact => brandContact.brand)
    contacts: BrandContact[];

    @OneToMany(() => BrandOwnership, brandOwnership => brandOwnership.brand)
    brandOwnerships: BrandOwnership[];
}
