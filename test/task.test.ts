import TaskRepo from '../src/app/repository/TaskRepo'; // Adjust accordingly
import userRepo from '../src/app/repository/UserRepo'; // Adjust accordingly
import { GetAllUser, Department, RoleName, UserData, BrandData, BrandContactData, BrandOwnershipData, updatingUserData, EventData, InventoryData, Type, FilterOptions, TaskCommentData, TaskType, TaskData } from '../src/interfaces/interface'; // Adjust accordingly
import { StatusCode } from '../src/interfaces/enum';
import { User } from '../src/entity/User';
import { Team } from '../src/entity/Team';
import { Event } from '../src/entity/Event';
import bcrypt from 'bcryptjs';
import { Brand } from '../src/entity/Brand';
import { BrandContact } from '../src/entity/BrandContact';
import useCase from '../src/app/useCase/userUseCase'
import taskUseCase from '../src/app/useCase/taskUseCase'
import { Inventory } from '../src/entity/inventory';
import { Task, TaskStatus } from '../src/entity/Task';
import { TaskComment } from '../src/entity/TaskComment';
import { TaskHistory } from '../src/entity/TaskHistory';
import { Notification } from '../src/entity/Notification';
import { validateOrReject } from 'class-validator';
import { BrandCreateReponseData } from './brand.test';



const mockUserCreateResponseData:User={
    name: "Rashid",
    department: Department.DEVELOPMENT,
    phoneNumber: "9867452323",
    email: "rashid@gmail.com",
    password: "$2a$10$6hmonDVFAysPWVrLft9D4.RS3/4bT.LXHuItFJQnI4aSSV4WFTjnG",
    roles: [
        RoleName.TO
    ],
    parentId: 1,
    teamId: 1,
    id: 4,
    createdAt: new Date(),
    parent: new User,
    children: [],
    brandOwnerships: [],
    team: {
        id: 1,
        toUserId: 1,
        createdAt: new Date,
        users: [new User],
        teamOwner: new User
    }
    ,
    userTeams: [],
    assignedTasks: [],
    createdTasks: [],
    comments: [],
    notifications: [],
    taskHistories: []
}

const mockCreateUserData:UserData={
    name: "Rashid",
    department: Department.DEVELOPMENT,
    phoneNumber: "9867452323",
    email: "rashid@gmail.com",
    password: "12345",
    roles: [RoleName.TO], // At least one role must be provided
    teamId: null, // Required if a TO is selected
    parentId: 1
}



const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;

jest.mock('../src/app/repository/UserRepo', () => ({
    findUserByEmail: jest.fn(),
    userExist: jest.fn(),
    createUser: jest.fn(),
    findTeamById: jest.fn(),
    findUsersByRole: jest.fn(),
    findUserById: jest.fn(),
    saveUser: jest.fn(),
    checkForCycle: jest.fn(),
    getUserTree: jest.fn(),
    getUserById: jest.fn(),
    updateChildrenParentId: jest.fn(),
    deleteUserById: jest.fn(),
    createEvent: jest.fn(),
    findEventByName: jest.fn(),
    findInventoryByName: jest.fn(),
    createInventory: jest.fn(),
    getAllInventory: jest.fn(),
    getAllEvent: jest.fn(),
    findInventoryById: jest.fn(),
    findEventById: jest.fn(),
    getBrandDetail: jest.fn(),
    addingBrandContact: jest.fn(),
    findBrandByName: jest.fn(),
    findBrandByID: jest.fn(),
    createBrand: jest.fn(),
    saveBrand: jest.fn(),
}));

const taskRepoMock = TaskRepo as jest.Mocked<typeof TaskRepo>;

jest.mock('../src/app/repository/TaskRepo', () => ({
    countTasksCreated: jest.fn(),
    countOpenTasks: jest.fn(),
    countCompletedTasks: jest.fn(),
    countOverdueTasks: jest.fn(),
    getFilteredAndSortedTasks: jest.fn(),
    findTaskById: jest.fn(),
    createComment: jest.fn(),
    saveTaskHistory: jest.fn(),
    getExistingNotification: jest.fn(),
    saveNotification: jest.fn(),
    getHistory: jest.fn(),
    getUnreadNotification: jest.fn(),
    getAllTasks: jest.fn(),
    getTeamTask: jest.fn(),
    getYourTask: jest.fn(),
    getDelegatedToOthersTask: jest.fn(),
    deleteTask: jest.fn(),
    saveTask: jest.fn(),
    createTask: jest.fn(),

}));


describe('getAnalytics', () => {
    it('should fetch analytics data for Today', async () => {
        // Arrange: Set up mock return values for your TaskRepo methods
        taskRepoMock.countTasksCreated.mockResolvedValue(10);
        taskRepoMock.countOpenTasks.mockResolvedValue(5);
        taskRepoMock.countCompletedTasks.mockResolvedValue(3);
        taskRepoMock.countOverdueTasks.mockResolvedValue(2);

        const filter = "Today"; // Example filter

        // Act
        const response = await taskUseCase.getAnalytics(filter);

        // Assert
        expect(response).toEqual({
            message: "analytics fetched successfully",
            status: StatusCode.OK, // Use StatusCode for consistency
            analytics: {
                [filter]: {
                    totalTasksCreated: 10,
                    openTasks: 5,
                    completedTasks: 3,
                    overdueTasks: 2,
                    comparison: {
                        totalTasksCreated: expect.any(String),
                        openTasks: expect.any(String),
                        completedTasks: expect.any(String),
                        overdueTasks: expect.any(String),
                    },
                },
            },
        });
    });

    it('should throw error for invalid filter', async () => {
        // Act
        await expect(taskUseCase.getAnalytics("InvalidFilter")).rejects.toThrow('Invalid filter');
    });
});



