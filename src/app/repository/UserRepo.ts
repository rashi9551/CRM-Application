import { In, Like, Repository } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import { Team } from '../../entity/Team';
import { Brand } from '../../entity/Brand';
import { GetAllUser, BrandContactData, BrandData, BrandOwnershipData, RoleName, UserData, InventoryData, EventData, PromiseReturn } from '../../interfaces/interface';
import { BrandContact } from '../../entity/BrandContact';
import { BrandOwnership } from '../../entity/BrandOwnership';
import bcrypt from 'bcryptjs';
import { Event } from '../../entity/Event';
import { Inventory } from '../../entity/inventory';
import { StatusCode } from '../../interfaces/enum';


export default new class UserRepo {

    private UserRepo: Repository<User>;
    private TeamRepo: Repository<Team>;
    private BrandRepo: Repository<Brand>;
    private BrandContactRepo: Repository<BrandContact>;
    private BrandOwnershipRepo: Repository<BrandOwnership>;
    private InventoryRepo: Repository<Inventory>;
    private EventRepo: Repository<Event>;

    constructor() {
        this.UserRepo = AppDataSource.getRepository(User);
        this.TeamRepo = AppDataSource.getRepository(Team);
        this.BrandRepo = AppDataSource.getRepository(Brand);
        this.BrandContactRepo = AppDataSource.getRepository(BrandContact);
        this.BrandOwnershipRepo = AppDataSource.getRepository(BrandOwnership);
        this.BrandOwnershipRepo = AppDataSource.getRepository(BrandOwnership);
        this.InventoryRepo = AppDataSource.getRepository(Inventory);
        this.EventRepo = AppDataSource.getRepository(Event);
    }

     // Existing method to find a user by ID
     findUserById = async (userId: number): Promise<User | null> => {
        try{
            const user = await this.UserRepo.findOne({
                where: { id: userId },
                relations: ['team'], // Fetch the related 'team' entity
            });
        
            return user; 
        } catch (error) {
            throw new Error("Failed to find user by id: " + error.message);
        }  
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
                
                if (!existingTeam) {
                    console.log("tem id deosnteixst");
                    throw new Error("Specified team does not exist.");
                }
                updatedData.teamId = existingTeam.id;
                await this.UserRepo.save(updatedData);
            }else{
                throw new Error("even TO role not will be there and the teamId will not be there wil violate the tre");

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
            const hashedPassword = await bcrypt.hash(userData.password, 10); // 10 is the salt rounds
            // Create the new user entity
            const user = this.UserRepo.create({
                name: userData.name,
                department: userData.department,
                phoneNumber: userData.phoneNumber,
                email: userData.email,
                password: hashedPassword, // You should hash the password here
                parentId: userData.parentId,
                roles: userData.roles,
                teamId:userData.teamId
            });
    
            // Save the user
            const savedUser = await this.UserRepo.save(user);
    
            // Check if the user has the TO role
            if (userData.roles.includes(RoleName.TO)) {
                // Create a new team and assign this user as the team owner
                const team = this.TeamRepo.create({ toUserId: savedUser.id }); // Store team owner ID
                const savedTeam = await this.TeamRepo.save(team);
                // Assign the team ID to the user
                if(!userData.teamId){
                    savedUser.teamId = savedTeam.id; // Assuming you have a `teamId` field in User entity
                }
                await this.UserRepo.save(savedUser); // Update the user with the team reference
            } else if (userData.teamId !== undefined){
                // If not a TO user, check for an existing team ID and assign it to the user
                const existingTeam = await this.TeamRepo.findOne({ where: { id: userData.teamId } });
                if(!userData.teamId){
                    savedUser.teamId = existingTeam.id; // Assuming you have a `teamId` field in User entity
                }              
                await this.UserRepo.save(savedUser); // Update the user with the team reference
            }
    
            return savedUser; // Return the saved user
        } catch (error) {
            console.error("Error creating user by data:", error);
            throw error; 
        }
    }

    async findTeamById(teamId: number): Promise<Team |null> {
        try {
            const existingTeam = await this.TeamRepo.findOne({ where: { id: teamId} });
            return existingTeam; // Return true if the user exists, false otherwise
        } catch (error) {
            console.error('Error getting team:', error);
            throw new Error('Unable to check user estence.'); // Throw a more user-friendly error
        }
    }
    async userExist(userId: number): Promise<User |null> {
        try {
            const user = await this.UserRepo.findOne({ where: { id: userId } });
            return user; // Return true if the user exists, false otherwise
        } catch (error) {
            console.error('Error checking user existence:', error);
            throw new Error('Unable to check user existence.'); // Throw a more user-friendly error
        }
    }
    findUsersByRole = async (roleName: RoleName): Promise<User[] | null> => {
        try {
            const users = await this.UserRepo.createQueryBuilder("user")
                .where("FIND_IN_SET(:role, user.roles)", { role: roleName }) // Checks if the role exists in the roles column
                .getMany();
                
            return users;
            
        } catch (error) {
            console.log(error);
            
        }
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
                    "brandOwnerships.brand",
                    'parent',
                    'children',
                    'assignedTasks',
                    'createdTasks',
                    'notifications',

                ] });
                
        } catch (error) {
            console.error(`Error fetching user with ID ${id}:`, error);
            throw new Error('Error fetching user data');
        }
    };

    async updateChildrenParentId(children: User[], newParentId: number): Promise<void | null> {
        const childIds = children.map(child => child.id); // Extract child IDs for the update
    
        await this.UserRepo.createQueryBuilder()
            .update(User)
            .set({ parentId: newParentId }) // Set the new parent ID
            .where("id IN (:...ids)", { ids: childIds }) // Update only for the selected IDs
            .execute();
    }

    async deleteUserById(id: number): Promise<void | null> {
        try {
            await this.UserRepo.delete(id);
        } catch (error) {
            console.error(`Error during deletion of user with ID ${id}:`, error);
            throw new Error('Failed to delete user.'); // You can customize the error message as needed
        }
    }
    

    async checkForCycle(userId: number, newParentId: number): Promise<boolean> {
        const users = await this.UserRepo.find(); // Fetch all users
        const userMap = new Map<number, User>();
        users.forEach(user => userMap.set(user.id, user));
    
        // Step 3: Check if userId is a descendant of newParentId
        const isDescendant = (currentUserId: number | null): boolean => {
            if (currentUserId === null) return false; // No parent
    
            const currentUser = userMap.get(currentUserId);
            if (!currentUser) return false; // User not found
    
            // If currentUserId is the user we are trying to update, cycle detected
            if (currentUserId === userId) {
                return true; // Cycle detected
            }
    
            // Recursively check the parent
            return isDescendant(currentUser.parentId);
        };
    
        // Step 4: Perform the check starting from the new parent
        return isDescendant(newParentId); // Check if userId is a descendant of newParentId
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
    async deleteBrand(id: number): Promise<void> {
        try {
            // Delete the brand; related entities (BrandContact, BrandOwnership) will be deleted due to cascade
            await this.BrandRepo.delete(id);
        } catch (error) {
            console.error('Error during brand deletion in repository:', error);
            throw new Error('Failed to delete brand and its related entities.');
        }
    }
    
    getBrandDetail = async (id: number): Promise<Brand | null> => {
        try {
            // Retrieve a single brand by ID along with its related BrandContact and BrandOwnership
            const brand = await this.BrandRepo.findOne({
                where: { id }, // Use the where clause to specify the ID
                relations: ['contacts', 'brandOwnerships.boUser'], // Include relations
            });
    
            return brand; // Return the single brand or null if not found
        } catch (error) {
            console.error("Error fetching brand:", error);
            throw new Error("Failed to fetch brand");
        }
    };
    getBrand = async (id: number): Promise<Brand | null> => {
        try {
            // Retrieve a single brand by ID along with its related BrandContact and BrandOwnership
            const brand = await this.BrandRepo.findOne({
                where: { id }, // Use the where clause to specify the ID
            });
    
            return brand; // Return the single brand or null if not found
        } catch (error) {
            console.error("Error fetching brand:", error);
            throw new Error("Failed to fetch brand");
        }
    };
    addingBrandContact = async (brandContactData: BrandContactData): Promise<BrandContact | null> => {
        try {
            // Create a new BrandContact entity
            const brandContact = this.BrandContactRepo.create({
                contactPersonName: brandContactData.contactPersonName,
                contactPersonPhone: brandContactData.contactPersonPhone,
                contactPersonEmail: brandContactData.contactPersonEmail,
                brand: { id: brandContactData.brandId }, // Set the associated brand
            });

            // Save the BrandContact entity
            const savedBrandContact = await this.BrandContactRepo.save(brandContact);

            return savedBrandContact; // Return the saved entity
        } catch (error) {
            console.error("Error adding brand contact:", error);
            throw new Error("Failed to add brand contact");
        }
    }

    getBrandContactById = async (id: number): Promise<BrandContact | null> => {
        try {
            const brandContact = await this.BrandContactRepo.findOne({ where: { id } });
            return brandContact;
        } catch (error) {
            console.error("Error fetching brand contact by ID:", error);
            throw new Error("Failed to fetch brand contact");
        }
    };

    // Update the brand contact
    updateBrandContact = async (brandContact: BrandContact): Promise<BrandContact | null> => {
        try {
            // Save the updated brand contact
            const updatedBrandContact = await this.BrandContactRepo.save(brandContact);
            return updatedBrandContact;
        } catch (error) {
            console.error("Error updating brand contact:", error);
            throw new Error("Failed to update brand contact");
        }
    };

    addBrandOwnership = async (brandOwnershipData: BrandOwnershipData): Promise<BrandOwnership | null> => {
        try {
            // Create a new BrandOwnership entity
            const brandOwnership = this.BrandOwnershipRepo.create({
                brand: { id: brandOwnershipData.brandId },  // Associate with the brand
                boUser: { id: brandOwnershipData.boUserId }, // Associate with the user (BO)
            });

            // Save the BrandOwnership entity
            const savedBrandOwnership = await this.BrandOwnershipRepo.save(brandOwnership);

            return savedBrandOwnership; // Return the saved entity
        } catch (error) {
            console.error("Error adding brand ownership:", error);
            throw new Error("Failed to add brand ownership");
        }
    };
    getBrandOwnerShip = async (brandOwnershipData: BrandOwnershipData): Promise<BrandOwnership | null> => {
        try {
            // Create a new BrandOwnership entity
            const existingBrandOwnership = await this.BrandOwnershipRepo.findOne({
                where: {
                    boUser: { id: brandOwnershipData.boUserId },
                    brand: { id: brandOwnershipData.brandId }
                }
            });

            // Save the BrandOwnership entity
            return existingBrandOwnership; // Return the saved entity
        } catch (error) {
            console.error("Error adding brand ownership:", error);
            throw new Error("Failed to add brand ownership");
        }
    };
    
    
    
    
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
    getHierarchyTO = async (userId: number): Promise<PromiseReturn> => {
        try {
            // Fetch all users with their children in a single query
            const fullTree = await this.UserRepo.find({ relations: ['children', 'parent'] });
            
            // Find the initial user from the tree by ID
            let currentUser = fullTree.find(user => user.id === userId);
            
            if (!currentUser) {
                return { status: 404, message: "User not found" };
            }
            
            // Array to store all TO role users in the hierarchy
            const hierarchyTOs: User[] = [];
            
            // Traverse upwards to find parents with TO role
            while (currentUser && currentUser.parent) {
                const parentUser = fullTree.find(user => user.id === currentUser.parent.id);
                
                currentUser = {...parentUser};  // Move to the next parent in the hierarchy
                if (parentUser && parentUser.roles.includes(RoleName.TO)) {
                    delete parentUser.children
                    delete parentUser.parent
                    hierarchyTOs.push(parentUser);
                }
                
            }
            
            return  { status: StatusCode.OK as number, user:hierarchyTOs, message: "all to fetched successfully" };
        } catch (error) {
            console.error("Error during fetching TO hierarchy:", error);
            return { status: 500, message: "Error fetching TO hierarchy" };
        }
    };
    async findInventoryByName(inventoryName: string): Promise<Inventory | undefined|null> {
        try {
            const lowerCaseInventoryName = inventoryName.toLowerCase();

            // Make sure to reference the correct entity and its columns
            return await this.InventoryRepo.createQueryBuilder("inventory")
                .where("LOWER(inventory.name) = LOWER(:name)", { name: lowerCaseInventoryName })
                .getOne();
        } catch (error) {
            console.error("Error finding inventory by name:", error);
            throw new Error("Failed to find inventory by name");
        }
    }
    async findEventByName(eventName: string): Promise<Event | null | undefined> {
        try {
            const lowerCaseEventName = eventName.toLowerCase();

            // Query to find the event by name (case-insensitive)
            return await this.EventRepo.createQueryBuilder("event")
                .where("LOWER(event.name) = LOWER(:name)", { name: lowerCaseEventName })
                .getOne();
        } catch (error) {
            console.error("Error finding event by name:", error);
            throw new Error("Failed to find event by name");
        }
    }

    async createInventory(inventoryData: InventoryData): Promise<Inventory | null> {
        try {
            const inventory=this.InventoryRepo.create(inventoryData)
            const createdTask = await this.InventoryRepo.save(inventory); // Save the task to the database
            return createdTask; // Return the created task
        } catch (error) {
            console.error("Error when creating inventory:", error);
            throw error; 
        }
    }  
    async createEvent(eventData: EventData): Promise<Event | null> {
        try {
            const Event=this.EventRepo.create(eventData)
            const createdEvent = await this.EventRepo.save(Event); // Save the task to the database
            return createdEvent; // Return the created task
        } catch (error) {
            console.error("Error when creating createdEvent:", error);
            throw error; 
        }
    }  

    async findInventoryById(inventoryId: number): Promise<Inventory |null> {
        try {
            const inventory = await this.InventoryRepo.findOne({ where: { id: inventoryId} });
            return inventory; // Return true if the user exists, false otherwise
        } catch (error) {
            console.error('Error getting inventory:', error);
            throw new Error('Unable to check user estence.'); // Throw a more user-friendly error
        }
    }
    async findEventById(eventId: number): Promise<Event |null> {
        try {
            const Event = await this.EventRepo.findOne({ where: { id: eventId} });
            return Event; // Return true if the user exists, false otherwise
        } catch (error) {
            console.error('Error getting Event:', error);
            throw new Error('Unable to check user estence.'); // Throw a more user-friendly error
        }
    }
    async getAllInventory(): Promise<Inventory[] |null> {
        try {
            const Inventory = await this.InventoryRepo.find();
            return Inventory; // Return true if the user exists, false otherwise
        } catch (error) {
            console.error('Error getting Event:', error);
            throw new Error('Unable to check user estence.'); // Throw a more user-friendly error
        }
    }
    async getAllEvent(): Promise<Event[] |null> {
        try {
            const Event = await this.EventRepo.find();
            return Event; // Return true if the user exists, false otherwise
        } catch (error) {
            console.error('Error getting Event:', error);
            throw new Error('Unable to check user estence.'); // Throw a more user-friendly error
        }
    }
};
