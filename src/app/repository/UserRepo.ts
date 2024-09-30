import { In, Repository } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';

export default new class UserRepo {
    
    private UserRepo: Repository<User>;

    constructor() {
        this.UserRepo = AppDataSource.getRepository(User);
    }

    // Find a user by email
    async findUserByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.UserRepo.findOne({
                where: { email },
                relations: ['roles'], // Fetch the associated roles
            });
    
            return user; 
        } catch (error) {
            console.error("Error finding user by email:", error);
            throw error; 
        }
    }
};