const mockFilterOptions:FilterOptions = {
    type: "Brand",                     // Filter by task type
    assignedBy: 4,                     // Filter by the user who created the task (Rasmina in your case)
    assignedTo: 4,                     // Filter by the user assigned to the task (Rasmina again in your example)
    teamOwner: 2,                      // Filter by the team owner (Optional, based on your business logic)
    dueDatePassed: false,              // Filter by whether the due date has passed
    brandName: "Adidas",               // Filter by brand name
    sortBy: "createdAt",               // Sort by task creation date
    status: "Completed",               // Filter by task status
    sortOrder: "ASC"                   // Sort order (ascending)
}

;

const task :Task={
    id: 3,
    title: "Evolution on clothing",
    description: "Design",
    type: Type.Brand,
    status: TaskStatus.Pending,
    createdAt: new Date,
    due_date: new Date,
    assigned_to: 4,
    created_by: 4,
    brand_id: 1,
    inventoryId: undefined,
    eventId: undefined,
    sla: true,
    assignedTo: mockUserCreateResponseData,
    createdBy: mockUserCreateResponseData,
    brand: new Brand,
    inventory: new Inventory,
    event: new Event,
    comments: [],
    notifications: [],
    history: []
}


const mockFilteredTasks :Task[]= [
    {
        id: 3,
        title: "Evolution on clothing",
        description: "Design",
        type: Type.Brand,
        status: TaskStatus.Pending,
        createdAt: new Date,
        due_date: new Date,
        assigned_to: 4,
        created_by: 4,
        brand_id: 1,
        inventoryId: undefined,
        eventId: undefined,
        sla: true,
        assignedTo: new User,
        createdBy: new User,
        brand: new Brand,
        inventory: new Inventory,
        event: new Event,
        comments: [],
        notifications: [],
        history: []
    },
    
];

describe('getFilteredAndSortedTasks', () => {
    it('should fetch filtered and sorted tasks successfully', async () => {

        taskRepoMock.getFilteredAndSortedTasks.mockResolvedValue(mockFilteredTasks);

        // Act
        const response = await taskUseCase.getFilteredAndSortedTasks(mockFilterOptions);

        // Assert
        expect(response).toEqual({
            status: StatusCode.Created,
            message: 'Filtered task successfully retrieved.',
            task: mockFilteredTasks,
        });
    });

    it('should return NotFound status when filter options are not provided', async () => {
        // Act
        const response = await taskUseCase.getFilteredAndSortedTasks();

        // Assert
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "Filter options not provided.",
        });
    });

    it('should return NotFound status when no tasks match the filter options', async () => {
        // Arrange
        const mockFilterOptions = { /* your filter options here */ };
        taskRepoMock.getFilteredAndSortedTasks.mockResolvedValue([]);

        // Act
        const response = await taskUseCase.getFilteredAndSortedTasks(mockFilterOptions);

        // Assert
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "No tasks found matching the filters.",
        });
    });

    it('should throw an error if TaskRepo throws an error', async () => {
        // Arrange
        const mockFilterOptions = { /* your filter options here */ };
        taskRepoMock.getFilteredAndSortedTasks.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(taskUseCase.getFilteredAndSortedTasks(mockFilterOptions)).rejects.toThrow('Database error');
    });
});



describe('createComment', () => {
    const mockCommentData: TaskCommentData = {
        comment: 'you want more pace', // Example comment content
        filePaths: ['uploads/1729167256635-1707328364723.jpeg'], // Example file paths
        taskId: 1, // Assuming taskId is required
        userId: 1, // Assuming userId is required
    };

    const loggedUserId = 1; // Assuming the logged-in user's ID is 1
    const roles = [RoleName.TO]; // Example roles array for testing

    it('should add a comment successfully', async () => {
        // Arrange
        const savedComment: TaskComment = {
            ...mockCommentData,
            id: 2, // Mock comment ID
            createdAt: new Date(), // Mock createdAt as a string
            filePaths:[],
            task: new Task(),
            user: new User()
        };
        const mockHistory:TaskHistory={
            taskId: 3,
            userId: 4,
            action: " Task Updated",
            details: "The Task Evolution on clothing was updated by undefined",
            id: 16,
            createdAt: new Date,
            task: new Task,
            user: new User
        }
        

        // Mocking the necessary repository methods
        taskRepoMock.findTaskById.mockResolvedValue(task);
        userRepoMock.getUserById.mockResolvedValue(mockUserCreateResponseData);
        taskRepoMock.createComment.mockResolvedValue(savedComment);
        taskRepoMock.saveTaskHistory.mockResolvedValue(mockHistory); // Mock the task history saving

        // Act
        const response = await taskUseCase.createComment(mockCommentData, loggedUserId, roles);

        // Assert
        expect(response).toEqual({
            status: StatusCode.Created,
            message: 'Comment added successfully',
            taskComent: {
                comment: 'you want more pace',
                filePaths: [],
                taskId: 1, // Use the original taskId here
                userId: 1,
                id: 2,
                task:new Task,
                user:new User,
                createdAt:  expect.any(Date), // Validate that createdAt is a valid string (ISO date)
            },
        });
    });
    it('should return NotFound status when the task is not found', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(null); // Simulate task not found

        // Act
        const response = await taskUseCase.createComment(mockCommentData, loggedUserId, roles);

        // Assert
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "Task not found.",
        });
    });

    it('should return NotFound status when the user is not found', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(task);
        userRepoMock.getUserById.mockResolvedValue(null); // Simulate user not found

        // Act
        const response = await taskUseCase.createComment(mockCommentData, loggedUserId, roles);

        // Assert
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "Comment Added User Not Found",
        });
    });

    it('should return Unauthorized status when the user does not have permission to comment', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(task); // Task exists
        userRepoMock.getUserById.mockResolvedValue(mockUserCreateResponseData); // User exists

        // Act
        const response = await taskUseCase.createComment(mockCommentData, 2, roles);

        // Assert
        expect(response).toEqual({
            status: StatusCode.Unauthorized,
            message: `You do not have permission to comment on this task: ${task.title}.`,
        });
    });

    it('should throw an error if TaskRepo throws an error', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(task);
        userRepoMock.getUserById.mockResolvedValue(mockUserCreateResponseData);
        taskRepoMock.createComment.mockRejectedValue(new Error('Database error')); // Simulate error on comment creation

        // Act & Assert
        await expect(taskUseCase.createComment(mockCommentData, loggedUserId, roles)).rejects.toThrow('Database error');
    });
});



