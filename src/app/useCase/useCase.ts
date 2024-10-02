import { Team } from '../../entity/Team';
import { User } from '../../entity/User';
import { StatusCode } from '../../interfaces/enum';
import { BrandData, PromiseReturn, RoleName, updatingUserData, UserData, UserLoginData } from '../../interfaces/interface';
import { buildTree } from '../../middleware/buildTree';
import { createToken } from '../../utils/jwt';
import UserRepo from '../repository/UserRepo';
import userRepo from '../repository/UserRepo';

export default new class UseCase {
    
    createUser = async (userData: UserData): Promise<PromiseReturn> => {
        try {
            // Check if the user already exists based on email
            const existingUser = await userRepo.findUserByEmail(userData.email);
            if (existingUser) {
                return { status: StatusCode.BadRequest as number, message: "User with this email already exists." };
            }
            // Validate that at least one role is assigned
            if (!userData.roles || userData.roles.length === 0) {
                return { status: StatusCode.BadRequest as number, message: "At least one role must be assigned." };
            }

            // Check if parentId is provided; if not, return a message
            if (!userData.parentId) {
                return { status: StatusCode.BadRequest as number, message: "Parent ID must be provided." };
            }

    
            // Ensure the TO role is assigned if the PO role is included
            if (userData.roles.includes(RoleName.PO) && !userData.roles.includes(RoleName.TO)) {
                return { status: StatusCode.BadRequest as number, message: "A TO must be selected if a PO role is assigned." };
            }
            // checking parent already exist
            const parentExists = await userRepo.userExist(userData.parentId);
            if (!parentExists) {
                return { status: StatusCode.NotFound as number, message: `Parent node with ID ${userData.parentId} does not exist.` };
            }

            if (userData.roles.includes(RoleName.BO)&&!userData.roles.includes(RoleName.TO)) {
                // Check if a TO role exists in the system
                const hasTO = await userRepo.findUserByRole(RoleName.TO); // Check for any existing TO users
                if (!hasTO) {
                    return { status: StatusCode.BadRequest as number, message: "A TO role must be created before creating a BO." };
                }
            }
            if (!userData.roles.includes(RoleName.TO)&&!userData.teamId) {
                return { status: StatusCode.BadRequest as number, message: "A team owner must be provided, or a TO role must be included." };
            }

    
            // Create the user
            const newUser = await userRepo.createUser(userData);
            // Save the new user to the database
    
            return { status: StatusCode.Created as number, message: "User created successfully.", User: newUser };
    
        } catch (error) {
            console.error("Error during user creation:", error);
            return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
        }
    };
    updateUser = async (userData: updatingUserData): Promise<PromiseReturn> => {
        try {
            const existingUser = await userRepo.findUserById(userData.id);
            if (!existingUser) {
                return { status: StatusCode.NotFound as number, message: "User not found." };
            }

            const hasTO = existingUser.roles.includes(RoleName.TO);

            // If the user is trying to remove the "TO" role
            if (!userData.roles.includes(RoleName.TO) && hasTO) {
                    return { status: StatusCode.BadRequest as number, message: "Cannot remove TO role;" };
            }
    
            // Email uniqueness check (if email is being updated)
            if (userData.email && userData.email !== existingUser.email) {
                const emailExists = await userRepo.findUserByEmail(userData.email);
                if (emailExists) {
                    return { status: StatusCode.BadRequest as number, message: "Email is already in use." };
                }
            }
    
            // Ensure at least one role is assigned
            if (!userData.roles || userData.roles.length === 0) {
                return { status: StatusCode.BadRequest as number, message: "At least one role must be assigned." };
            }
    
            // Role validation
            if (userData.roles.includes(RoleName.PO) && !userData.roles.includes(RoleName.TO)) {
                return { status: StatusCode.BadRequest as number, message: "A TO must be selected if a PO role is assigned." };
            }
            if (userData.roles.includes(RoleName.BO) && !userData.roles.includes(RoleName.TO)) {
                const hasTO = await userRepo.findUserByRole(RoleName.TO);
                if (!hasTO) {
                    return { status: StatusCode.BadRequest as number, message: "A TO role must be created before creating a BO." };
                }
            }
            // Validate the parent node
            if (userData.parentId && userData.parentId !== existingUser.parentId) {
                const parentExists = await userRepo.userExist(userData.parentId);
                if (!parentExists) {
                    return { status: StatusCode.NotFound as number, message: `Parent node with ID ${userData.parentId} does not exist.` };
                }
            }
            if (userData.parentId === userData.id) {
                return { status: StatusCode.BadRequest as number, message: "A user cannot be their own parent." };
            }

            if (userData.parentId && userData.parentId !== existingUser.parentId) {
                console.log("checking for cycle.....");
                
                const isCycle = await userRepo.checkForCycle(userData.id, userData.parentId);
                if (isCycle) {
                    return { status: StatusCode.BadRequest as number, message: "Updating this user's parent would create a cycle." };
                }
            }
        
    
            // Update user fields
            Object.assign(existingUser, {
                name: userData.name || existingUser.name,
                department: userData.department || existingUser.department,
                parentId: userData.parentId || existingUser.parentId,
                email: userData.email || existingUser.email,
                phoneNumber: userData.phoneNumber || existingUser.phoneNumber,
                password: userData.password || existingUser.password,
                roles:userData.roles || existingUser.roles,
                teamId:userData.teamId || existingUser.teamId
            });
    
            // Proceed to save user with updated details
            const updatedUser = await userRepo.saveUser(existingUser,hasTO);
            return { status: StatusCode.OK as number, message: "User updated successfully.",User:updatedUser };
    
        } catch (error) {
            console.error("Error during user update:", error);
            // General error handling for unexpected errors
            return { status: StatusCode.InternalServerError as number, message: error.message };
        
        }
    };

    login = async (loginData: UserLoginData): Promise<PromiseReturn> => {
        try {
            const user = await userRepo.findUserByEmail(loginData.email);            
            if (!user) {
                return { status: StatusCode.BadRequest as number, message: "Invalid email." }; 
            }else{
                if(user.password === loginData.password){
                    console.log("login successfully");
                    const roles=user?.roles.map((item)=>item)
                    const token=await createToken(user.id.toString(),roles,"1d")
                    return { status: StatusCode.OK as number, User:user,token,message: "user logged succesfully." }; 
                }else{
                    return { status: StatusCode.BadRequest as number, message: "Invalid password." }; 
                }
            }
        } catch (error) {
            console.error("Error during login:", error);
            return { status:  StatusCode.InternalServerError as number, message: "Internal server error." }; 
        }

    };

    getAllUser = async (): Promise<PromiseReturn > => {
        try {
           const getAllUser:User[]=await userRepo.getUserTree()
            const User=buildTree(getAllUser)
           return { status: StatusCode.OK as number, user:User, message: "all users fetched success fully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }
    getAllTo = async (): Promise<PromiseReturn > => {
        try {
           const getAllTo:User[]=await userRepo.getUsersWithRoleTO(RoleName.TO)
           return { status: StatusCode.OK as number, user:getAllTo, message: "all to  fetched success fully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }
    getAllTeam = async (): Promise<PromiseReturn > => {
        try {
           const getAllTeam:Team[]=await userRepo.getAllTeam()
           return { status: StatusCode.OK as number, team:getAllTeam, message: "all team fetched success fully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }
    getUser = async (id:number): Promise<PromiseReturn > => {
        try {
           const getUser:User=await userRepo.getUserById(id)
           if(getUser){
               return { status: StatusCode.OK as number, User:getUser, message: "user fetched success fully" };
           }else{
            return { status: StatusCode.NotFound as number, message: `No user found with sepsific id ${id}` };

           }
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }
    createBrand = async (brandData: BrandData): Promise<PromiseReturn> => {
        try {
            const brand = UserRepo.createBrand(brandData);
    
            const savedBrand = await UserRepo.saveBrand(brand);
    
            return { 
                status: StatusCode.OK as number, 
                brand: savedBrand, // Return the created brand object
                message: "Brand created successfully" 
            };
        } catch (error) {
            console.error("Error during creating brand:", error);
            return { 
                status: StatusCode.InternalServerError as number, 
                message: "Error when creating brand" 
            };
        }
    }

};
