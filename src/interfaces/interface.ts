import { Brand } from "../entity/Brand";
import { BrandContact } from "../entity/BrandContact";
import { BrandOwnership } from "../entity/BrandOwnership";
import { Inventory } from "../entity/inventory";
import { Task, TaskStatus } from "../entity/Task";
import { Event } from "../entity/Event";
import { Team } from "../entity/Team";
import { User } from "../entity/User";
import { Notification } from "../entity/Notification";
import { TaskHistory } from "../entity/TaskHistory";
import { TaskComment } from "../entity/TaskComment";

export enum Department {
    DEVELOPMENT = 'Development',
    DESIGN = 'Design',
    HR = 'HR'
}

export enum RoleName {
    ADMIN = 'ADMIN',
    MANAGEMENT="MANAGEMENT",
    PO = 'PO',
    BO = 'BO',
    TO = 'TO',
}

export enum TaskHistoryAction {
    TASK_CREATED = "Task Created",
    TASK_REASSIGNED = "Task Reassigned",
    TASK_COMPLETED = "Task Completed",
    TASK_OVERDUE = "Task Overdue",
    TASK_COMMENT_ADDED = "Comment Added",
    TASK_COMMENT_EDITED = "Comment Edited",
    TASK_UPDATED = "Task Updated",
    TASK_DELETED = "Task Deleted",
    TASK_MARKED_IN_PROGRESS = "Task Marked as In Progress",
    TASK_SLA_TRIGGERED = "SLA Triggered",
    TASK_DUE_DATE_APPROACHING = "Due Date Approaching",
    TASK_FILE_ATTACHED = "File Attached",
    TASK_FILE_DELETED = "File Deleted",
    TASK_PRIORITY_CHANGED = "Priority Changed"
}


export enum TaskType {
    AllTasks = 'All tasks',
    YourTasks = 'Your tasks',
    TeamTasks = 'Team tasks',
    DelegatedToOthers = 'Delegated to others'
}

export enum AnalyticsFilter {
    Today = 'Today',
    Last3Days = 'Last 3 Days',
    Last7Days = 'Last 7 Days',
    Last15Days = 'Last 15 Days',
    LastMonth = 'Last Month',
    ThisMonth = 'This Month',
    AllTime = 'All Time',
}

export interface GetAllUser {
    id: number;
    name: string;
    department: string;
    phoneNumber: string;
    email: string;
    password: string; // Ensure password is handled securely
    createdAt: Date; // Use Date type for createdAt
    roles: string[]; // Array of role names as strings
    parentId: number | null; // Parent ID can be null
    teamId: number | null; // Team ID can be null
    children: GetAllUser[]; // Array of children, assuming they are also GetAllUser types
}

export interface PromiseReturn{
    status: number; 
    User?:User
    user?:User[] | GetAllUser[]
    message?:string
    token?:string
    team?:Team[]
    brand?:Brand[]
    Brand?:Brand
    Task?:Task
    taskComent?:TaskComment
    TaskHistory?: Partial<TaskHistory>;  // Make TaskHistory optional
    taskHistory?: Partial<TaskHistory>[];  // Make TaskHistory optional
    Notification?: Partial<Notification>;  
    task?:Task[]
    inventory?:Inventory
    event?:Event
    analytics?:Analytics
    UnreadNotification?:Notification[]
    BrandContact?:BrandContact
    BrandOwnership?:BrandOwnership
}


// export enum TaskStatus {
//     NOT_STARTED = 'Not Started',
//     IN_PROGRESS = 'In Progress',
//     PENDING = 'Pending',
//     COMPLETED = 'Completed',
//     OVERDUE = 'Overdue',
//     ON_HOLD = 'On Hold',
//     CANCELLED = 'Cancelled',
// }

export interface UserData {
    id?:number,
    name: string;
    department: Department; 
    phoneNumber: string;
    email: string;
    password: string;  
    roles: RoleName[]; 
    teamId?: number | null;
    parentId?:number;

}
export interface EventData {
    id?:number,
    name: string;
    date: Date; 
    location?: string;
    details?: string;
}
export interface InventoryData {
    id?:number,
    name: string;
    description?: Department; 
    quantity: number;
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
    teamId?: number | null;
    parentId:number;

}
export interface UserLoginData {
    email: string;
    password: string;  
}



export interface TaskData {
    id?: number;                       // Optional ID for existing tasks
    title: string;                    // Title of the task
    description?: string;             // Description should be a string, mark as optional
    type: string; 
    status:TaskStatus;                    // Type of the task
    assigned_to: number;               // ID of the user assigned to the task
    created_by: number;                // ID of the user who created the task
    brand_id?: number;                 // Optional ID of the brand associated with the task
    inventoryId?: number;                 // Optional ID of the brand associated with the task
    eventId?: number;                 // Optional ID of the brand associated with the task
    due_date:string;
}

export interface TaskCommentData {
    comment: string;           // The content of the comment
    filePaths?: string[];      // Optional array of file paths for attached files
    fileTypes?: string[];      // Optional array of file types for attached files
    taskId: number;            // The ID of the task the comment belongs to
    userId: number;            // The ID of the user who posted the comment
}


export interface FilterOptions {
    type?: string;
    assignedBy?: number;
    assignedTo?: number;
    teamOwner?: number;
    dueDatePassed?: boolean;
    brandName?: string;
    inventoryName?: string;
    eventName?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

interface Analytics {

    [key: string]: {
        totalTasksCreated: number;
        openTasks: number;
        completedTasks: number;
        overdueTasks: number;
        comparison: {
            totalTasksCreated: string;
            openTasks: string;
            completedTasks: string;
            overdueTasks: string;
        };
    };
}