describe('TaskHistoryLogging', () => {

    const loggedUserId = 4; // Assuming logged-in user's ID is 1
    const action = 'Task Updated'; // Example action performed
    const details = 'The Task Evolution on clothing was updated by John Doe'; // Example details
    const taskHistory={
        id: 16, // Mock task history ID
        taskId: task.id,
        userId: loggedUserId,
        action,
        details,
        task:task,
        user:mockUserCreateResponseData,
        createdAt:expect.any(Date), // Mock createdAt value
    }
    // Mock repository behavior for saving task history
    TaskRepo.saveTaskHistory = jest.fn().mockResolvedValue(taskHistory);

    it('should log task history successfully', async () => {
        // Act
        const result = await taskUseCase.TaskHistoryLogging(task, action, details, loggedUserId);
        taskRepoMock.saveTaskHistory.mockResolvedValue(taskHistory)
        // Assert
        expect(result).toEqual({
            id: 16, // Ensure the ID matches
            taskId: task.id,
            userId: loggedUserId,
            action: ' Task Updated', // Ensure the action is correct
            details: 'The Task Evolution on clothing was updated by undefined', // Ensure the details are correct
            createdAt: expect.any(Date), // Ensure createdAt is valid and matches
            task:{},
            user:{}
        });

        // Check if the repository save function was called with the correct task history object
        expect(TaskRepo.saveTaskHistory).toHaveBeenCalledWith(expect.objectContaining({
            taskId: task.id,
            userId: loggedUserId,
            action,
            details,
        }));
    });

    it('should throw an error if saving task history fails', async () => {
        // Mock an error scenario
        taskRepoMock.saveTaskHistory.mockRejectedValue(new Error('Failed to save task history'));

        // Act & Assert
        await expect(taskUseCase.TaskHistoryLogging(task, action, details, loggedUserId))
            .rejects.toThrow('Failed to save task history');

        // Ensure the saveTaskHistory function was called once
        expect(TaskRepo.saveTaskHistory).toHaveBeenCalledTimes(3);
    });
});
const newNotification:Notification = {
    id: 1, // Mock notification ID
    message:"Task Assigned",
    isRead: false,
    recipient: new User,
    recipientId:2,
    task,
    createdAt: expect.any(Date), // Mock creation date
}

describe('NotificationSending', () => {

    const message = 'Task Assigned'; // Example notification message
    const recipientId = 4; // Example recipient ID
    const taskId = 1; // Mock task ID
    const assignedUser: User = { id: recipientId } as User; // Mock assigned user
    
   


    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should send a new notification if no existing notification is found', async () => {
        // Arrange
        taskRepoMock.getExistingNotification.mockResolvedValue(null); // No existing notification
        taskRepoMock.saveNotification.mockResolvedValue(newNotification); // Save the new notification

        // Act
        const result = await taskUseCase.NotificationSending(message, task, assignedUser, recipientId);

        // Assert
        expect(result).toEqual(newNotification);
        expect(taskRepoMock.getExistingNotification).toHaveBeenCalledWith(message, task.id, recipientId);
        expect(taskRepoMock.saveNotification).toHaveBeenCalledWith(expect.objectContaining({
            message,
            isRead: false,
            recipientId: assignedUser.id,  // Adjust based on your actual implementation
        }));
        
    });

    it('should not create a new notification if an existing notification is found', async () => {
        // Arrange
        const existingNotification: Notification = {
            id: 26,
            message: "Your task has been updated: Evolution on clothing",
            isRead: false,
            createdAt: new Date(),
            recipientId: 4,
            recipient: new User(),
            task: task
        } ;
        
        taskRepoMock.getExistingNotification.mockResolvedValue(existingNotification); // Existing notification found

        // Act
        const result = await taskUseCase.NotificationSending(message, task, assignedUser, recipientId);

        // Assert
        expect(result).toBeNull(); // No new notification should be created
        expect(taskRepoMock.getExistingNotification).toHaveBeenCalledWith(message, task.id, recipientId);
        expect(taskRepoMock.saveNotification).not.toHaveBeenCalled(); // Ensure saveNotification is not called
    });

    it('should throw an error if saving notification fails', async () => {
        // Arrange
        taskRepoMock.getExistingNotification.mockResolvedValue(null); // No existing notification
        taskRepoMock.saveNotification.mockRejectedValue(new Error('Failed to save notification')); // Mock error

        // Act & Assert
        await expect(taskUseCase.NotificationSending(message, task, assignedUser, recipientId))
            .rejects.toThrow('Failed to save notification');

        // Ensure the saveNotification function was called
        expect(taskRepoMock.saveNotification).toHaveBeenCalledTimes(1);
    });

});



