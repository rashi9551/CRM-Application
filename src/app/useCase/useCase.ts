import { User } from '../../entity/User';
import { StatusCode } from '../../interfaces/enum';
import { PromiseReturn, RoleName, UserData, UserLoginData } from '../../interfaces/interface';
import { buildTree } from '../../middleware/buildTree';
import { createToken } from '../../utils/jwt';
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
            if (!userData.roles.includes(RoleName.TO)&&!userData.teamOwner) {
                return { status: StatusCode.BadRequest as number, message: "A team owner must be provided, or a TO role must be included." };
            }

    
            // Create the user
            const newUser = await userRepo.createUser(userData);
            // Save the new user to the database
            const savedUser = await userRepo.saveUser(newUser,userData.roles,userData.teamOwner);
    
            return { status: StatusCode.Created as number, message: "User created successfully.", User: newUser };
    
        } catch (error) {
            console.error("Error during user creation:", error);
            return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
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
                    const roles=user?.roles.map((item)=>item.roleName)
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
           return { status: StatusCode.OK as number, user:User, message: "Tree fetched success fully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }
    getUser = async (id:number): Promise<PromiseReturn > => {
        try {
           const getUser:User=await userRepo.getUserById(id)
           return { status: StatusCode.OK as number, User:getUser, message: "user fetched success fully" };
        } catch (error) {
            console.error("Error during fetching tree:", error);
            return { status: StatusCode.InternalServerError as number, message: "Error when creating node" };
        }
    }
};
