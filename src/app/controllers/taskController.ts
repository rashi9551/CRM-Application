import {Response,Request} from 'express'
import { StatusCode } from '../../interfaces/enum'
import TaskUseCase from '../useCase/taskUseCase'
import { UserData, UserLoginData ,BrandData, TaskData, TaskType, TaskCommentData, FilterOptions} from '../../interfaces/interface'

export default new class TaskController{

    createTask=async(req:Request,res:Response)=>{
        try {
            console.log("user creating  task...");
            const taskData:TaskData=req.body
            const createTaskResponse=await TaskUseCase.createTask(taskData)
            res.status(createTaskResponse.status).json(createTaskResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    updateTask=async(req:Request,res:Response)=>{
        try {
            console.log("user creating  updating task...");
            const taskData:TaskData=req.body
            const updateTaskResponse=await TaskUseCase.updateTask(taskData,+req.id,req.role)
            res.status(updateTaskResponse.status).json(updateTaskResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    deleteTask=async(req:Request,res:Response)=>{
        try {
            console.log("user creating  deleting task...");
            const taskId:number=+req.params.id
            const deleteTaskResponse=await TaskUseCase.deleteTask(taskId,+req.id,req.role)
            res.status(deleteTaskResponse.status).json(deleteTaskResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    getTasks=async(req:Request,res:Response)=>{
        try {
            console.log("user getting  tsaks...");
            console.log("loggedUser:",req.id);
            
            const filter:TaskType=req.body.filter
            const isComplete:boolean=req.body.isCompleted
            const getTasksResponse=await TaskUseCase.getTasks(filter,req.id,req.role,isComplete)
            res.status(getTasksResponse.status).json(getTasksResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    getTask=async(req:Request,res:Response)=>{
        try {
            console.log("user getting  taskByID...");
            const taskId=req.params.id
            const getTasksResponse=await TaskUseCase.getTask(+taskId)
            res.status(getTasksResponse.status).json(getTasksResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    getNotification=async(req:Request,res:Response)=>{
        try {
            console.log("user getting  notification...");
            const userId=req.params.id
            const getNotificationResponse=await TaskUseCase.getNotification(+userId)
            res.status(getNotificationResponse.status).json(getNotificationResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }
    getHistory=async(req:Request,res:Response)=>{
        try {
            console.log("user getting  History...");
            const taskId=req.params.id
            const getHistoryResponse=await TaskUseCase.getHistory(+taskId)
            res.status(getHistoryResponse.status).json(getHistoryResponse)
        } catch (error) {
            console.log(error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error  ' }); 
        }
    }

    addComment = async (req: Request, res: Response) => {
        try {
            const files = req.files as Express.Multer.File[] || [];
            // Extract file paths and types for multiple files
            const filePaths = files.map(file => file.path);
            const fileTypes = files.map(file => file.mimetype);
    
            const commentData: TaskCommentData = {
                comment: req.body.comment,             // Extract the comment text
                filePaths,                             // Store array of file paths
                fileTypes,                             // Store array of file types
                taskId: req.body.taskId,               // Extract the task ID from the request body
                userId: req.id,                        // Assuming user ID is set in req.user during token verification
            };
    
            console.log(commentData);
            
            // Call use case to save the comment
            const createCommentResponse = await TaskUseCase.createComment(commentData, req.id, req.role); 
            res.status(createCommentResponse.status).json(createCommentResponse);
        } catch (error) {
            console.error('Error adding comment:', error);
            return res.status(StatusCode.InternalServerError).json({ message: 'Internal Server Error' });
        }
    };

    getFilteredAndSortedTasks=async(req: Request, res: Response): Promise<Response> =>{
        console.log("user filtering  task...");
        const {
            type,
            assignedBy,
            assignedTo,
            teamOwner,
            dueDatePassed,
            brandName,
            inventoryName,
            eventName,
            sortBy,
            sortOrder,
        }:FilterOptions = req.body;

        try {
            const taskFilteringReponse = await TaskUseCase.getFilteredAndSortedTasks({
                type,
                assignedBy,
                assignedTo,
                teamOwner,
                dueDatePassed,
                brandName,
                inventoryName,
                eventName,
                sortBy,
                sortOrder,
            });

            return res.status(taskFilteringReponse.status).json(taskFilteringReponse);
        } catch (error) {
            console.error("Error fetching filtered and sorted tasks:", error);
            return res.status(500).json({ message: "Failed to fetch tasks" });
        }
    }
    getAnalytics=async(req: Request, res: Response): Promise<Response> =>{
        console.log("user getting analytics  task...");
        try {
            const analyticsReponse=await TaskUseCase.getAnalytics(req.body.filter)
            return res.status(200).json(analyticsReponse);
        } catch (error) {
            console.error("Error fetching analytics of organisation:", error);
            return res.status(500).json({ message: "Failed to fetch tasks" });
        }
    }
    

}