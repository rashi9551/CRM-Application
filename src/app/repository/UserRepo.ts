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
                password: userData.password ,// You should hash the password here
                parentId:userData.parentId
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
            } else if(teamOwner){
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


    async userExist(userId: number): Promise<User> {
        try {
            const user = await this.UserRepo.findOne({ where: { id: userId } });
            return user; // Return true if the user exists, false otherwise
        } catch (error) {
            console.error('Error checking user existence:', error);
            throw new Error('Unable to check user existence.'); // Throw a more user-friendly error
        }
    }

    async getUserTree(rootUserId?: number): Promise<User[]> {
        try {
            if (rootUserId) {
                // Fetch a specific user by ID and their children
                const user = await this.UserRepo.findOne({
                    where: { id: rootUserId },
                    relations: ['children'],
                });
                return user ? [user] : []; // Return an array with the user or an empty array if not found
            }
    
            // Fetch all root users (those without a parent)
            const rootUsers = await this.UserRepo.find({
                where: { parentId: null },
                relations: ['children'],
            });
            return rootUsers;
        } catch (error) {
            console.error("Error fetching the user tree:", error);
            throw error;
        }
    }


    findUserByRole = async (roleName: RoleName): Promise<User | null> => {
        const user = await this.UserRepo.findOne({
            relations: ["roles"], // Ensure to load roles
            where: {
                roles: {
                    roleName, // Assuming 'roleName' is the correct field in the 'roles' relationship
                },
            },
        });
    
        return user;
    };
    getUserById = async (id: number): Promise<User | null> => {
        try {
            return await this.UserRepo.findOne({
                where: { id },
                relations: ['roles', 'userTeams', 'brandOwnerships', 'parent', 'children'] // Load related entities
            });
        } catch (error) {
            console.error(`Error fetching user with ID ${id}:`, error);
            throw new Error('Error fetching user data');
        }
    };
    
    
    
    
    
};
