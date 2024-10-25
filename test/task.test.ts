import TaskRepo from '../src/app/repository/TaskRepo'; // Adjust accordingly
import userRepo from '../src/app/repository/UserRepo'; // Adjust accordingly
import {  Department, RoleName, UserData, Type, FilterOptions, TaskCommentData, TaskType, TaskData } from '../src/interfaces/interface'; // Adjust accordingly
import { StatusCode } from '../src/interfaces/enum';
import { User } from '../src/entity/User';
import { Event } from '../src/entity/Event';
import { Brand } from '../src/entity/Brand';
import taskUseCase from '../src/app/services/taskServices'
import { Inventory } from '../src/entity/inventory';
import { Task, TaskStatus } from '../src/entity/Task';
import { TaskComment } from '../src/entity/TaskComment';
import { TaskHistory } from '../src/entity/TaskHistory';
import { Notification } from '../src/entity/Notification';
import * as middleware from '../src/middleware/updateMiddleware';
import TaskValidator from '../src/middleware/validateTaskData';

const taskValidator = new TaskValidator(); // Create an instance

  
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
    getAllTeam: jest.fn(),
    getAllBrand: jest.fn(),
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
    findAllAssignedByUsers: jest.fn(),
    findAllAssignedToUsers: jest.fn(),

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
            message: "Analytics fetched successfully",
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
};

const mockFilteredTasks :Task[]= [
    {
        id: 3,
        title: "Evolution on clothing",
        description: "Design",
        type: Type.Brand,
        status: TaskStatus.Pending,
        createdAt: new Date,
        due_date:new Date,
        assignedTo: new User ,
        assigned_to: 4,
        created_by: 4,
        brand_id: 1,
        inventoryId: undefined,
        eventId: undefined,
        sla: true,
        createdBy: new User,
        brand: new Brand,
        inventory: new Inventory,
        event: new Event,
        comments: [],
        notifications: [],
        history: []
    },
    
];
const expectedResponse = {
    status: 201,
    message: "Filtered tasks successfully retrieved.",
    task: mockFilteredTasks,
    "totalFilterTask": 3,
    pagination: {
      page: 1,
      pageSize: 10,
      totalAssignedByUsers: 0,
      totalAssignedToUsers: 0,
      totalBrand: 0,
      totalEvents: 0,
      totalInventory: 0,
      totalTeamOwners: 0
    },
    assignedByUsers: [],
    assignedToUsers: [],
    brand: [],
    Event: [],
    Inventory: [],
    teamOwners: []
  };
  

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