describe('getHistory', () => {
    const taskId = 1;
    
    const mockHistory :Task[]= [
        task ,
        task 
    ]; // Mock task history

    const taskHistory:TaskHistory[]=[{
        id: 16, // Mock task history ID
        taskId: task.id,
        userId: 4,
        action:"action",
        details:"details",
        task:task,
        user:mockUserCreateResponseData,
        createdAt:expect.any(Date), // Mock createdAt value
    }]

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock calls between tests
    });

    it('should return 404 if the task is not found', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(null); // Simulate task not found

        // Act
        const result = await taskUseCase.getHistory(taskId);

        // Assert
        expect(result).toEqual({
            status: 404,
            message: 'Task not found.'
        });
        expect(taskRepoMock.findTaskById).toHaveBeenCalledWith(taskId);
        expect(taskRepoMock.getHistory).not.toHaveBeenCalled();
    });

    it('should return 404 if there is no history for the task', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(task); // Simulate task found
        taskRepoMock.getHistory.mockResolvedValue(null); // Simulate no history found
    
        // Act
        const result = await taskUseCase.getHistory(3); // Call the actual use case method
    
        // Assert
        expect(result).toEqual({
            status: 404,
            message: 'There is no history for this task',
        });
        expect(taskRepoMock.findTaskById).toHaveBeenCalledWith(3); // Ensure the correct taskId was passed
        expect(taskRepoMock.getHistory).toHaveBeenCalledWith(3); // Ensure the correct taskId was used for fetching history
    });
    

    it('should return task history successfully with status 200', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(task); // Simulate task found
        taskRepoMock.getHistory.mockResolvedValue(taskHistory); // Simulate history found

        // Act
        const result = await taskUseCase.getHistory(taskId);

        // Assert
        expect(result).toEqual({
            status: 200,
            message: 'Task Fetched By Id Successfully.',
            taskHistory: taskHistory
        });
        expect(taskRepoMock.findTaskById).toHaveBeenCalledWith(taskId);
        expect(taskRepoMock.getHistory).toHaveBeenCalledWith(taskId);
    });

    it('should return 500 if an internal server error occurs', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockRejectedValue(new Error('Unexpected error')); // Simulate error
    
        // Act
        const result = await taskUseCase.getHistory(taskId);
    
        // Assert
        expect(result).toEqual({
            status: 500,
            message: 'Internal server error.'
        });
        expect(taskRepoMock.findTaskById).toHaveBeenCalledWith(taskId);
        expect(taskRepoMock.getHistory).not.toHaveBeenCalled();
    });
});


describe('getNotification', () => {
    const userId = 1; // Example user ID
    const unreadNotifications = [ // Mock unread notifications
        newNotification
    ];

    beforeEach(() => {
        jest.clearAllMocks(); // Clear previous mocks before each test
    });

    it('should return unread notifications successfully', async () => {
        // Arrange
        taskRepoMock.getUnreadNotification.mockResolvedValue(unreadNotifications); // Mock the return value

        // Act
        const result = await taskUseCase.getNotification(userId);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: "Task Fetched By Id Successfully.",
            UnreadNotification: unreadNotifications,
        });
        expect(taskRepoMock.getUnreadNotification).toHaveBeenCalledWith(userId); // Ensure the method was called with the correct userId
    });

    it('should return 500 if an internal server error occurs', async () => {
        // Arrange
        taskRepoMock.getUnreadNotification.mockRejectedValue(new Error('Database error')); // Simulate error

        // Act & Assert
        const result = await taskUseCase.getNotification(userId);
        expect(result).toEqual({
            status: StatusCode.InternalServerError,
            message: "Internal server error.",
        });
        expect(taskRepoMock.getUnreadNotification).toHaveBeenCalledWith(userId); // Ensure the method was called with the correct userId
    });
});

describe('getTask', () => {
    const taskId = 1; // Example task ID

    beforeEach(() => {
        jest.clearAllMocks(); // Clear previous mocks before each test
    });

    it('should return the task successfully when it exists', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(task); // Mock existing task

        // Act
        const result = await taskUseCase.getTask(taskId);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: "Task Fetched By Id Successfully.",
            Task: task,
        });
        expect(taskRepoMock.findTaskById).toHaveBeenCalledWith(taskId); // Ensure the method was called with the correct taskId
    });

    it('should return 500 if an internal server error occurs', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockRejectedValue(new Error('Database error')); // Simulate an error

        // Act
        const result = await taskUseCase.getTask(taskId);

        // Assert
        expect(result).toEqual({
            status: StatusCode.InternalServerError,
            message: "Internal server error.",
        });
        expect(taskRepoMock.findTaskById).toHaveBeenCalledWith(taskId); // Ensure the method was called with the correct taskId
    });
});


