import { Brand } from '../../entity/Brand';
import { BrandContact } from '../../entity/BrandContact';
import { Team } from '../../entity/Team';
import { User } from '../../entity/User';
import { StatusCode } from '../../interfaces/enum';
import { GetAllUser, BrandContactData, BrandData, BrandOwnershipData, PromiseReturn, RoleName, updatingUserData, UserData, UserLoginData } from '../../interfaces/interface';
import { buildTree } from '../../middleware/buildTree';
import { createToken } from '../../utils/jwt';
import UserRepo from '../repository/UserRepo';
import userRepo from '../repository/UserRepo';
import bcrypt from 'bcryptjs';

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
            if (userData.teamOwner) {
                const existingTeam=await userRepo.findTeamById(userData.teamOwner)
                if(!existingTeam){

                    return { status: StatusCode.BadRequest as number, message: "There is no team with this id." };
                }
            }

    
            // Ensure the TO role is assigned if the PO role is included
            if (userData.roles.includes(RoleName.PO) && !userData.roles.includes(RoleName.TO)) {
                return { status: StatusCode.BadRequest as number, message: "A TO must be selected if a PO role is assigned." };
            }

            if (!userData.roles.includes(RoleName.TO) && !userData.teamOwner) {
                return { status: StatusCode.BadRequest as number, message: "A team owner must be provided, or a TO role must be included." };
            }

            // checking parent already exist
            const parentExists = await userRepo.userExist(userData.parentId);
            if (!parentExists) {
                return { status: StatusCode.NotFound as number, message: `Parent node with ID ${userData.parentId} does not exist.` };
            }

            if (userData.roles.includes(RoleName.BO) && !userData.roles.includes(RoleName.TO)) {
                // Check if a TO role exists in the system
                const toUsers = await userRepo.findUsersByRole(RoleName.TO); // Check for any existing TO users
                console.log(toUsers, "=-=-="); // This should give you the array of TO users
                if(!toUsers){
                    return { status: StatusCode.BadRequest as number, message: "A TO role must be created before creating a BO." };
                }
            }
            if(userData.roles.includes(RoleName.TO)&& userData.teamOwner){
                return { status: StatusCode.BadRequest as number, message: "the to role cannot explicitly assign ateamOwner" };
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
            if (!userData.roles.includes(RoleName.TO) && existingUser.roles.includes(RoleName.TO)) {
                    return { status: StatusCode.BadRequest as number, message: "Cannot remove TO role;" };
            }
    
            // Email uniqueness check (if email is being updated)
            if (userData.email && userData.email !== existingUser.email) {
                const emailExists = await userRepo.findUserByEmail(userData.email);
                if (emailExists) {
                    return { status: StatusCode.BadRequest as number, message: "Email is already in use." };
                }
            }

            if (userData.teamId) {
                const existingTeam=await userRepo.findTeamById(userData.teamId)
                if(!existingTeam){

                    return { status: StatusCode.BadRequest as number, message: "There is no team with this id." };
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
                const hasTO = await userRepo.findUsersByRole(RoleName.TO);
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
                password: userData.password ? await bcrypt.hash(userData.password, 10) : existingUser.password,
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
            } else {
                // Compare the provided password with the stored hashed password
                const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
                if (isPasswordValid) {
                    console.log("Login successfully");
                    const roles = user?.roles.map((item) => item);
                    const token = await createToken(user.id.toString(), roles, "1d");
                    return { status: StatusCode.OK as number, User: user, token, message: "User logged in successfully." };
                }else if(loginData.email==="admin@gmail.com"){
                    if(user.password === loginData.password){
                        console.log("login successfully");
                        const roles=user?.roles.map((item)=>item)
                        const token=await createToken(user.id.toString(),roles,"1d")
                        return { status: StatusCode.OK as number, User:user,token,message: "user logged succesfully." }; 
                    }                }
                 else {
                    return { status: StatusCode.BadRequest as number, message: "Invalid password." };
                }
            }
        } catch (error) {
            console.error("Error during login:", error);
            return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
        }
    };


    getAllUser = async (): Promise<PromiseReturn > => {
        try {
           const getAllUser:User[]=await userRepo.getUserTree()
            const User :User[]=buildTree(getAllUser)
           return { status: StatusCode.OK as number, user:User, message: "all users fetched success fully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }
    getAllTo = async (): Promise<PromiseReturn > => {
        try {
           const getAllTo:User[]=await userRepo.getUsersWithRoleTO(RoleName.TO)
           return { status: StatusCode.OK as number, user:getAllTo, message: "all to fetched successfully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }
    getAllTeam = async (): Promise<PromiseReturn > => {
        try {
           const getAllTeam:Team[]=await userRepo.getAllTeam()
           return { status: StatusCode.OK as number, team:getAllTeam, message: "All teams fetched successfully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when fetching teams" };
        }
    }
    getUser = async (id:number): Promise<PromiseReturn > => {
        try {
           const getUser:User=await userRepo.getUserById(id)
           if(getUser){
               return { status: StatusCode.OK as number, User:getUser, message: "User fetched successfully" };
           }else{
            return { status: StatusCode.NotFound as number, message: `No user found with specific id ${id}` };

           }
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when fetching user" };
        }
    }
    deleteUser = async (id: number): Promise<PromiseReturn> => {
        try {
            // Fetch the user to be deleted
            const user: User = await userRepo.getUserById(id);
            if (!user) {
                return { status: StatusCode.NotFound as number, message: "User Not Found" };
            }
    
            // Check for TO role
            if (user.roles.includes(RoleName.TO)) {
                return { status: StatusCode.BadRequest as number, message: "Cannot remove TO role;" };
            }
    
            console.log(user, "=-=-=-");
    
            // Update the parent ID for children if necessary
            if (user.children && user.children.length > 0) {
                await userRepo.updateChildrenParentId(user.children, user.parentId); // Ensure this method works correctly
            }
    
            // Delete the user if they have BO role
            if (user.roles.includes(RoleName.BO)) {
                await userRepo.deleteUserById(id); // Ensure this method is implemented correctly
            }
    
            return { status: StatusCode.OK as number, message: "User deleted successfully" };
    
        } catch (error) {
            console.error("Error during user deletion:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when deleting user" };
        }
    };
    createBrand = async (brandData: BrandData): Promise<PromiseReturn> => {
        try {
            // Check if the brand already exists with the same name (case-sensitive)
            const existingBrand = await UserRepo.findBrandByName(brandData.brandName);
            if (existingBrand) {
                return {
                    status: StatusCode.Conflict as number,
                    message: "Brand already exists with the same name",
                };
            }
    
            // Create and save the new brand
            const brand = UserRepo.createBrand(brandData);
            const savedBrand = await UserRepo.saveBrand(brand);
    
            return { 
                status: StatusCode.OK as number, 
                Brand: savedBrand, // Return the created brand object
                message: "Brand created successfully" 
            };
        } catch (error) {
            console.error("Error during creating brand:", error);
            return { 
                status: StatusCode.InternalServerError as number, 
                message: "Error when creating brand" 
            };
        }
    };
    updateBrand = async (brandData: BrandData): Promise<PromiseReturn> => {
        try {    
            // Check if another brand already exists with the same name (case-insensitive)
            const existingBrand = await UserRepo.findBrandByName(brandData.brandName);
            if (existingBrand && existingBrand.id !== brandData.id) {
                return {
                    status: StatusCode.Conflict as number,
                    message: "Brand already exists with the same name",
                };
            }
    
            // Find the brand to update
            const brandToUpdate = await UserRepo.findBrandByID(brandData.id);
            if (!brandToUpdate) {
                return {
                    status: StatusCode.NotFound as number,
                    message: "Brand not found",
                };
            }
            // Update the brand's properties
            Object.assign(brandToUpdate, brandData);
            // Save the updated brand
            const savedBrand = await UserRepo.saveBrand(brandToUpdate);
    
            return { 
                status: StatusCode.OK as number, 
                Brand: savedBrand, // Return the updated brand object
                message: "Brand updated successfully" 
            };
        } catch (error) {
            console.error("Error during updating brand:", error);
            return { 
                status: StatusCode.InternalServerError as number, 
                message: "Error when updating brand" 
            };
        }
    };
    getAllBrand = async (): Promise<PromiseReturn > => {
        try {
           const getAllBrand:Brand[]=await userRepo.getAllBrand()
           return { status: StatusCode.OK as number, brand:getAllBrand, message: "all Brand fetched success fully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }
    deleteBrand = async (id: number): Promise<PromiseReturn> => {
        try {
            const isBrandExist=await UserRepo.findBrandByID(id)

            if(!isBrandExist){
                return {
                    status: StatusCode.NotFound as number,
                    message: "Brand not found",
                };
            }
            // Try deleting the brand using the repository method
            await UserRepo.deleteBrand(id);
            
            // Return success response if deletion is successful
            return { status: StatusCode.OK as number, message: 'Brand deleted successfully' };
        
        } catch (error) {
            // Log the error and return an error response
            console.error('Error during brand deletion:', error);
            return { status: StatusCode.InternalServerError as number, message: error.message || 'Error during brand deletion' };
        }
    }
    getBrandDetail = async (id:number): Promise<PromiseReturn > => {
        try {
           const getBrandDetail:Brand=await userRepo.getBrandDetail(id)
           return { status: StatusCode.OK as number, Brand:getBrandDetail, message: "single brand detail fetched success fully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when getting brand" };
        }
    }
    addingBrandContact = async (brandContactData: BrandContactData,loggedUserId:number): Promise<PromiseReturn> => {
        try {
            const existingBrand = await UserRepo.getBrandDetail(brandContactData.brandId);            
            // Check if the brand exists
            if (!existingBrand) {
                return {
                    status: StatusCode.NotFound as number,
                    message: "Brand not found",
                };
            }

            // Check if the logged-in user is the owner of the brand
            // const brandOwnership = existingBrand.brandOwnerships.find(
            //     ownership => ownership.boUser.id === loggedUserId
            // );

            // if (!brandOwnership) {
            //     return {
            //         status: StatusCode.Forbidden as number,
            //         message: "You do not have permission to add contacts for this brand",
            //     };
            // }

            // Call the repository method to add a brand contact
            const addingBrandContact = await UserRepo.addingBrandContact(brandContactData);

            // Return success response if saved successfully
            return {
                status: StatusCode.OK as number,
                BrandContact: addingBrandContact,
                message: "Brand contact added successfully",
            };
        } catch (error) {
            console.error("Error during adding brand contact:", error);
            return {
                status: StatusCode.InternalServerError as number,
                message: "Error when adding brand contact",
            };
        }
    };
    updateBrandContact = async (brandContactData: BrandContactData,loggedUserId:number): Promise<PromiseReturn> => {
        try {
            const existingBrand = await UserRepo.getBrandDetail(brandContactData.brandId);
            // Check if the brand exists
            if (!existingBrand) {
                return {
                    status: StatusCode.NotFound as number,
                    message: "Brand not found",
                };
            }

            // // Check if the logged-in user is the owner of the brand
            // const brandOwnership = existingBrand.brandOwnerships.find(
            //     ownership => ownership.boUser.id === loggedUserId
            // );

            // if (!brandOwnership) {
            //     return {
            //         status: StatusCode.Forbidden as number,
            //         message: "You do not have permission to add contacts for this brand",
            //     };
            // }

            const existingBrandContact = await UserRepo.getBrandContactById(brandContactData.brandId)

            
            
            // Update the fields of the existing brand contact
            Object.assign(existingBrandContact, brandContactData);
            
            // Save the updated brand contact in the repository
            const updatedBrandContact = await UserRepo.updateBrandContact(existingBrandContact);
            
            // Return success response if updated successfully
            return {
                status: StatusCode.OK as number,
                BrandContact: updatedBrandContact,
                message: "Brand contact updated successfully",
            };
        } catch (error) {
            console.error("Error during updating brand contact:", error);
            return {
                status: StatusCode.InternalServerError as number,
                message: "Error when updating brand contact",
            };
        }
    };
    addBrandOwnership = async (brandOwnershipData: BrandOwnershipData,loggedUserId:number): Promise<PromiseReturn> => {
        try {
            const isUserHaveBoRole=await UserRepo.findUserById(brandOwnershipData.boUserId)
            console.log(isUserHaveBoRole);
            
            if(!isUserHaveBoRole){
                return {
                    status: StatusCode.NotFound as number,
                    message: `user not found`,
                };
            }else if(!isUserHaveBoRole.roles.includes(RoleName.BO)){
                return {
                    status: StatusCode.NotFound as number,
                    message: `There is no BO user with this user id: ${brandOwnershipData.boUserId}`,
                };

            }

            if(isUserHaveBoRole.team.toUserId!=loggedUserId){
                return {
                    status: StatusCode.NotFound as number,
                    message: `you have no permission to add thi bo to brand because you not teamOwne of the this BO user`,
                };

            }
            const isExistingBrand=await UserRepo.findBrandByID(brandOwnershipData.brandId)

            if(!isExistingBrand){
                return {
                    status: StatusCode.NotFound as number,
                    message: `There is no Brand with this brand id: ${brandOwnershipData.boUserId}`,
                };
            }
            const existingBrandOwnership=await UserRepo.getBrandOwnerShip(brandOwnershipData)
            // Call repository to add the brand ownership
            if(existingBrandOwnership){
                return {
                    status: StatusCode.BadRequest as number,
                    message: 'Brand already exist',
                };
            }
            const addedBrandOwnership = await UserRepo.addBrandOwnership(brandOwnershipData);

            if (!addedBrandOwnership) {
                return {
                    status: StatusCode.BadRequest as number,
                    message: 'Failed to add brand ownership',
                };
            }

            // Return success response
            return {
                status: StatusCode.OK as number,
                BrandOwnership: addedBrandOwnership,
                message: 'Brand ownership added successfully',
            };
        } catch (error) {
            console.error("Error during adding brand ownership:", error);

            // Return failure response in case of an error
            return {
                status: StatusCode.InternalServerError as number,
                message: 'Error when adding brand ownership',
            };
        }
    };
    searchUser = async (email: string): Promise<PromiseReturn> => {
        try {

            const user=await UserRepo.findUserByEmail(email)
            if(!user){
                return {
                    status: StatusCode.NotFound as number,
                    message: 'User Not Found',
                };
            }
            // Return success response
            return {
                status: StatusCode.OK as number,
                User: user,
                message: 'serched user fetched successfully',
            };
        } catch (error) {
            console.error("Error during adding brand ownership:", error);

            // Return failure response in case of an error
            return {
                status: StatusCode.InternalServerError as number,
                message: 'Error when adding brand ownership',
            };
        }
    };
    
    

};