describe('getFilteredAndSortedTasks', () => {
    beforeEach(() => {
        // Ensure each mock is properly set up for each test
        taskRepoMock.getFilteredAndSortedTasks.mockResolvedValue({filterTask:mockFilteredTasks,totalFilterTask:3});
        taskRepoMock.findAllAssignedToUsers.mockResolvedValue([[], 0]);  // Empty array by default
        taskRepoMock.findAllAssignedByUsers.mockResolvedValue([[], 0]);  // Empty array by default
        userRepoMock.getAllTeam.mockResolvedValue({ teams: [], totalTeamOwners: 0 });  // No teams
        userRepoMock.getAllBrand.mockResolvedValue({ brands: [], totalBrand: 0 });  // No brands
        userRepoMock.getAllEvent.mockResolvedValue({ events: [], totalEvents: 0 });  // No events
        userRepoMock.getAllInventory.mockResolvedValue({ inventory: [], totalInventory: 0 });  // No inventory
    });

    it('should fetch filtered and sorted tasks successfully with pagination', async () => {
        // Arrange
        taskRepoMock.getFilteredAndSortedTasks.mockResolvedValue({filterTask:mockFilteredTasks,totalFilterTask:3});
        
        // Act
        const response = await taskUseCase.getFilteredAndSortedTasks(mockFilterOptions, 1, 10);

        // Assert
        expect(response).toEqual(expectedResponse);
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
        taskRepoMock.getFilteredAndSortedTasks.mockResolvedValue({filterTask:[]});
        
        // Act
        const response = await taskUseCase.getFilteredAndSortedTasks(mockFilterOptions);
        
        // Assert
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "No tasks found matching the filters.",
        });
    });

    it('should throw an error if TaskRepo throws an error', async () => {
        taskRepoMock.getFilteredAndSortedTasks.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(taskUseCase.getFilteredAndSortedTasks(mockFilterOptions)).rejects.toThrow('Database error');
    });

    it('should return empty arrays if no entities are found for assigned users, brands, etc.', async () => {
        // Arrange
        taskRepoMock.getFilteredAndSortedTasks.mockResolvedValue({filterTask:mockFilteredTasks,totalFilterTask:3});
        taskRepoMock.findAllAssignedToUsers.mockResolvedValue([[], 0]);  // No assigned users
        taskRepoMock.findAllAssignedByUsers.mockResolvedValue([[], 0]);  // No assigned by users
        userRepoMock.getAllTeam.mockResolvedValue({ teams: [], totalTeamOwners: 0 });  // No teams
        userRepoMock.getAllBrand.mockResolvedValue({ brands: [], totalBrand: 0 });  // No brands
        userRepoMock.getAllEvent.mockResolvedValue({ events: [], totalEvents: 0 });  // No events
        userRepoMock.getAllInventory.mockResolvedValue({ inventory: [], totalInventory: 0 });  // No inventory

        // Act
        const response = await taskUseCase.getFilteredAndSortedTasks(mockFilterOptions);
        
        // Assert
        expect(response.assignedToUsers).toEqual([]);
        expect(response.assignedByUsers).toEqual([]);
        expect(response.teamOwners).toEqual([]);
        expect(response.brand).toEqual([]);
        expect(response.Inventory).toEqual([]);
        expect(response.Event).toEqual([]);
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
        expect(taskRepoMock.getHistory).toHaveBeenCalledWith(3,1,10); // Ensure the correct taskId was used for fetching history
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
        expect(taskRepoMock.getHistory).toHaveBeenCalledWith(taskId,1,10);
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
        const result = await taskUseCase.getNotification(userId,1,10);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: "Task Fetched By Id Successfully.",
            UnreadNotification: unreadNotifications,
        });
        expect(taskRepoMock.getUnreadNotification).toHaveBeenCalledWith(userId,1,10); // Ensure the method was called with the correct userId
    });

    it('should return 500 if an internal server error occurs', async () => {
        // Arrange
        taskRepoMock.getUnreadNotification.mockRejectedValue(new Error('Database error')); // Simulate error

        // Act & Assert
        const result = await taskUseCase.getNotification(userId,1,10);
        expect(result).toEqual({
            status: StatusCode.InternalServerError,
            message: "Internal server error.",
        });
        expect(taskRepoMock.getUnreadNotification).toHaveBeenCalledWith(userId,1,10); // Ensure the method was called with the correct userId
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
        taskRepoMock.getAllTasks.mockResolvedValue({tasks,totalCount:5}); // Mock tasks data

        // Act
        const result = await taskUseCase.getTasks(TaskType.AllTasks, loggedUserId, role, isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: 'Successfully fetched All Tasks',
            task: tasks,
            totalCount:5
        });
        expect(taskRepoMock.getAllTasks).toHaveBeenCalledWith(isCompleted,1,10);
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
        taskRepoMock.getTeamTask.mockResolvedValue({tasks,totalCount:5}); // Mock tasks data

        // Act
        const result = await taskUseCase.getTasks(TaskType.TeamTasks, loggedUserId, role, isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: 'Successfully fetched team Tasks',
            task: tasks,
            totalCount:5
        });
        expect(taskRepoMock.getTeamTask).toHaveBeenCalledWith(loggedUserId, isCompleted,1,10);
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
        taskRepoMock.getDelegatedToOthersTask.mockResolvedValue({tasks,totalCount:5}); // Mock tasks data

        // Act
        const result = await taskUseCase.getTasks(TaskType.DelegatedToOthers, loggedUserId, role, isCompleted);

        // Assert
        expect(result).toEqual({
            status: StatusCode.OK,
            message: 'Successfully fetched DelegatedToOthers Tasks',
            task: tasks,
            totalCount:5
        });
        expect(taskRepoMock.getDelegatedToOthersTask).toHaveBeenCalledWith(loggedUserId, isCompleted,1,10);
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
        expect(taskRepoMock.getAllTasks).toHaveBeenCalledWith(isCompleted,1,10);
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

