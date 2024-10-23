import {Response,Request} from 'express'
import { StatusCode } from '../../interfaces/enum'
import useCase from '../services/userServices'
import { UserData, UserLoginData ,BrandData, InventoryData, EventData} from '../../interfaces/interface'

export default new class UserController{

    createUser=async(req:Request,res:Response)=>{
        try {
            console.log("admin creating  user...");
            const userData:UserData=req.body
            const createUserResponse=await useCase.createUser(userData)
            res.status(createUserResponse.status).json(createUserResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }

    login=async(req:Request,res:Response)=>{
        try {
            const loginData:UserLoginData=req.body
            const loginResponse=await useCase.login(loginData)
            console.log("user login...");
           res.status(loginResponse.status).json(loginResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    getAllUser=async(req:Request,res:Response)=>{
        try {
            console.log("geeting getAllUser...");
            const getUserResponse=await useCase.getAllUser()
           res.status(getUserResponse.status).json(getUserResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    getUser=async(req:Request,res:Response)=>{
        try {
            console.log("geeting a single user...");
            const userId = +req.params.id;
            const getUserResponse = await useCase.getUser(userId);
           res.status(getUserResponse.status).json(getUserResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    getAllTo=async(req:Request,res:Response)=>{
        try {
            console.log("geeting a all TO role user...");
            const getAllToResponse = await useCase.getAllTo();
           res.status(getAllToResponse.status).json(getAllToResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    getHierarchyTo=async(req:Request,res:Response)=>{
        try {
            console.log("geeting a all heirachy TO role user...");
            const getAllToResponse = await useCase.getHierarchyTo(+req.params.id);
           res.status(getAllToResponse.status).json(getAllToResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    getAllTeam=async(req:Request,res:Response)=>{
        try {
            console.log("geeting a all team  ...");
            const getAllTeamResponse = await useCase.getAllTeam();
           res.status(getAllTeamResponse.status).json(getAllTeamResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    updateUser=async(req:Request,res:Response)=>{
        try {
            console.log("updating a  single user...");
            const updateingData=req.body
            const updateUserResponse = await useCase.updateUser(updateingData);
           res.status(updateUserResponse.status).json(updateUserResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' }); 
        }
    }
    deleteUser = async (req: Request, res: Response) => {
        try {
            console.log("Deleting a single user...");
            const { id } = req.params;
    
            // Ensure id is a valid number
            if (!id || isNaN(+id)) {
                return res.status(StatusCode.BadRequest).json({ message: 'Invalid user ID' });
            }
    
            const deleteUserResponse = await useCase.deleteUser(+id);
            return res.status(deleteUserResponse.status).json(deleteUserResponse);
        } catch (error) {
            console.error("Error in deleteUser controller:", error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' });
        }
    };
    


    createBrand=async(req:Request,res:Response)=>{
        try {
            console.log("admin or bo creating  a brand...");
            const BrandData:BrandData=req.body
            const createBrandResponse=await useCase.createBrand(BrandData)
            res.status(createBrandResponse.status).json(createBrandResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    updateBrand=async(req:Request,res:Response)=>{
        try {
            console.log("admin or bo  updating  a brand...");
            const BrandData:BrandData=req.body
            const updateBrandResponse=await useCase.updateBrand(BrandData)
            res.status(updateBrandResponse.status).json(updateBrandResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    deleteBrand=async(req:Request,res:Response)=>{
        try {
            console.log("admin or bo  deleting  a brand...");
            const {id}=req.params
            const deleteBrandesponse=await useCase.deleteBrand(+id)
            res.status(deleteBrandesponse.status).json(deleteBrandesponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    getAllBrand=async(req:Request,res:Response)=>{
        try {
            console.log("admin or bo  getting  all brand...");
            const getAllBrandResponse=await useCase.getAllBrand()
            res.status(getAllBrandResponse.status).json(getAllBrandResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    getBrand=async(req:Request,res:Response)=>{
        try {
            console.log("admin or bo  getting  a brand...");
            const id=req.params.id;
            const  getBrandResponse=await useCase.getBrand(+id)
            res.status(getBrandResponse.status).json(getBrandResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    getBrandDetail=async(req:Request,res:Response)=>{
        try {
            console.log("admin or bo  getting  a brand details...");
            const {id}=req.params
            const  getBrandResponse=await useCase.getBrandDetail(+id,req.id,req.role)
            res.status(getBrandResponse.status).json(getBrandResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    addBrandContact=async(req:Request,res:Response)=>{
        try {
            console.log("admin or bo  adding  a brand contact...");
            const BrandContact=req.body
            const  addingBrandContactResponse=await useCase.addingBrandContact(BrandContact,req.id)
            res.status(addingBrandContactResponse.status).json(addingBrandContactResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    updateBrandContact=async(req:Request,res:Response)=>{
        try {
            console.log("admin or bo  updating  a brand contact...");
            const BrandContact=req.body
            const  updatingBrandContactResponse=await useCase.updateBrandContact(BrandContact,req.id)
            res.status(updatingBrandContactResponse.status).json(updatingBrandContactResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    addBrandOwnership=async(req:Request,res:Response)=>{
        try {
            console.log("admin or bo  updating  a brand ownership...");
            const BrandOwnershipData=req.body
            const  addBrandOwnershipResponse=await useCase.addBrandOwnership(BrandOwnershipData,req.id)
            res.status(addBrandOwnershipResponse.status).json(addBrandOwnershipResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    searchUser=async(req:Request,res:Response)=>{
        try {
            console.log("admin or bo  updating  a brand ownership...");
            const {email}=req.body
            const  searchUserResponse=await useCase.searchUser(email)
            res.status(searchUserResponse.status).json(searchUserResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }


    createInventory=async(req:Request,res:Response)=>{
        try {
            console.log("admin creating  Inventory...");
            const createInventoryData:InventoryData=req.body
            const createInventoryResponse=await useCase.createInventory(createInventoryData)
            res.status(createInventoryResponse.status).json(createInventoryResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    getAllInventory=async(req:Request,res:Response)=>{
        try {
            console.log("admin getting all  Inventory...");
            const createInventoryResponse=await useCase.getAllInventory()
            res.status(createInventoryResponse.status).json(createInventoryResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    createEvent=async(req:Request,res:Response)=>{
        try {
            console.log("admin creating  event...");
            const eventData:EventData=req.body
            const eventDataResponse=await useCase.creatingEvent(eventData)
            res.status(eventDataResponse.status).json(eventDataResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    getAllEvent=async(req:Request,res:Response)=>{
        try {
            console.log("getting all event...");
            const eventDataResponse=await useCase.getAllEvent()
            res.status(eventDataResponse.status).json(eventDataResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }

   
}