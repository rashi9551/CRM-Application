import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class FcmToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    fcmToken: string; // The FCM token

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date; // When the token was created

    @CreateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date; // When the token was last updated

    @Column({ name: 'user_id', nullable: false })
    userId: number; // Foreign key to associate the token with a user

    // Relationship with the User entity
    @ManyToOne(() => User, user => user.fcmTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User; // User who owns this FCM token
}
