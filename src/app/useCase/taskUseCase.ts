import { validateOrReject } from 'class-validator';
import { User } from '../../entity/User';
import { StatusCode } from '../../interfaces/enum';
import { PromiseReturn,  RoleName,  TaskData, TaskHistoryAction, TaskType } from '../../interfaces/interface';
import { Task, TaskStatus } from '../../entity/Task';
import UserRepo from '../repository/UserRepo';
import TaskRepo from '../repository/TaskRepo';
import { Notification } from '../../entity/Notification';
import { TaskHistory } from '../../entity/TaskHistory';

export default new class TaskUseCase {
    
    createTask = async (taskData: TaskData): Promise<PromiseReturn> => {
        try {  
            const task = new Task();
            Object.assign(task, taskData); // Assign taskData to the task entity
            await validateOrReject(task);
             if(taskData.brand_id){
                 const existingBrand = await UserRepo.getBrandDetail(taskData.brand_id);            
                 if (!existingBrand) return {status: StatusCode.NotFound as number,message: "Brand not found",};
             }
             if(taskData.inventory_id){
                 const existingInventory= await UserRepo.findInventoryById(taskData.inventory_id);            
                 if (!existingInventory) return {status: StatusCode.NotFound as number,message: "Inventory not found",};
             }
             if(taskData.event_id){
                 const existingEvent= await UserRepo.findEventById(taskData.event_id);            
                 if (!existingEvent) return {status: StatusCode.NotFound as number,message: "Event not found",};
             }

             // Check if the assignedUser exists
            const assignedUser: User = await UserRepo.getUserById(taskData.assigned_to);
            const createdUser: User = await UserRepo.getUserById(taskData.created_by);

            if (!assignedUser) return { status: StatusCode.NotFound as number, message: "AssignedUser Not Found" };
            if (!createdUser) return { status: StatusCode.NotFound as number, message: "CreatedUser Not Found" }; 
            const taskCreating=await TaskRepo.createTask(taskData)
            await this.NotificationSending(`You have been assigned a new task: ${taskCreating.title}`,taskCreating,assignedUser)
            await this.TaskHistoryLogging(taskCreating,createdUser,TaskHistoryAction.TASK_CREATED,`The Task ${taskCreating.title} was created by ${createdUser.name} and assigned to ${assignedUser.name}`)
            return { status: StatusCode.Created as number, message: "Task created successfully.",Task:taskCreating };
    
        } catch (error) {
            if (Array.isArray(error) && error.length > 0) {
                const firstError = error[0];
                const firstConstraintKey = Object.keys(firstError.constraints || [])[0];
                const firstConstraintMessage = firstError.constraints[firstConstraintKey];
                const fieldName = firstError.property;
                return { status: StatusCode.BadRequest as number, message: `${fieldName}: ${firstConstraintMessage}`};
            }
            console.error("Error during task creation:", error);
            return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
        }
    };
    updateTask = async (taskData: TaskData, loggedUserId: number): Promise<PromiseReturn> => {
        try {
            let flag: boolean = true;
            let taskHistory: TaskHistory | undefined;
            let notification: Notification | undefined;
            const existingTask = await TaskRepo.findTaskById(taskData.id);
            console.log(existingTask,"=-=-=-=-",loggedUserId);
            
            if (!existingTask) {
                return { status: StatusCode.NotFound as number, message: "Task not found." };
            }
            if (existingTask.created_by !== loggedUserId && existingTask.assigned_to!=loggedUserId) {
                return {
                    status: StatusCode.Unauthorized as number,
                    message: "Only the user who created the task has permission to update it.",
                };
            }
            if(taskData.status && existingTask.assigned_to!=loggedUserId){
                return {
                    status: StatusCode.Unauthorized as number,
                    message: "Only the user who assigned_to   has permission to update complete status.",
                };
            }else{
                flag=false
                taskHistory=await this.TaskHistoryLogging(
                    existingTask,
                    existingTask.createdBy,
                    TaskHistoryAction.TASK_UPDATED,
                    `The Task ${existingTask.title} was updated by ${existingTask.createdBy.name}`
                );
            }
            if(taskData.assigned_to || taskData.created_by){
                const assignedUser: User = await UserRepo.getUserById(taskData.assigned_to);
                const createdUser: User = await UserRepo.getUserById(taskData.created_by);
                if (!assignedUser) return { status: StatusCode.NotFound as number, message: "Assigned user not found." };
                if (!createdUser) return { status: StatusCode.NotFound as number, message: "Created user not found." };
            }
    
            if (taskData.brand_id) {
                const existingBrand = await UserRepo.getBrandDetail(taskData.brand_id);
                if (!existingBrand) return { status: StatusCode.NotFound as number, message: "Brand not found." };
            }
    
            if (taskData.inventory_id) {
                const existingInventory = await UserRepo.findInventoryById(taskData.inventory_id);
                if (!existingInventory) return { status: StatusCode.NotFound as number, message: "Inventory not found." };
            }
    
            if (taskData.event_id) {
                const existingEvent = await UserRepo.findEventById(taskData.event_id);
                if (!existingEvent) return { status: StatusCode.NotFound as number, message: "Event not found." };
            }
    
            
    
            if (existingTask.assigned_to !== taskData.assigned_to) {
                flag = false;
    
                // Execute TaskHistoryLogging and NotificationSending in parallel
                [taskHistory, notification] = await Promise.all([
                    this.TaskHistoryLogging(
                        existingTask,
                        existingTask.createdBy,
                        TaskHistoryAction.TASK_REASSIGNED,
                    `The Task ${existingTask.title} was reassigned by ${existingTask.createdBy.name} and assigned to ${existingTask.assignedTo.name}` // MARKED CHANGE
                    ),
                    this.NotificationSending(
                        `You have been assigned a new task: ${existingTask.title}`,
                        existingTask,
                        existingTask.assignedTo
                    )
                ]);
                existingTask.assigned_to = existingTask.assigned_to; // Update assigned user here
            }
    
            Object.assign(existingTask, taskData);
            await validateOrReject(existingTask);
            delete existingTask.assignedTo; // Ensure this is necessary
            delete existingTask.createdBy; // Ensure this is necessary
            const updatedTask = await TaskRepo.saveTask(existingTask);
    
            if (flag) {
                [taskHistory, notification] = await Promise.all([
                    this.TaskHistoryLogging(
                        updatedTask,
                        updatedTask.createdBy,
                        TaskHistoryAction.TASK_UPDATED,
                        `The Task ${updatedTask.title} was updated by ${updatedTask.createdBy.name}`
                    ),
                    this.NotificationSending(
                        `Your task has been updated: ${updatedTask.title}`,
                        updatedTask,
                        updatedTask.assignedTo
                    )
                ]);
            }   
            delete taskHistory?.task 
            delete taskHistory?.user 
            delete notification?.recipient
            delete notification?.task
            return { status: StatusCode.Created as number, message: "Task updated successfully.", Task: updatedTask, TaskHistory:taskHistory,Notification :notification};
        } catch (error) {
            if (Array.isArray(error) && error.length > 0) {
                const firstError = error[0];
                const firstConstraintKey = Object.keys(firstError.constraints || [])[0];
                const firstConstraintMessage = firstError.constraints[firstConstraintKey];
                const fieldName = firstError.property;
                return { status: StatusCode.BadRequest as number, message: `${fieldName}: ${firstConstraintMessage}` };
            }
            console.error("Error during updating task:", error);
            return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
        }
    };
    
    getTasks = async (filter: TaskType,loggedUserId:number,role?:String[]): Promise<PromiseReturn> => {
        try {  
            console.log(filter);
            if(filter===TaskType.AllTasks){
                const tasks = await TaskRepo.getAllTasks();            
                if (tasks) return {status: StatusCode.OK as number,message: "Successfully fetched All Tasks",task:tasks};
            } 
            if(filter===TaskType.YourTasks){
                const tasks = await TaskRepo.getYourTask(loggedUserId);            
                if (tasks) return {status: StatusCode.OK as number,message: "Successfully fetched  your Tasks",task:tasks};
            } 
            if(filter===TaskType.TeamTasks){
                const hasAccess = role?.some(r => [RoleName.MANAGEMENT, RoleName.ADMIN, RoleName.TO].includes(r as RoleName));
                if (hasAccess) {
                    const tasks = await TaskRepo.getTeamTask(loggedUserId);            
                    if (tasks) return {status: StatusCode.OK as number,message: "Successfully fetched  team Tasks",task:tasks};
                } else {
                    return {status: StatusCode.Unauthorized as number,message: "only TO Can View The TeamTask",};
                }
            } 
            if(filter===TaskType.DelegatedToOthers){
                const tasks = await TaskRepo.getDelegatedToOthersTask(loggedUserId);            
                if (tasks) return {status: StatusCode.OK as number,message: "Successfully fetched  DelegatedToOthers Tasks",task:tasks};
            } 
            return { status: StatusCode.BadRequest as number, message: "select appropriate filter." };
        }catch (error) {
            console.log(error);
            
            if (error.message === "admin can't have the team task") {
                return {
                    status: StatusCode.Forbidden as number,
                    message: error.message, // Admin-specific message
                };
            }
                console.error("Error during getting asll task:", error);
                return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
            }
        };
    getTask = async (taskId:number): Promise<PromiseReturn> => {
        try {  
            const existingTask = await TaskRepo.findTaskById(taskId);
            return { status: StatusCode.OK as number, message: "Task Fetched By Id Successfully." ,Task:existingTask};
        }catch (error) {
                console.error("Error during getting task :", error);
                return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
            }
    };
    getNotification = async (userId:number): Promise<PromiseReturn> => {
        try {  
            const getUnreadNotification = await TaskRepo.getUnreadNotification(userId);
            return { status: StatusCode.OK as number, message: "Task Fetched By Id Successfully." ,UnreadNotification:getUnreadNotification};
        }catch (error) {
                console.error("Error during getting notification:", error);
                return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
            }
    };
    getHistory = async (taskId:number): Promise<PromiseReturn> => {
        try {  
            const existingTask = await TaskRepo.findTaskById(taskId);
            if (!existingTask) {
                return { status: StatusCode.NotFound as number, message: "Task not found." };
            }
            const getHistory = await TaskRepo.getHistory(taskId);
            if(!getHistory){
                return {status: StatusCode.NotFound as number,message: "There is no history for this task",};
            }
            return { status: StatusCode.OK as number, message: "Task Fetched By Id Successfully." ,taskHistory:getHistory};
        }catch (error) {
                console.error("Error during getting history:", error);
                return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
            }
    };
    NotificationSending=async(message:string,task:Task,assignedUser:User):Promise<Notification | null> => {
        try {

            const existingNotification=await TaskRepo.getExistingNotification(message,assignedUser.id,task.title,task.id)
            // If no duplicate notification exists, create a new one
            if (!existingNotification) {
                const notification = new Notification();
                notification.message = `You have been assigned a new task: ${task.title}`;
                notification.isRead = false;
                notification.recipient = assignedUser; // Set the new user as the recipient
                notification.task = task; 
                return await TaskRepo.saveNotification(notification);
            }else{
                console.log("already notification exist");
                return null
            }
        } catch (error) {
            console.error("Error during task creation:", error);
            throw new Error("Failed to save notification");

        }
    }


    TaskHistoryLogging = async (task: Task, user: User, action: string, details: string):Promise<TaskHistory> => {
        try {
            const taskHistory = new TaskHistory();
            taskHistory.task = task; // Set the task related to the history log
            taskHistory.user = user; // Set the user who performed the action
            taskHistory.action = action; // Set the action (e.g., "assigned", "status_changed")
            taskHistory.details = details; // Add any relevant details about the action
    
            // Save the task history in the database
            return await TaskRepo.saveTaskHistory(taskHistory);
        } catch (error) {
            console.error("Error during task history logging:", error);
            throw new Error("Failed to save task history");
        }
    };
    
}