const taskData:TaskData={
    "title": "Evolution on clothing",
    "description": "Design", 
    status: TaskStatus.Pending,
    "type":Type.Brand,
    "assigned_to": 4,
    "created_by": 4,
    "due_date": "2024-10-17T06:53:08.910776Z",
    "brand_id": 1
  }
  const taskHistory:TaskHistory={
      taskId: 5,
      userId: 1,
      action: 'Task Created',
      details: 'The Task Evolution on clothing was created by Rashid and assigned to Rahifa',
      id: 12,
      createdAt: new Date,
      task: new Task,
      user: new User
  }
  const notification:Notification={
      message: 'You have been assigned a new task: Evolution on clothing',
      isRead: false,
      recipientId: 3,
      id: 9,
      createdAt: new Date,
      recipient: new User,
      task: new Task
  }

describe('createTask', () => {
    let loggedUserId;

    beforeEach(() => {
        loggedUserId = 1;
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should create a task successfully', async () => {
        // Mock the UserRepo and TaskRepo calls
        userRepoMock.getUserById.mockResolvedValueOnce(mockUserCreateResponseData); // Mock assigned user
        userRepoMock.getUserById.mockResolvedValueOnce(mockUserCreateResponseData); // Mock created user
        taskRepoMock.createTask.mockResolvedValueOnce(task); // Mock task creation
        taskRepoMock.saveNotification.mockResolvedValueOnce(notification )
        taskRepoMock.saveTaskHistory.mockResolvedValueOnce(taskHistory)
        const result = await taskUseCase.createTask(taskData, loggedUserId);

        expect(result.status).toBe(StatusCode.Created);
        expect(result.message).toBe('Task created successfully.');
        expect(TaskRepo.createTask).toHaveBeenCalledWith(taskData);
    });

    it('should return error if assigned user not found', async () => {
        userRepoMock.getUserById.mockResolvedValueOnce(null); // No assigned user

        const result = await taskUseCase.createTask(taskData, loggedUserId);

        expect(result.status).toBe(StatusCode.NotFound);
        expect(result.message).toBe('AssignedUser Not Found');
        expect(TaskRepo.createTask).not.toHaveBeenCalled();
    });

    it('should return error if created user not found', async () => {
        userRepoMock.getUserById
            .mockResolvedValueOnce(mockUserCreateResponseData) // Mock assigned user
            .mockResolvedValueOnce(null); // No created user

        const result = await taskUseCase.createTask(taskData, loggedUserId);

        expect(result.status).toBe(StatusCode.NotFound);
        expect(result.message).toBe('CreatedUser Not Found');
        expect(TaskRepo.createTask).not.toHaveBeenCalled();
    });

    it('should return error if brand not found', async () => {
        taskData.brand_id = 1; // Set brand id to be checked
        userRepoMock.getBrandDetail.mockResolvedValueOnce(null); // Brand not found

        const result = await taskUseCase.createTask(taskData, loggedUserId);

        expect(result.status).toBe(StatusCode.NotFound);
        expect(result.message).toBe('Brand not found');
        expect(TaskRepo.createTask).not.toHaveBeenCalled();
    });

    it('should return error if inventory not found', async () => {
        taskData.inventoryId = 1; // Set inventory id to be checked
        userRepoMock.findInventoryById.mockResolvedValueOnce(null); // Inventory not found

        const result = await taskUseCase.createTask(taskData, loggedUserId);

        expect(result.status).toBe(StatusCode.NotFound);
        expect(result.message).toBe('Inventory not found');
        expect(TaskRepo.createTask).not.toHaveBeenCalled();
    });

    it('should return error if event not found', async () => {
        taskData.eventId = 1; // Set event id to be checked
        userRepoMock.findEventById.mockResolvedValueOnce(null); // Event not found

        const result = await taskUseCase.createTask(taskData, loggedUserId);

        expect(result.status).toBe(StatusCode.NotFound);
        expect(result.message).toBe('Event not found');
        expect(TaskRepo.createTask).not.toHaveBeenCalled();
    });

    it('should return validation error if task data is invalid', async () => {
        const taskData={}
        const result = await taskUseCase.createTask(taskData, loggedUserId);

        expect(result.status).toBe(StatusCode.BadRequest);
        expect(result.message).toBe('title: Title must be a string');
        expect(TaskRepo.createTask).not.toHaveBeenCalled();
    });

    it('should return internal server error on exception', async () => {
        taskRepoMock.createTask.mockRejectedValueOnce(new Error('Database error'));

        const result = await taskUseCase.createTask(taskData, loggedUserId);

        expect(result.status).toBe(StatusCode.InternalServerError);
        expect(result.message).toBe('Internal server error.');
    });
});



