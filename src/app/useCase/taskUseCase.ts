import { validateOrReject } from 'class-validator';
import { User } from '../../entity/User';
import { StatusCode } from '../../interfaces/enum';
import { FilterOptions, PromiseReturn,  RoleName,  TaskCommentData,  TaskData, TaskHistoryAction, TaskType } from '../../interfaces/interface';
import { Task} from '../../entity/Task';
import UserRepo from '../repository/UserRepo';
import TaskRepo from '../repository/TaskRepo';
import { Notification } from '../../entity/Notification';
import { TaskHistory } from '../../entity/TaskHistory';
import { TaskComment } from '../../entity/TaskComment';
import {AnalyticsFilter} from '../../interfaces/interface'
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
    deleteTask = async (taskId:number,loggedUserId:number): Promise<PromiseReturn> => {
        try {  
            const existingTask = await TaskRepo.findTaskById(taskId);            
            if (!existingTask) {
                return { status: StatusCode.NotFound as number, message: "Task not found." };
            }
           await TaskRepo.deleteTask(taskId);
            return { status: StatusCode.OK as number, message: "Task deleted Successfully."};
        }catch (error) {
                console.error("Error during getting task :", error);
                return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
            }
    };
    
    getTasks = async (filter: TaskType,loggedUserId:number,role?:String[],isCompleted?:boolean): Promise<PromiseReturn> => {
        try {  
            console.log(filter);
            if(filter===TaskType.AllTasks){
                const tasks = await TaskRepo.getAllTasks(isCompleted);            
                if (tasks) return {status: StatusCode.OK as number,message: "Successfully fetched All Tasks",task:tasks};
            } 
            if(filter===TaskType.YourTasks){
                const tasks = await TaskRepo.getYourTask(loggedUserId,isCompleted);            
                if (tasks) return {status: StatusCode.OK as number,message: "Successfully fetched  your Tasks",task:tasks};
            } 
            if(filter===TaskType.TeamTasks){
                const hasAccess = role?.some(r => [RoleName.MANAGEMENT, RoleName.ADMIN, RoleName.TO].includes(r as RoleName));
                if (hasAccess) {
                    const tasks = await TaskRepo.getTeamTask(loggedUserId,isCompleted);            
                    if (tasks) return {status: StatusCode.OK as number,message: "Successfully fetched  team Tasks",task:tasks};
                } else {
                    return {status: StatusCode.Unauthorized as number,message: "only TO Can View The TeamTask",};
                }
            } 
            if(filter===TaskType.DelegatedToOthers){
                const tasks = await TaskRepo.getDelegatedToOthersTask(loggedUserId,isCompleted);            
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


    createComment = async (commentData: TaskCommentData): Promise<PromiseReturn> => {
        try {
            const existingTask = await TaskRepo.findTaskById(commentData.taskId);
            if (!existingTask) {
                return { status: StatusCode.NotFound as number, message: "Task not found." };
            }

            const existingUser: User = await UserRepo.getUserById(commentData.userId);

            if (!existingUser) return { status: StatusCode.NotFound as number, message: "Comment Added User Not Found" };
            const comment = new TaskComment();
            Object.assign(comment, commentData); 

            const savedComment = await TaskRepo.createComment(comment); 
            await this.TaskHistoryLogging(existingTask,existingUser,TaskHistoryAction.TASK_COMMENT_ADDED,`the task have a  new comment on: ${existingTask.title} by ${existingUser.name}`)
            return { status: StatusCode.Created as number, message: 'Comment added successfully', taskComent: savedComment };
        } catch (error) {
            console.error("Error when creating comment:", error);
            throw error;
        }
    };
    getFilteredAndSortedTasks = async (filterOptions:FilterOptions): Promise<PromiseReturn> => {
        try { 
            const filterTask = await TaskRepo.getFilteredAndSortedTasks(filterOptions); 
            if(!filterOptions){
                return { status: StatusCode.NotFound as number, message: "filter task  not found." };
            }
            return { status: StatusCode.Created as number, message: 'Comment added successfully', task: filterTask };
        } catch (error) {
            console.error("Error when creating comment:", error);
            throw error;
        }
    };



    async getAnalytics(filter: string): Promise<PromiseReturn> {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;
        let previousStartDate: Date;
        let previousEndDate: Date;
    
        // Set date ranges based on the filter
        switch (filter) {
            case AnalyticsFilter.Today:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // Yesterday
                previousEndDate = startDate; // Today
                break;
            case AnalyticsFilter.Last3Days:
                startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
                endDate = now;
                previousStartDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // Previous 3 days
                previousEndDate = startDate; // Last 3 days
                break;
            case AnalyticsFilter.Last7Days:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
                previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // Previous week
                previousEndDate = startDate; // Last week
                break;
            case AnalyticsFilter.Last15Days:
                startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
                endDate = now;
                previousStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Previous 15 days
                previousEndDate = startDate; // Last 15 days
                break;
            case AnalyticsFilter.LastMonth:
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 1);
                previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); // Previous month
                previousEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Last month
                break;
            case AnalyticsFilter.ThisMonth:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Rough estimate of a month
                previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Previous month
                previousEndDate = new Date(now.getFullYear(), now.getMonth(), 1); // Last month
                break;
            case AnalyticsFilter.AllTime:
                startDate = new Date(0); // Earliest date
                endDate = now;
                previousStartDate = new Date(0); // Earliest date
                previousEndDate = startDate; // All time
                break;
            default:
                throw new Error('Invalid filter');
        }
    
        // Fetching the data for the current period
        const totalTasksCreated = await TaskRepo.countTasksCreated(startDate, endDate);
        const openTasks = await TaskRepo.countOpenTasks(startDate, endDate);
        const completedTasks = await TaskRepo.countCompletedTasks(startDate, endDate);
        const overdueTasks = await TaskRepo.countOverdueTasks(now);
    
        // Fetching the data for the previous period for comparison
        const totalTasksCreatedPrevious = await TaskRepo.countTasksCreated(previousStartDate, previousEndDate);
        const openTasksPrevious = await TaskRepo.countOpenTasks(previousStartDate, previousEndDate);
        const completedTasksPrevious = await TaskRepo.countCompletedTasks(previousStartDate, previousEndDate);
        const overdueTasksPrevious = await TaskRepo.countOverdueTasks(previousEndDate); // Using now for overdue tasks
    
        // Constructing comparison strings
        const totalTasksComparison = totalTasksCreated - totalTasksCreatedPrevious;
        const openTasksComparison = openTasks - openTasksPrevious;
        const completedTasksComparison = completedTasks - completedTasksPrevious;
        const overdueTasksComparison = overdueTasks - overdueTasksPrevious;
    
        return {
            message:"analatycs fetched successfully",
            status:200,
            analytics: {
                [filter]: {
                    totalTasksCreated,
                    openTasks,
                    completedTasks,
                    overdueTasks,
                    comparison: {
                        totalTasksCreated: `Total Tasks Created: ${totalTasksComparison >= 0 ? '+' : ''}${totalTasksComparison} compared to previous period`,
                        openTasks: `Open Tasks: ${openTasksComparison >= 0 ? '+' : ''}${openTasksComparison} compared to previous period`,
                        completedTasks: `Completed Tasks: ${completedTasksComparison >= 0 ? '+' : ''}${completedTasksComparison} compared to previous period`,
                        overdueTasks: `Overdue Tasks: ${overdueTasksComparison >= 0 ? '+' : ''}${overdueTasksComparison} compared to previous period`,
                    },
                },
            },
        };
    }


    
}