describe('getTasks', () => {
    const loggedUserId = 1; // Example logged-in user ID
    const isCompleted = false; // Example flag for completion
    const role = ['TO']; // Example role
    const tasks = [task]; // Example task data

    beforeEach(() => {
        jest.clearAllMocks(); // Reset all mocks before each test
    });

    it('should return all tasks when the filter is "AllTasks"', async () => {
        // Arrange
        taskRepoMock.getAllTasks.mockResolvedValue(tasks); // Mock tasks data

        // Act
        const result = await taskUseCase.getTasks(TaskType.AllTasks, loggedUserId, role, isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: 'Successfully fetched All Tasks',
            task: tasks,
        });
        expect(taskRepoMock.getAllTasks).toHaveBeenCalledWith(isCompleted);
    });

    it('should return your tasks when the filter is "YourTasks"', async () => {
        // Arrange
        taskRepoMock.getYourTask.mockResolvedValue(tasks); // Mock tasks data

        // Act
        const result = await taskUseCase.getTasks(TaskType.YourTasks, loggedUserId, role, isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: 'Successfully fetched your Tasks',
            task: tasks,
        });
        expect(taskRepoMock.getYourTask).toHaveBeenCalledWith(loggedUserId, isCompleted);
    });

    it('should return team tasks when the filter is "TeamTasks" and the user has TO role', async () => {
        // Arrange
        taskRepoMock.getTeamTask.mockResolvedValue(tasks); // Mock tasks data

        // Act
        const result = await taskUseCase.getTasks(TaskType.TeamTasks, loggedUserId, role, isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: 'Successfully fetched team Tasks',
            task: tasks,
        });
        expect(taskRepoMock.getTeamTask).toHaveBeenCalledWith(loggedUserId, isCompleted);
    });

    it('should return 401 if the user does not have the TO role when fetching team tasks', async () => {
        // Arrange
        const nonTOrole = ['PO']; // User without TO role

        // Act
        const result = await taskUseCase.getTasks(TaskType.TeamTasks, loggedUserId, nonTOrole, isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.Unauthorized,
            message: 'only TO Can View The TeamTask',
        });
        expect(taskRepoMock.getTeamTask).not.toHaveBeenCalled();
    });

    it('should return delegated to others tasks when the filter is "DelegatedToOthers"', async () => {
        // Arrange
        taskRepoMock.getDelegatedToOthersTask.mockResolvedValue(tasks); // Mock tasks data

        // Act
        const result = await taskUseCase.getTasks(TaskType.DelegatedToOthers, loggedUserId, role, isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: 'Successfully fetched DelegatedToOthers Tasks',
            task: tasks,
        });
        expect(taskRepoMock.getDelegatedToOthersTask).toHaveBeenCalledWith(loggedUserId, isCompleted);
    });

    it('should return 400 if no valid filter is provided', async () => {
        // Act
        const result = await taskUseCase.getTasks('InvalidFilter' as TaskType, loggedUserId, role, isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.BadRequest,
            message: 'select appropriate filter.',
        });
    });

    it('should return 500 if an internal server error occurs', async () => {
        // Arrange
        taskRepoMock.getAllTasks.mockRejectedValue(new Error('Unexpected error'));

        // Act
        const result = await taskUseCase.getTasks(TaskType.AllTasks, loggedUserId, role, isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.InternalServerError,
            message: 'Internal server error.',
        });
        expect(taskRepoMock.getAllTasks).toHaveBeenCalledWith(isCompleted);
    });

    it('should return 403 if an admin tries to access team tasks', async () => {
        // Arrange
        const error = new Error("admin can't have the team task");
        taskRepoMock.getTeamTask.mockRejectedValue(error);

        // Act
        const result = await taskUseCase.getTasks(TaskType.TeamTasks, loggedUserId, ['Admin'], isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.Unauthorized,
            message: "only TO Can View The TeamTask",
        });
    });
});


describe('deleteTask', () => {
    const taskId = 1;
    const loggedUserId = 4;
    const roles = ['ADMIN']; // Example roles
    const existingTask = { ...task }; // Example task data

    beforeEach(() => {
        jest.clearAllMocks(); // Reset all mocks before each test
    });

    it('should delete the task successfully when the user has permission', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(existingTask); // Mock task found
        taskRepoMock.deleteTask.mockResolvedValue(task); // Mock task deletion

        // Act
        const result = await taskUseCase.deleteTask(taskId, loggedUserId, roles);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: 'Task deleted Successfully.',
        });
        expect(taskRepoMock.findTaskById).toHaveBeenCalledWith(taskId);
        expect(taskRepoMock.deleteTask).toHaveBeenCalledWith(taskId);
    });

    it('should return 404 if the task is not found', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(null); // Mock task not found

        // Act
        const result = await taskUseCase.deleteTask(taskId, loggedUserId, roles);

        // Assert
        expect(result).toEqual({
            status: StatusCode.NotFound,
            message: 'Task not found.',
        });
        expect(taskRepoMock.findTaskById).toHaveBeenCalledWith(taskId);
        expect(taskRepoMock.deleteTask).not.toHaveBeenCalled();
    });

    it('should return 401 if the user does not have permission to delete the task', async () => {
        // Arrange
        const taskCreatedByAnotherUser = { ...existingTask, created_by: 999 }; // Mock task created by another user
        taskRepoMock.findTaskById.mockResolvedValue(taskCreatedByAnotherUser); // Mock task found

        // Act
        const result = await taskUseCase.deleteTask(taskId, loggedUserId, roles);

        // Assert
        expect(result).toEqual({
            status: StatusCode.Unauthorized,
            message: `You do not have permission to remove this task: ${taskCreatedByAnotherUser.title}.`,
        });
        expect(taskRepoMock.findTaskById).toHaveBeenCalledWith(taskId);
        expect(taskRepoMock.deleteTask).not.toHaveBeenCalled();
    });

    it('should return 500 if an internal server error occurs during task deletion', async () => {
        // Arrange
        taskRepoMock.findTaskById.mockResolvedValue(existingTask); // Mock task found
        taskRepoMock.deleteTask.mockRejectedValue(new Error('Unexpected error')); // Simulate error during deletion

        // Act
        const result = await taskUseCase.deleteTask(taskId, loggedUserId, roles);

        // Assert
        expect(result).toEqual({
            status: StatusCode.InternalServerError,
            message: 'Internal server error.',
        });
        expect(taskRepoMock.findTaskById).toHaveBeenCalledWith(taskId);
        expect(taskRepoMock.deleteTask).toHaveBeenCalledWith(taskId);
    });
});

