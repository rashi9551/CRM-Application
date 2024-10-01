import {Response,Request} from 'express'
import { StatusCode } from '../../interfaces/enum'
import useCase from '../useCase/useCase'
import { UserData, UserLoginData } from '../../interfaces/interface'

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
   
}