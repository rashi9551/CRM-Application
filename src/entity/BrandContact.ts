// src/entities/BrandContact.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Brand } from './Brand';

@Entity()
export class BrandContact {
    @PrimaryGeneratedColumn() // This will create an auto-incrementing integer ID
    id: number;

    @ManyToOne(() => Brand, brand => brand.contacts)
    brand: Brand;

    @Column({ name: 'contact_person_name' })
    contactPersonName: string;

    @Column({ name: 'contact_person_phone' })
    contactPersonPhone: string;

    @Column({ name: 'contact_person_email' })
    contactPersonEmail: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