describe('validateUserAndBrand', () => {
    const taskData: TaskData = {
        assigned_to: 1,
        created_by: 2,
        brand_id: 3,
        inventoryId: 4,
        eventId: 5,
        title: '',
        type: Type.Brand,
        status: TaskStatus.Completed,
        due_date: ''
    };

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should pass validation if all user, brand, inventory, and event exist', async () => {
        // Arrange
        userRepoMock.getUserById.mockResolvedValue(mockUserCreateResponseData); // Mock users exist
        userRepoMock.getBrandDetail.mockResolvedValue(new Brand); // Mock brand exists
        userRepoMock.findInventoryById.mockResolvedValue(new Inventory); // Mock inventory exists
        userRepoMock.findEventById.mockResolvedValue(new Event); // Mock event exists

        // Act
        await expect(taskUseCase.validateUserAndBrand(taskData)).resolves.not.toThrow();

        // Assert
        expect(userRepoMock.getUserById).toHaveBeenCalledWith(taskData.assigned_to);
        expect(userRepoMock.getUserById).toHaveBeenCalledWith(taskData.created_by);
        expect(userRepoMock.getBrandDetail).toHaveBeenCalledWith(taskData.brand_id);
        expect(userRepoMock.findInventoryById).toHaveBeenCalledWith(taskData.inventoryId);
        expect(userRepoMock.findEventById).toHaveBeenCalledWith(taskData.eventId);
    });

    it('should throw 404 if assigned user does not exist', async () => {
        // Arrange
        userRepoMock.getUserById.mockResolvedValueOnce(null); // Mock assigned user not found

        // Act & Assert
        await expect(taskUseCase.validateUserAndBrand(taskData)).rejects.toEqual({
            status: StatusCode.NotFound,
            message: 'Assigned user not found.'
        });
        expect(userRepoMock.getUserById).toHaveBeenCalledWith(taskData.assigned_to);
    });

    it('should throw 404 if created user does not exist', async () => {
        // Arrange
        userRepoMock.getUserById
            .mockResolvedValueOnce(mockUserCreateResponseData) // Mock assigned user found
            .mockResolvedValueOnce(null); // Mock created user not found

        // Act & Assert
        await expect(taskUseCase.validateUserAndBrand(taskData)).rejects.toEqual({
            status: StatusCode.NotFound,
            message: 'Created user not found.'
        });
        expect(userRepoMock.getUserById).toHaveBeenCalledWith(taskData.created_by);
    });

    it('should throw 404 if brand does not exist', async () => {
        // Arrange
        userRepoMock.getUserById.mockResolvedValue(mockUserCreateResponseData); // Mock users found
        userRepoMock.getBrandDetail.mockResolvedValueOnce(null); // Mock brand not found

        // Act & Assert
        await expect(taskUseCase.validateUserAndBrand(taskData)).rejects.toEqual({
            status: StatusCode.NotFound,
            message: 'Brand not found.'
        });
        expect(userRepoMock.getBrandDetail).toHaveBeenCalledWith(taskData.brand_id);
    });

    it('should throw 404 if inventory does not exist', async () => {
        // Arrange
        userRepoMock.getUserById.mockResolvedValue(mockUserCreateResponseData); // Mock users found
        userRepoMock.getBrandDetail.mockResolvedValue(new Brand); // Mock brand found
        userRepoMock.findInventoryById.mockResolvedValueOnce(null); // Mock inventory not found

        // Act & Assert
        await expect(taskUseCase.validateUserAndBrand(taskData)).rejects.toEqual({
            status: StatusCode.NotFound,
            message: 'Inventory not found.'
        });
        expect(userRepoMock.findInventoryById).toHaveBeenCalledWith(taskData.inventoryId);
    });

    it('should throw 404 if event does not exist', async () => {
        // Arrange
        userRepoMock.getUserById.mockResolvedValue(mockUserCreateResponseData); // Mock users found
        userRepoMock.getBrandDetail.mockResolvedValue(new Brand()); // Mock brand found
        userRepoMock.findInventoryById.mockResolvedValue(new Inventory()); // Mock inventory found
        userRepoMock.findEventById.mockResolvedValueOnce(null); // Mock event not found
    
        // Act & Assert
        await expect(taskUseCase.validateUserAndBrand(taskData)).rejects.toEqual({
            status: StatusCode.NotFound,
            message: 'Event not found.'
        });
    });
});
    

const mockTask: Task = {
    id: 3,
    title: "Evolution on clothing",
    description: "Design",
    type: Type.Brand,
    status: TaskStatus.Pending,
    createdAt: new Date(),
    due_date: new Date(),
    assigned_to: 4,
    created_by: 4,
    brand_id: 1,
    sla: true,
    assignedTo: mockUserCreateResponseData,
    createdBy: mockUserCreateResponseData,
    brand: new Brand(),
    inventory: new Inventory(),
    event: new Event(),
    comments: [],
    notifications: [],
    history: []
};





// describe('updateTask', () => {

//     beforeEach(() => {
//         jest.clearAllMocks(); // Clear mocks before each test
//     });



//     it('should save task history successfully', async () => {
//         const mockTask = { ...task,id: 3 ,};  // Assuming the task with ID 3 exists
//         const mockUserId = 3;
//         const action = 'Task Updated';
//         const details = 'The Task Updated Title was updated.';
    
//         // Mocking the save method
//         taskRepoMock.findTaskById.mockResolvedValue(mockTask);

    
//         const result = await taskUseCase.TaskHistoryLogging(mockTask, action, details, mockUserId);
        
//         expect(result.taskId).toBe(mockTask.id);
//         expect(result.userId).toBe(mockUserId);
//         expect(result.action).toBe(action);
//         expect(result.details).toBe(details);
//     });

    

