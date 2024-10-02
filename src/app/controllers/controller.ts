import {Response,Request} from 'express'
import { StatusCode } from '../../interfaces/enum'
import useCase from '../useCase/useCase'
import { UserData, UserLoginData ,BrandData} from '../../interfaces/interface'

export default new class Controller{

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
            console.log("user login...");
            const loginResponse=await useCase.login(loginData)
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
            const {id}=req.body
            const  getBrandResponse=await useCase.getBrand(id)
            res.status(getBrandResponse.status).json(getBrandResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }

   
}