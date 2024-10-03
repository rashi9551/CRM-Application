import { Brand } from "../entity/Brand";
import { BrandContact } from "../entity/BrandContact";
import { BrandOwnership } from "../entity/BrandOwnership";
import { Team } from "../entity/Team";
import { User } from "../entity/User";

export enum Department {
    DEVELOPMENT = 'Development',
    DESIGN = 'Design',
    HR = 'HR'
}

export enum RoleName {
    ADMIN = 'ADMIN',
    PO = 'PO',
    BO = 'BO',
    TO = 'TO',
}

export interface PromiseReturn{
    status: number; 
    User?:User
    user?:User[]
    message?:string
    token?:string
    team?:Team[]
    brand?:Brand[]
    Brand?:Brand
    BrandContact?:BrandContact
    BrandOwnership?:BrandOwnership
}

export interface UserData {
    name: string;
    department: Department; 
    phoneNumber: string;
    email: string;
    password: string;  
    roles: RoleName[]; 
    teamId?: number;
    parentId:number;

}
export interface BrandData {
    id:number
    brandName: string;        
    revenue: number;         
    dealClosedValue: number;  

}
export interface BrandOwnershipData {
    brandId:number
    boUserId: number;        

}
export interface BrandContactData {
    id?:number
    contactPersonName: string;    // The name of the contact person
    contactPersonPhone: string;   // The phone number of the contact person
    contactPersonEmail: string;   // The email address of the contact person
    brandId: number;              // The ID of the associated brand (foreign key to Brand)
}
export interface updatingUserData {
    id:number
    name: string;
    department: Department; 
    phoneNumber: string;
    email: string;
    password: string;  
    roles: RoleName[]; 
    teamId?: number;
    parentId:number;

}
export interface UserLoginData {
    email: string;
    password: string;  
}

