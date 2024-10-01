// src/entities/BrandOwnership.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Brand } from './Brand';
import { User } from './User';

@Entity()
export class BrandOwnership {
    @PrimaryGeneratedColumn() // This will create an auto-incrementing integer ID
    id: number;

    @ManyToOne(() => Brand, brand => brand.brandOwnerships)
    brand: Brand;

    @ManyToOne(() => User, user => user.brandOwnerships)
    boUser: User;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