describe('updateTask', () => {
    let loggedUserId: number;

    beforeEach(() => {
        loggedUserId = 4; // Example logged-in user ID
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should update a task successfully', async () => {
        const existingTask = { id: 1, title: 'Old Task Title', status: 'Pending', assignedTo: 2, createdBy: 1 };
        
        // Mock repository calls
        taskRepoMock.findTaskById.mockResolvedValueOnce(task); // Existing task found
        taskRepoMock.saveTask.mockResolvedValueOnce(task); // Mock updated task
        userRepoMock.getUserById.mockResolvedValueOnce(mockUserCreateResponseData); // Mock user data for permission checks
        taskRepoMock.saveNotification.mockResolvedValueOnce(notification )
        taskRepoMock.saveTaskHistory.mockResolvedValueOnce(taskHistory)
        const result = await taskUseCase.updateTask(taskData, loggedUserId);

        expect(result.status).toBe(StatusCode.OK);
        expect(result.message).toBe('Task updated successfully');
        expect(taskRepoMock.saveTask).toHaveBeenCalledWith(expect.objectContaining(taskData)); // Ensure task data is updated
    });

    it('should return BadRequest when task data is invalid', async () => {
        const taskData={id:1,titel:''}
        // Mock validation failure
        jest.spyOn(taskValidator, 'validateTaskData').mockReturnValueOnce({ valid: false, message: 'Invalid data' });

        const result = await taskUseCase.updateTask(taskData, loggedUserId);

        expect(result.status).toBe(400);
        expect(result.message).toBe('Invalid fields: titel.');
        expect(taskRepoMock.saveTask).not.toHaveBeenCalled();
    });

    // 3. Test case for task not found
    it('should return NotFound when task is not found', async () => {
        const taskData = { id: 99, title: 'Non-existent task' };

        // Mock task not found
        taskRepoMock.findTaskById.mockResolvedValueOnce(null);

        const result = await taskUseCase.updateTask(taskData, loggedUserId);

        expect(result.status).toBe(404);
        expect(result.message).toBe('Task not found.');
        expect(taskRepoMock.saveTask).not.toHaveBeenCalled();
    });

    // 4. Test case for permission denied
    it('should return Unauthorized if user has no permission to update the task', async () => {
        const taskData = { id: 1, title: 'New Task Title' };
        const existingTask = { id: 1, title: 'Old Task Title', status: 'Pending', assignedTo: 2, createdBy: 1 };

        // Mock permission failure
        jest.spyOn(middleware, 'checkTaskPermission').mockReturnValueOnce(false);

        taskRepoMock.findTaskById.mockResolvedValueOnce(task);

        const result = await taskUseCase.updateTask(taskData, loggedUserId);

        expect(result.status).toBe(401);
        expect(result.message).toBe("You don't have permission to update this task.");
        expect(taskRepoMock.saveTask).not.toHaveBeenCalled();
    });

    // 5. Test case for task already completed
    it('should return BadRequest if the task is already completed', async () => {
        const taskDatas={...task}
        taskDatas.status=TaskStatus.Completed
        taskRepoMock.findTaskById.mockResolvedValueOnce(taskDatas); // Task is completed

        const result = await taskUseCase.updateTask(taskData, loggedUserId);

        expect(result.status).toBe(400);
        expect(result.message).toBe('Cannot update a completed task.');
        expect(taskRepoMock.saveTask).not.toHaveBeenCalled();
    });


    

    
});