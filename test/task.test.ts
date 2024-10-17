import TaskRepo from '../src/app/repository/TaskRepo'; // Adjust accordingly
import userRepo from '../src/app/repository/UserRepo'; // Adjust accordingly
import { GetAllUser, Department, RoleName, UserData, BrandData, BrandContactData, BrandOwnershipData, updatingUserData, EventData, InventoryData, Type, FilterOptions, TaskCommentData } from '../src/interfaces/interface'; // Adjust accordingly
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
    id: 2,
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
    createdBy: new User,
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
