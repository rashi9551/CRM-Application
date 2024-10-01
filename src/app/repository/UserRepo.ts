import { Repository } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import { Role } from '../../entity/Role';
import { Team } from '../../entity/Team';
import { UserTeam } from '../../entity/UserTeam';
import { RoleName, UserData } from '../../interfaces/interface';


export default new class UserRepo {

    private UserRepo: Repository<User>;
    private RoleRepo: Repository<Role>;
    private TeamRepo: Repository<Team>;
    private UserTeamRepo: Repository<UserTeam>;

    constructor() {
        this.UserRepo = AppDataSource.getRepository(User);
        this.RoleRepo = AppDataSource.getRepository(Role);
        this.TeamRepo = AppDataSource.getRepository(Team);
        this.UserTeamRepo = AppDataSource.getRepository(UserTeam);
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

    // Create new user and validate roles
    async createUser(userData: UserData): Promise<User> {
        try {
            // Create the new user entity
            const user = this.UserRepo.create({
                name: userData.name,
                department: userData.department,
                phoneNumber: userData.phoneNumber,
                email: userData.email,
                password: userData.password // You should hash the password here
            });

            // Save the user and roles

            return user
        } catch (error) {
            console.error("Error creating user by data:", error);
            throw error; 
        }
    }

    // Save user and assign roles
    async saveUser(user: User, roles: RoleName[],teamOwner:number): Promise<void> {
        try {
            // Save the user first
            const savedUser = await this.UserRepo.save(user);
    
            // Create role entities
            const rolesToSave = roles.map(roleName => ({
                roleName,
                user: savedUser,
            }));
    
            // Batch insert roles
            await this.RoleRepo.save(rolesToSave);
    
            let savedTeam:Team;

            // Automatically create a team if the user has the TO role
            if (roles.includes(RoleName.TO)) {
                const team = this.TeamRepo.create({ toUser: savedUser });
                savedTeam = await this.TeamRepo.save(team);
            } else {
                // If no TO role, fetch the existing team using teamOwner
                savedTeam = await this.TeamRepo.findOne({ where: { id: teamOwner } });
                if (!savedTeam) {
                    throw new Error("Specified team does not exist for the user.");
                }
            }

            // Add user to their team
            const userTeam = this.UserTeamRepo.create({
                user: savedUser,
                team: savedTeam,
            });
            await this.UserTeamRepo.save(userTeam);
        } catch (error) {
            console.error("Error saving user and assigning roles:", error);
            throw new Error("Failed to save user and assign roles.");
        }
    }
    
    
};