//     it('should return 404 if task not found', async () => {
//         // Arrange
//         const taskData :TaskData= {
//             id: 999, title: 'Updated Title',
//             type: Type.Brand,
//             status:TaskStatus.Pending,
//             assigned_to: 4,
//             created_by: 4,
//             due_date: ''
//         };    
//             const loggedUserId = 4;

//         // Mock non-existent task
//         taskRepoMock.findTaskById.mockResolvedValue(null);
//         taskRepoMock.saveTask.mockRejectedValue(task);

//         // Act
//         const result = await taskUseCase.updateTask(taskData, loggedUserId);

//         // Assert
//         expect(result.status).toBe(StatusCode.NotFound);
//         expect(result.message).toBe("Task not found.");
//     });

//     it('should return 403 if user is unauthorized to update', async () => {
//         // Arrange
//         const taskData :TaskData= {
//             id: 999, title: 'Updated Title',
//             type: Type.Brand,
//             status:TaskStatus.Pending,
//             assigned_to: 2,
//             created_by: 3,
//             due_date: ''
//         };        
//         const loggedUserId = 200; // User without permission

//         // Mock existing task with different creator and assignee
//         taskRepoMock.findTaskById.mockResolvedValue(task);
//         taskRepoMock.saveTask.mockRejectedValue(task);

//         // Act
//         const result = await taskUseCase.updateTask(taskData, loggedUserId);

//         // Assert
//         expect(result.status).toBe(StatusCode.Unauthorized);
//         expect(result.message).toBe("Only the user who created the task, the assignee, or users with admin or management roles have permission to update it.");
//     });

//     it('should return 400 if trying to update a completed task', async () => {
//         // Arrange
//         const taskData:TaskData ={
//             id: 999, title: 'Updated Title',
//             type: Type.Brand,
//             status:TaskStatus.Pending,
//             assigned_to: 4,
//             created_by: 4,
//             due_date: ''
//         }; 
//         const loggedUserId = 4;

//         // Mock existing task as completed
//         taskRepoMock.findTaskById.mockResolvedValue({...task,status:TaskStatus.Completed});
//         taskRepoMock.saveTask.mockRejectedValue(task);

//         // Act
//         const result = await taskUseCase.updateTask(taskData, loggedUserId);

//         // Assert
//         expect(result.status).toBe(StatusCode.BadRequest);
//         expect(result.message).toBe("Cannot update a completed task.");
//     });

//     it('should return 403 if non-assignee tries to change status to completed', async () => {
//         // Arrange
//         const taskData:TaskData ={
//             id: 999, title: 'Updated Title',
//             type: Type.Brand,
//             status:TaskStatus.Completed,
//             assigned_to: 3,
//             created_by: 4,
//             due_date: ''
//         };         
//         const loggedUserId = 4; // Not the assignee

//         // Mock existing task
//         taskRepoMock.findTaskById.mockResolvedValue(task);
//         taskRepoMock.saveTask.mockRejectedValue(task);

//         // Act
//         const result = await taskUseCase.updateTask(taskData, loggedUserId);
//                 console.log(result,"=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");

//         // Assert
//         expect(result.status).toBe(StatusCode.InternalServerError);
//         expect(result.message).toBe("Only the user who created the task, the assignee, or users with admin or management roles have permission to update it.");
//     });

//     it('should allow the creator to reassign the task', async () => {
//         // Arrange
//         const mockTask:Task={...task}
//         mockTask.status=TaskStatus.Pending
//         const taskData:TaskData ={
//             id: 999, title: 'Updated Title',
//             type: Type.Brand,
//             status:TaskStatus.Pending,
//             assigned_to: 4,
//             created_by: 4,
//             due_date: ''
//         };  // New assignee
//         const loggedUserId = 4; // The creator

//         // Mock existing task
//         taskRepoMock.findTaskById.mockResolvedValue(mockTask);

//         taskRepoMock.saveTask.mockResolvedValue({
//             ...task,
//             assigned_to: 4,
//         });

//         // Act
//         const result = await taskUseCase.updateTask(taskData, loggedUserId);

//         // Assert
//         expect(result.status).toBe(StatusCode.Created);
//         expect(result.message).toBe("Task updated successfully.");
//         expect(result.Task?.assigned_to).toBe(3); // Verify the task was reassigned
//     });



//     it('should handle unexpected errors', async () => {
//         // Arrange
//         const mockTask:Task={...task}
//         mockTask.status=TaskStatus.Pending
//         const taskData:TaskData ={
//             id: 1, title: 'Updated Title',
//             type: Type.Brand,
//             status:TaskStatus.Pending,
//             assigned_to: 4,
//             created_by: 4,
//             due_date: ''
//         };
//         const loggedUserId = 4;
        
//         // Mock existing task
//         taskRepoMock.findTaskById.mockResolvedValue(mockTask);

//         // Simulate unexpected error during saving
//         taskRepoMock.saveTask.mockRejectedValue(new Error("Unexpected database error"));

//         // Act
//         const result = await taskUseCase.updateTask(taskData, loggedUserId);
        

//         // Assert
//         expect(result.status).toBe(StatusCode.InternalServerError);
//         expect(result.message).toBe("Internal server error.");
//     });
// });



