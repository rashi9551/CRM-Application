import { In, Like, Repository } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import { Team } from '../../entity/Team';
import { Brand } from '../../entity/Brand';
import { RoleName, UserData } from '../../interfaces/interface';
import { buildTree } from '../../middleware/buildTree';


export default new class UserRepo {

    private UserRepo: Repository<User>;
    private TeamRepo: Repository<Team>;
    private BrandRepo: Repository<Brand>;

    constructor() {
        this.UserRepo = AppDataSource.getRepository(User);
        this.TeamRepo = AppDataSource.getRepository(Team);
        this.BrandRepo = AppDataSource.getRepository(Brand);
    }

     // Existing method to find a user by ID
     findUserById = async (userId: number): Promise<User | null> => {
        return await this.UserRepo.findOne({ where: { id: userId } });
    };
    saveUser = async (updatedData: User,isExistingTo?:boolean): Promise<User | null> => {
        try {
            
            if (updatedData.roles.includes(RoleName.TO) && !isExistingTo) {
                const team = this.TeamRepo.create({ toUserId: updatedData.id });
                const savedTeam = await this.TeamRepo.save(team);
                updatedData.teamId = savedTeam.id;
                await this.UserRepo.save(updatedData);
            } else if (updatedData.teamId !== undefined) {
                const existingTeam = await this.TeamRepo.findOne({ where: { id: updatedData.teamId } });
                console.log(existingTeam,"=-=-=-");
                
                if (!existingTeam) {
                    console.log("tem id deosnteixst");
                    throw new Error("Specified team does not exist.");
                }
                updatedData.teamId = existingTeam.id;
                await this.UserRepo.save(updatedData);
            }else{
                throw new Error("even TO role not will be there and the teamOwner will not be there wil violate the tre");

            }
            
            return updatedData;
        } catch (error) {
            throw new Error("Failed to save user: " + error.message);
        }
    };
    // Find a user by email
    async findUserByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.UserRepo.findOne({
                where: { email },
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
                password: userData.password, // You should hash the password here
                parentId: userData.parentId,
                roles: userData.roles,
            });
    
            // Save the user
            const savedUser = await this.UserRepo.save(user);
    
            // Check if the user has the TO role
            if (userData.roles.includes(RoleName.TO)) {
                // Create a new team and assign this user as the team owner
                const team = this.TeamRepo.create({ toUserId: savedUser.id }); // Store team owner ID
                const savedTeam = await this.TeamRepo.save(team);
                // Assign the team ID to the user
                savedUser.teamId = savedTeam.id; // Assuming you have a `teamId` field in User entity
                await this.UserRepo.save(savedUser); // Update the user with the team reference
            } else if (userData.teamId !== undefined){
                // If not a TO user, check for an existing team ID and assign it to the user
                const existingTeam = await this.TeamRepo.findOne({ where: { id: userData.teamId } });
                if (!existingTeam) {
                    throw new Error("Specified team does not exist.");
                }
                savedUser.teamId = existingTeam.id; // Assign the existing team's ID to the user
                await this.UserRepo.save(savedUser); // Update the user with the team reference
            }
    
            return savedUser; // Return the saved user
        } catch (error) {
            console.error("Error creating user by data:", error);
            throw error; 
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
            where: {
                roles: In([roleName]), // Check if roleName is included in the roles array
            },
        });
        
        return user;
    };
    getAllTeam = async (): Promise<Team[] | null> => {
        try {
            const teams = await this.TeamRepo
                .createQueryBuilder('team')
                .leftJoinAndSelect('team.users', 'user') // Join with users to get team members
                .leftJoinAndSelect('team.teamOwner', 'owner') // Join with team owner
                .getMany(); // Fetch all teams with their details

            return teams;
        } catch (error) {
            console.error("Error fetching teams:", error);
            throw new Error("Failed to retrieve teams");
        }
    };
    async getUsersWithRoleTO(roleName:RoleName): Promise<User[]> {
        try {
            const usersWithToRole = await this.UserRepo
            .createQueryBuilder('user')
                .where('user.roles LIKE :role', { role: '%TO%' }) // Using LIKE for simple array
                .getMany();

            return usersWithToRole;
        } catch (error) {
            console.error(`Error fetching users with role ${roleName}:`, error);
            throw new Error(`Failed to retrieve users with role ${roleName}`);
        }
    }
    
    getUserById = async (id: number): Promise<User | null> => {
        try {
            return await this.UserRepo.findOne({
                where: { id },
                relations: [
                    'team',
                    'team.teamOwner',         // Fetch the owner of the team correctly
                    'brandOwnerships',
                    'parent',
                    'children'
                ] });
        } catch (error) {
            console.error(`Error fetching user with ID ${id}:`, error);
            throw new Error('Error fetching user data');
        }
    };

    async checkForCycle(userId: number, newParentId: number): Promise<boolean> {
        const users = await this.UserRepo.find(); // Fetch the user tree similar to fetching the full organization tree
        // Step 2: Create a map of users for easy lookup
        const userMap = new Map<number, User>();
        users.forEach(user => userMap.set(user.id, user));
    
        // Step 3: Check if newParentId is a descendant of userId
        const isDescendant = (currentUserId: number | null): boolean => {
            if (currentUserId === null) return false; // No parent
    
            const currentUser = userMap.get(currentUserId);
            if (!currentUser) return false; // User not found
    
            // If currentUserId is the new parent, cycle detected
            if (currentUserId === newParentId) {
                return true; // Cycle detected
            }
    
            // Recursively check the parent
            return isDescendant(currentUser.parentId);
        };
    
        // Step 4: Perform the check starting from the new parent
        return isDescendant(newParentId); // Check if newParentId is a descendant of userId
    }

    // Method to create a brand instance
    createBrand = (brandData: Partial<Brand>): Brand => {
        return this.BrandRepo.create(brandData);
    };

    // Method to save the brand to the database with error handling
    saveBrand = async (brand: Brand): Promise<Brand | null> => {
        try {
            return await this.BrandRepo.save(brand);
        } catch (error) {
            console.error("Error saving brand:", error);
            throw new Error("Failed to save brand");
        }
    };
    // Method to save the brand to the database with error handling
    findBrandByName = async (brandName: string): Promise<Brand | null> => {
        try {
            const lowerCaseBrandName = brandName.toLowerCase();

            return await this.BrandRepo.createQueryBuilder("brand")
                .where("LOWER(brand.brandName) = LOWER(:name)", { name: lowerCaseBrandName })
                .getOne();
        } catch (error) {
            console.error("Error finding brand by name:", error);
            throw new Error("Failed to find brand by name");
        }
    };
    findBrandByID = async (id: number): Promise<Brand | null> => {
        try {
            // Find the brand by ID
            const brand = await this.BrandRepo.findOne({ where: { id } });
            return brand || null; // Return the brand if found, otherwise null
        } catch (error) {
            console.error("Error finding brand by ID:", error);
            throw new Error("Failed to find brand");
        }
    };
    getAllBrand = async (): Promise<Brand[] | null> => {
        try {
            // Retrieve all brands along with their related BrandContact and BrandOwnership
            const brands = await this.BrandRepo.find({
                relations: ['contacts', 'brandOwnerships'],
            });

            return brands; // Return the list of brands
        } catch (error) {
            console.error("Error fetching all brands:", error);
            throw new Error("Failed to fetch all brands");
        }
    };
    getBrand = async (id: number): Promise<Brand | null> => {
        try {
            // Retrieve a single brand by ID along with its related BrandContact and BrandOwnership
            const brand = await this.BrandRepo.findOne({
                where: { id }, // Use the where clause to specify the ID
                relations: ['contacts', 'brandOwnerships'], // Include relations
            });
    
            return brand; // Return the single brand or null if not found
        } catch (error) {
            console.error("Error fetching brand:", error);
            throw new Error("Failed to fetch brand");
        }
    };
    
    
    
    
    
    
    
};
