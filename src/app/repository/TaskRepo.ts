import { DeepPartial, In, LessThan, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import { Team } from '../../entity/Team';
import { Brand } from '../../entity/Brand';
import { GetAllUser, BrandContactData, BrandData, BrandOwnershipData, RoleName, UserData, TaskData, TaskCommentData, FilterOptions } from '../../interfaces/interface';
import { BrandContact } from '../../entity/BrandContact';
import { BrandOwnership } from '../../entity/BrandOwnership';
import bcrypt from 'bcryptjs';
import { Task, TaskStatus } from '../../entity/Task';
import { StatusCode } from '../../interfaces/enum';
import UserRepo from './UserRepo'
import { Notification } from '../../entity/Notification';
import { TaskHistory } from '../../entity/TaskHistory';
import { TaskComment } from '../../entity/TaskComment';

export default new class TaskRepo {

    private UserRepo: Repository<User>;
    private TeamRepo: Repository<Team>;
    private BrandRepo: Repository<Brand>;
    private BrandContactRepo: Repository<BrandContact>;
    private BrandOwnershipRepo: Repository<BrandOwnership>;
    private TaskRepo: Repository<Task>;
    private NotificationRepo: Repository<Notification>;
    private TaskHistoryRepo: Repository<TaskHistory>;
    private CommentRepo: Repository<TaskComment>;

    constructor() {
        this.UserRepo = AppDataSource.getRepository(User);
        this.TeamRepo = AppDataSource.getRepository(Team);
        this.BrandRepo = AppDataSource.getRepository(Brand);
        this.BrandContactRepo = AppDataSource.getRepository(BrandContact);
        this.BrandOwnershipRepo = AppDataSource.getRepository(BrandOwnership);
        this.TaskRepo = AppDataSource.getRepository(Task);
        this.NotificationRepo = AppDataSource.getRepository(Notification);
        this.TaskHistoryRepo = AppDataSource.getRepository(TaskHistory);
        this.CommentRepo = AppDataSource.getRepository(TaskComment);
    }

     // Existing method to find a user by ID
     async createTask(taskData: TaskData): Promise<Task | null> {
        try {
            console.log(taskData);
            const task=this.TaskRepo.create(taskData)
            const createdTask = await this.TaskRepo.save(task); // Save the task to the database
            return createdTask; // Return the created task
        } catch (error) {
            console.error("Error when creating task:", error);
            throw error; 
        }
    }
    async saveTask(task: Task): Promise<Task> {
        try {            
            const savedTask = await this.TaskRepo.save(task); // Save the task to the database
            return savedTask; // Return the saved task (whether new or updated)
        } catch (error) {
            console.error("Error saving task:", error);
            throw new Error("Failed to save task");
        }
    }
    async deleteTask(taskId: number): Promise<Task | number> {
        try {            
            const deleteTask = await this.TaskRepo.delete(taskId);
            if (deleteTask.affected === 0) {
                throw new Error('Task not found or already deleted');
            }            
            return taskId ;; // Return the saved task (whether new or updated)
        } catch (error) {
            console.error("Error saving task:", error);
            throw new Error("Failed to save task");
        }
    }
    async getAllTasks(isComplete: boolean): Promise<Task[] | null> {
        try {
            const statusToCheck = isComplete ? TaskStatus.Completed : TaskStatus.Pending;
            const gettingAllTasks = await this.TaskRepo.find({
                where: { status: statusToCheck }, // Filter tasks based on the status
                relations: ['assignedTo', 'createdBy', 'brand', 'inventory', 'event'], // Include any other relations you need
            });
            return gettingAllTasks;
        } catch (error) {
            console.error("Error getting all tasks:", error);
            throw error;
        }
    }

    async getYourTask(userId: number, isComplete: boolean): Promise<Task[]> {
        try {
            const statusToCheck = isComplete ? TaskStatus.Completed : TaskStatus.Pending;
    
            return await this.TaskRepo.createQueryBuilder("task")
                .leftJoinAndSelect("task.assignedTo", "assignedTo") // Join with assigned user
                .leftJoinAndSelect("task.createdBy", "createdBy")   // Join with creator user
                .leftJoinAndSelect("task.brand", "brand")           // Join with brand
                .leftJoinAndSelect("task.inventory", "inventory")   // Join with inventory
                .leftJoinAndSelect("task.event", "event")           // Join with event
                .where("task.assigned_to = :userId", { userId })    // Match the assigned user
                .andWhere("task.status = :status", { status: statusToCheck }) // Match the task status based on isComplete
                .getMany(); // Fetch all matching tasks with relations
        } catch (error) {
            console.error("Error fetching user's tasks:", error);
            throw new Error("Failed to fetch tasks");
        }
    }
    
    async getDelegatedToOthersTask(created_by: number,isComplete: boolean): Promise<Task[]> {
        try {
            const statusCondition = isComplete ? TaskStatus.Completed : TaskStatus.Pending;

            return await this.TaskRepo.createQueryBuilder("task")
                .leftJoinAndSelect("task.assignedTo", "assignedTo") // Join with assigned user
                .leftJoinAndSelect("task.createdBy", "createdBy") // Join with creator user
                .leftJoinAndSelect("task.brand", "brand") // Join with brand
                .leftJoinAndSelect("task.inventory", "inventory") // Join with inventory
                .leftJoinAndSelect("task.event", "event") // Join with event
                .where("task.created_by = :created_by", { created_by })
                .andWhere("task.status = :status", { status: statusCondition }) // Check completion status
                .getMany(); // Filter by creator user
        } catch (error) {
            console.error("Error fetching user's tasks:", error);
            throw new Error("Failed to fetch tasks");
        }
    }


    async getTeamTask(userId: number,isComplete: boolean): Promise<Task[]> {
        try {
            // Fetch the team ID of the user
            const user=await UserRepo.findUserById(userId)
    
            if (!user || !user.team) {
                throw new Error("admin can't have the team task");
            }
    
            const teamId = user.team.id; // Assuming the team has an 'id' field
            const statusCondition = isComplete ? TaskStatus.Completed : TaskStatus.Pending;

            // Fetch tasks assigned to all users in the same team
            return await this.TaskRepo.createQueryBuilder("task")
                .leftJoinAndSelect("task.assignedTo", "assignedTo")
                .leftJoinAndSelect("task.createdBy", "createdBy")
                .leftJoinAndSelect("task.brand", "brand")
                .leftJoinAndSelect("task.inventory", "inventory")
                .leftJoinAndSelect("task.event", "event")
                .where("assignedTo.team_id = :teamId", { teamId }) // Replace with the correct foreign key name
                .andWhere("task.status = :status", { status: statusCondition }) // Check completion status
                .getMany();// Fetch all tasks assigned to users in the team
        } catch (error) {
            if (error.message === "admin can't have the team task") {
                throw new Error("admin can't have the team task");
            }
            console.error("Error fetching team tasks:", error);
            throw new Error("Failed to fetch team tasks");
        }
    }
    async findTaskById(taskId: number): Promise<Task| null> {
        try {
            // Fetch the team ID of the user
            const taskById=await this.TaskRepo.findOne({
                where: { id: taskId },
                relations: [
                    'assignedTo', // Load the user the task is assigned to
                    'createdBy', // Load the user who created the task
                    'brand', // Load the brand related to the task, if any
                    'inventory', // Load the inventory related to the task, if any
                    'event', // Load the event related to the task, if any
                    'comments', // Load all comments on the task
                    'notifications', // Load all notifications related to the task
                    'history' // Load the task history records
                ]
            });
            return taskById
        } catch (error) {
            console.error("Error fetching by id tasks:", error);
            throw new Error("Failed to fetch team tasks");
        }
    }
    async getUnreadNotification(userId: number): Promise<Notification[] | null> {
        try {
            const unreadNotifications = await this.NotificationRepo.find({
                where: {
                    recipient: { id: userId }, // Filter by recipient ID (user)
                    isRead: false // Only fetch unread notifications
                },
                relations: ['recipient', 'task'], // Optionally load related entities like User and Task
                order: {
                    createdAt: 'DESC' // Sort by creation date if needed
                }
            });
            if (unreadNotifications.length > 0) {
                const notificationIds = unreadNotifications.map(notification => notification.id); // Get the IDs of unread notifications
                
                // Update isRead to true for the unread notifications in a single query
                await this.NotificationRepo.createQueryBuilder()
                    .update(Notification)
                    .set({ isRead: true }) // Set isRead to true
                    .where("id IN (:...ids)", { ids: notificationIds }) // Use the collected IDs
                    .execute();
            }
            return unreadNotifications;
        } catch (error) {
            console.error("Error fetching unread notifications:", error);
            throw new Error("Failed to fetch unread notifications");
        }
    }
    async getHistory(taskId: number): Promise<TaskHistory[] | null> {
        try {
            // Fetch all task history records related to the specified task ID
            const taskHistoryRecords = await this.TaskHistoryRepo.find({
                where: {
                    task: { id: taskId }, // Filter by task ID
                },
                relations: ['user'], // Optionally load related User entity
                order: {
                    createdAt: 'DESC', // Sort by creation date if needed
                },
            });
            
            // Return the fetched task history records
            return taskHistoryRecords.length > 0 ? taskHistoryRecords : null;
        } catch (error) {
            console.error("Error fetching task history:", error);
            throw new Error("Failed to fetch task history");
        }
    }
    async getExistingNotification(message:string,newAssignedUserId:number,existingTitle:string,taskId:number): Promise<Notification | null> {
        try {
            const existingNotification = await this.NotificationRepo.findOne({
                where: {
                    recipient: { id: newAssignedUserId },
                    task: { id: taskId },
                    message: message,
                    isRead: false // You can add more conditions here if needed
                }
            });
            return existingNotification;
        } catch (error) {
            console.error("Error fetching unread notifications:", error);
            throw new Error("Failed to fetch unread notifications");
        }
    }
    

    async saveNotification(notification: Notification): Promise<Notification> {
        try {
            const savedNotification = await this.NotificationRepo.save(notification); // Save the notification to the database
            return savedNotification; // Return the saved notification
        } catch (error) {
            console.error("Error saving notification:", error);
            throw new Error("Failed to save notification");
        }
    }

    async saveBatchNotification(notifications: Notification[]): Promise<Notification[]> {
        return await this.NotificationRepo.save(notifications);
    }
    async saveTaskHistory(taskHistory: TaskHistory): Promise<TaskHistory> {
        try {
            const savedTaskHistory = await this.TaskHistoryRepo.save(taskHistory); // Save the task history to the database
            return savedTaskHistory; // Return the saved task history entry
        } catch (error) {
            console.error("Error saving task history:", error);
            throw new Error("Failed to save task history");
        }
    }

    async createComment(commentData: DeepPartial<TaskCommentData>): Promise<TaskComment> {
        try {
            const comment = this.CommentRepo.create(commentData);
            return await this.CommentRepo.save(comment);
        } catch (error) {
            console.error("Error when saving comment:", error);
            throw error;
        }
    }

    async getFilteredAndSortedTasks(filters: FilterOptions): Promise<Task[]> {
        const query = this.TaskRepo.createQueryBuilder("task")
            .leftJoinAndSelect("task.assignedTo", "assignedTo")
            .leftJoinAndSelect("task.createdBy", "createdBy")
            .leftJoinAndSelect("task.brand", "brand")
            .leftJoinAndSelect("task.inventory", "inventory")
            .leftJoinAndSelect("task.event", "event");

        // Apply filters
        if (filters.type) {
            query.andWhere("task.type = :taskType", { taskType: filters.type });
        }
        if (filters.assignedBy) {
            query.andWhere("task.created_by = :assignedBy", { assignedBy: filters.assignedBy });
        }
        if (filters.assignedTo) {
            query.andWhere("task.assigned_to = :assignedTo", { assignedTo: filters.assignedTo });
        }
        if (filters.teamOwner) {
            query.andWhere("assignedTo.team_id = :teamOwner", { teamOwner: filters.teamOwner });
        }
        if (filters.dueDatePassed) {
            query.andWhere("task.due_date < NOW()"); // Assuming due_date is a field in Task
        }
        if (filters.brandName) {
            query.andWhere("brand.name LIKE :brandName", { brandName: `%${filters.brandName}%` });
        }
        if (filters.inventoryName) {
            query.andWhere("inventory.name LIKE :inventoryName", { inventoryName: `%${filters.inventoryName}%` });
        }
        if (filters.eventName) {
            query.andWhere("event.name LIKE :eventName", { eventName: `%${filters.eventName}%` });
        }

        // Apply sorting
        if (filters.sortBy) {
            const order = filters.sortOrder === 'DESC' ? 'DESC' : 'ASC';
            query.orderBy(`task.${filters.sortBy}`, order);
        }

        return await query.getMany();
    }

    async findDueTasks(now: Date, twelveHoursFromNow: Date): Promise<Task[]> {
        return await this.TaskRepo.find({
            where: [
                {
                    dueDate: MoreThanOrEqual(now),
                },
                {
                    dueDate: LessThan(twelveHoursFromNow),
                },
            ],
            relations: ['assignedTo'], // Assuming assignedTo is a User entity
        });
    }

    // Method to fetch all users
    async findAllUsers(): Promise<User[]> {
        return await this.UserRepo.find();
    }



    async countTasksCreated(startDate: Date, endDate: Date): Promise<number> {
        return await this.TaskRepo.count({
            where: {
                createdAt: MoreThanOrEqual(startDate), // This is fine
                dueDate: LessThan(endDate), // Use a different property or the correct one
            },
        });
    }

    async countOpenTasks(startDate: Date, endDate: Date): Promise<number> {
        return await this.TaskRepo.count({
            where: {
                createdAt: MoreThanOrEqual(startDate),
                dueDate: LessThan(endDate),
                status: TaskStatus.Pending, // Adjusted to use the enum
            },
        });
    }

    async countCompletedTasks(startDate: Date, endDate: Date): Promise<number> {
        return await this.TaskRepo.count({
            where: {
                createdAt: MoreThanOrEqual(startDate),
                dueDate: LessThan(endDate),
                status: TaskStatus.Completed, // Adjusted to use the enum
            },
        });
    }

    async countOverdueTasks(now: Date): Promise<number> {
        return await this.TaskRepo.count({
            where: {
                dueDate: LessThan(now),
                status: TaskStatus.Pending, // Assuming you want overdue tasks that are still open
            },
        });
    }

    async findAllTasks(): Promise<Task[]> {
        return await this.TaskRepo.find();
    }
}