describe('createTask', () => {
    const taskData: TaskData = {
        assigned_to: 4,
        created_by: 4,
        brand_id: 3,
        inventoryId: 4,
        eventId: 5,
        title: 'Test Task',
        type: Type.Brand,
        status: TaskStatus.Completed,
        due_date: '2024-10-30'
    };
    let mockNotificationService: any;
    let mockTaskHistoryService: any;

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test


        mockNotificationService = jest.fn();
        mockTaskHistoryService = jest.fn();
    });

    it('should create a task successfully when all data is valid', async () => {
        // Arrange
        userRepoMock.getUserById.mockResolvedValueOnce(mockUserCreateResponseData) // Mock assigned user found
            .mockResolvedValueOnce(mockUserCreateResponseData); // Mock created user found
            userRepoMock.getBrandDetail.mockResolvedValue(BrandCreateReponseData); // Mock brand found
        userRepoMock.findInventoryById.mockResolvedValue(new Inventory); // Mock inventory found
        userRepoMock.findEventById.mockResolvedValue(new Event); // Mock event found
        taskRepoMock.createTask.mockResolvedValue(task); // Mock task creation

        // Act
        const result = await taskUseCase.createTask(taskData, 4);

        // Assert
        expect(result).toEqual({
            status: StatusCode.Created,
            message: "Task created successfully.",
            Task: taskData,
        });
        expect(userRepoMock.getUserById).toHaveBeenCalledWith(taskData.assigned_to);
        expect(userRepoMock.getUserById).toHaveBeenCalledWith(taskData.created_by);
        expect(userRepoMock.getBrandDetail).toHaveBeenCalledWith(taskData.brand_id);
        expect(userRepoMock.findInventoryById).toHaveBeenCalledWith(taskData.inventoryId);
        expect(userRepoMock.findEventById).toHaveBeenCalledWith(taskData.eventId);
    });

    // it('should return 404 if the assigned user does not exist', async () => {
    //     // Arrange
    //     userRepoMock.getUserById.mockResolvedValueOnce(null); // Mock assigned user not found

    //     // Act & Assert
    //     const result = await taskUseCase.createTask(taskData, 1);
    //     expect(result).toEqual({
    //         status: StatusCode.NotFound,
    //         message: 'AssignedUser Not Found',
    //     });
    //     expect(userRepoMock.getUserById).toHaveBeenCalledWith(taskData.assigned_to);
    // });

    // it('should return 404 if the created user does not exist', async () => {
    //     // Arrange
    //     userRepoMock.getUserById
    //         .mockResolvedValueOnce({ id: 1, name: 'Assignee' }) // Mock assigned user found
    //         .mockResolvedValueOnce(null); // Mock created user not found

    //     // Act & Assert
    //     const result = await taskUseCase.createTask(taskData, 1);
    //     expect(result).toEqual({
    //         status: StatusCode.NotFound,
    //         message: 'CreatedUser Not Found',
    //     });
    //     expect(userRepoMock.getUserById).toHaveBeenCalledWith(taskData.created_by);
    // });

    // it('should return 404 if the brand does not exist', async () => {
    //     // Arrange
    //     userRepoMock.getUserById.mockResolvedValue({ id: 1, name: 'Assignee' }); // Mock users found
    //     userRepoMock.getBrandDetail.mockResolvedValueOnce(null); // Mock brand not found

    //     // Act & Assert
    //     const result = await taskUseCase.createTask(taskData, 1);
    //     expect(result).toEqual({
    //         status: StatusCode.NotFound,
    //         message: 'Brand not found',
    //     });
    //     expect(taskRepoMock.getBrandDetail).toHaveBeenCalledWith(taskData.brand_id);
    // });

    // it('should return 404 if the inventory does not exist', async () => {
    //     // Arrange
    //     userRepoMock.getUserById.mockResolvedValue({ id: 1, name: 'Assignee' }); // Mock users found
    //     userRepoMock.getBrandDetail.mockResolvedValue({ id: 3 }); // Mock brand found
    //     userRepoMock.findInventoryById.mockResolvedValueOnce(null); // Mock inventory not found

    //     // Act & Assert
    //     const result = await taskUseCase.createTask(taskData, 1);
    //     expect(result).toEqual({
    //         status: StatusCode.NotFound,
    //         message: 'Inventory not found',
    //     });
    //     expect(userRepoMock.findInventoryById).toHaveBeenCalledWith(taskData.inventoryId);
    // });

    // it('should return 404 if the event does not exist', async () => {
    //     // Arrange
    //     userRepoMock.getUserById.mockResolvedValue({ id: 1, name: 'Assignee' }); // Mock users found
    //     userRepoMock.getBrandDetail.mockResolvedValue({ id: 3 }); // Mock brand found
    //     userRepoMock.findInventoryById.mockResolvedValue({ id: 4 }); // Mock inventory found
    //     userRepoMock.findEventById.mockResolvedValueOnce(null); // Mock event not found

    //     // Act & Assert
    //     const result = await taskUseCase.createTask(taskData, 1);
    //     expect(result).toEqual({
    //         status: StatusCode.NotFound,
    //         message: 'Event not found',
    //     });
    //     expect(userRepoMock.findEventById).toHaveBeenCalledWith(taskData.eventId);
    // });

    // it('should assign task type as "General" if no brand, inventory, or event is provided', async () => {
    //     // Arrange
    //     const generalTaskData = { ...taskData, brand_id: undefined, inventoryId: undefined, eventId: undefined };
    //     userRepoMock.getUserById.mockResolvedValue({ id: 1, name: 'Assignee' }); // Mock users found
    //     userRepoMock.createTask.mockResolvedValue(generalTaskData); // Mock task creation

    //     // Act
    //     const result = await taskUseCase.createTask(generalTaskData, 1);

    //     // Assert
    //     expect(result).toEqual({
    //         status: StatusCode.Created,
    //         message: "Task created successfully.",
    //         Task: generalTaskData,
    //     });
    //     expect(generalTaskData.type).toBe(Type.General);
    // });

    
});

