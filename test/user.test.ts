import useCase from '../src/app/useCase/useCase'; // Adjust the import according to your file structure
import userRepo from '../src/app/repository/UserRepo'; // Adjust accordingly
import { GetAllUser, Department, RoleName, UserData, BrandData, BrandContactData, BrandOwnershipData } from '../src/interfaces/interface'; // Adjust accordingly
import { StatusCode } from '../src/interfaces/enum';
import { User } from '../src/entity/User';
import { Team } from '../src/entity/Team';
import bcrypt from 'bcryptjs';
import { Brand } from '../src/entity/Brand';
import { BrandContact } from '../src/entity/BrandContact';

// Mock the userRepo methods used in createUser
jest.mock('../src/app/repository/UserRepo'); // Adjust this path as necessary

describe('User API - createUser', () => {
    const mockUserData: UserData = {
        name: "Test User",
        department: Department.HR,
        phoneNumber: "1234567890",
        email: "test@example.com",
        password: "securePassword123",
        roles: [RoleName.TO],
        teamId: 1,
        parentId: 1,
    };

    const mockUser: User = {
        id: 1,
        name: "John Doe",
        department: "HR",
        phoneNumber: "123-456-7890",
        email: "john.doe@example.com",
        password: "securePassword1!",
        createdAt: new Date(), // Current timestamp
        roles: [RoleName.ADMIN], // Assuming RoleName is an enum defined somewhere
        children: [], // No children for top-level users yet
        brandOwnerships: [], // No brand ownerships for now
        team: new Team, // No associated team
        userTeams: [],
        parentId: 1,
        parent: new User,
        teamId: 0,
        
    }

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test to ensure no state is shared
    });

    it('should create a new user successfully', async () => {
        // Arrange: Mock necessary methods
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.userExist.mockResolvedValue(mockUser); // Parent exists (returning a User object)
        userRepoMock.createUser.mockResolvedValue(mockUser); // Mock user creation

        // Act: Call the createUser method
        const response = await useCase.createUser(mockUserData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.Created,
            message: "User created successfully.",
            User: mockUser, // Ensure you're returning the correct mock user here
        });
    });

    it('should return error if user with this email already exists', async () => {
        // Arrange: Mock existing user
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(mockUser); // Simulate existing user

        // Act: Call the createUser method
        const response = await useCase.createUser(mockUserData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "User with this email already exists.",
        });
    });

    it('should return error if no roles are assigned', async () => {
        // Arrange: Update userData to have no roles
        const invalidUserData = { ...mockUserData, roles: [] };
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.userExist.mockResolvedValue(mockUser); // Parent exists

        // Act: Call the createUser method
        const response = await useCase.createUser(invalidUserData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "At least one role must be assigned.",
        });
    });

    it('should return error if parentId is not provided', async () => {
        // Arrange: Update userData to not have parentId
        const invalidUserData = { ...mockUserData, parentId: undefined };
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user

        // Act: Call the createUser method
        const response = await useCase.createUser(invalidUserData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "Parent ID must be provided.",
        });
    });

    it('should return error if parent does not exist', async () => {
        // Arrange: Mock the parent existence
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.userExist.mockResolvedValue(null); // Simulate that the parent does not exist

        // Act: Call the createUser method
        const response = await useCase.createUser(mockUserData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: `Parent node with ID ${mockUserData.parentId} does not exist.`,
        });
    });

    it('should return error if PO role is assigned without TO role', async () => {
        // Arrange: Update userData to have PO role without TO
        const invalidUserData = { ...mockUserData, roles: [RoleName.PO] };
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.userExist.mockResolvedValue(null); // Parent exists

        // Act: Call the createUser method
        const response = await useCase.createUser(invalidUserData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "A TO must be selected if a PO role is assigned.",
        });
    });
    it('should return internal server error on unexpected error', async () => {
        // Arrange: Mock an unexpected error
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        // Act: Call the createUser method
        const response = await useCase.createUser(mockUserData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Internal server error.",
        });
    });
});









describe('User API - updateUser', () => {
    // Initialize variables and mocks needed for the tests
    let mockUserData; // Mock data for user update
    let userRepoMock; // Mock for user repository

    beforeEach(() => {
        // Set up mock data and user repository before each test
        mockUserData = {
            id: 1,
            name: 'Updated User',
            email: 'updated@example.com',
            roles: [RoleName.TO],
            department: 'Engineering',
            parentId: 2,
            teamId: null,
            password: 'newpassword'
        };
        
        userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
    });

    it('should return error if user does not exist', async () => {
        // Arrange: Mock the repository to return null for user lookup
        userRepoMock.findUserById.mockResolvedValue(null);

        // Act: Call the updateUser method
        const response = await useCase.updateUser(mockUserData);

        // Assert: Check the response for user not found error
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "User not found."
        });
    });

    

    it('should return error if email is already in use', async () => {
        // Arrange: Mock existing user and email check
        userRepoMock.findUserById.mockResolvedValue(mockUserData);
        userRepoMock.findUserByEmail.mockResolvedValue(true); // Simulate existing email

        // Act: Call the updateUser method
        const response = await useCase.updateUser({ ...mockUserData, email: 'existing@example.com' });

        // Assert: Check the response for email already in use error
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "Email is already in use."
        });
    });

    it('should return error if no roles are assigned', async () => {
        const existingUser = { ...mockUserData, parentId: null }; // Make parentId different from id
        existingUser.roles = [];
        // Arrange: Mock existing user
        userRepoMock.findUserById.mockResolvedValue(existingUser);

        // Act: Call updateUser with no roles
        const response = await useCase.updateUser({ ...existingUser, roles: [] });

        // Assert: Check the response for at least one role error
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "At least one role must be assigned."
        });
    });

    it('should return error if PO role is assigned without TO role', async () => {
        // Arrange: Mock existing user
        const existingUser = { ...mockUserData, parentId: null }; // Make parentId different from id
        existingUser.roles = [];
        userRepoMock.findUserById.mockResolvedValue(existingUser);
        userRepoMock.findUserByEmail.mockResolvedValue(null); // Ensure email check passes

        // Act: Call updateUser with PO role but no TO role
        const response = await useCase.updateUser({ ...existingUser, roles: [RoleName.PO] });

        // Assert: Check the response for TO requirement error
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "A TO must be selected if a PO role is assigned."
        });
    });

    it('should return error if BO role is assigned without TO role', async () => {
        // Arrange: Mock existing user with BO role and no TO role
        userRepoMock.findUserById.mockResolvedValue({ ...mockUserData, roles: [RoleName.BO] });
        userRepoMock.findUserByEmail.mockResolvedValue(null); // Ensure email check passes
        userRepoMock.findUserByRole.mockResolvedValue(null); // Simulate no TO role exists

        // Act: Call updateUser
        const response = await useCase.updateUser({ ...mockUserData, roles: [RoleName.BO] });

        // Assert: Check the response for BO requirement error
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "A TO role must be created before creating a BO."
        });
    });

    it('should return error if parentId does not exist', async () => {
        const data={...mockUserData}
        data.roles.push(RoleName.TO)
        // Arrange: Mock existing user with a different parentId
        userRepoMock.findUserById.mockResolvedValue(mockUserData);
        userRepoMock.userExist.mockResolvedValue(false); // Simulate non-existing parent

        // Act: Call updateUser with non-existing parentId
        const response = await useCase.updateUser({ ...mockUserData, parentId: 99 });

        // Assert: Check the response for parent not found error
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "Parent node with ID 99 does not exist."
        });
    });

    

    it('should handle unexpected errors', async () => {
        // Arrange: Mock existing user and simulate an unexpected error
        userRepoMock.findUserById.mockRejectedValue(new Error("Unexpected error")); // Simulate an error

        // Act: Call updateUser
        const response = await useCase.updateUser(mockUserData);

        // Assert: Check the response for internal server error
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Unexpected error"
        });
    });

    it('should return error if trying to remove TO role', async () => {
        // Arrange: Mock existing user with TO role
        userRepoMock.findUserById.mockResolvedValue({ ...mockUserData, roles: [RoleName.TO] });

        // Act: Update user data to remove TO role
        const response = await useCase.updateUser({ ...mockUserData, roles: [] });

        // Assert: Check the response for error on removing TO role
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "Cannot remove TO role;"
        });
    });
});

jest.mock('../src/app/repository/UserRepo'); // Adjust this path as necessary

describe('User API - getAllUser', () => {
    const mockUsers: User[] = [
        {
            id: 1,
            name: "John Doe",
            department: "HR",
            phoneNumber: "123-456-7890",
            email: "john.doe@example.com",
            password: "securePassword1!",
            createdAt: new Date(),
            roles: [RoleName.TO],
            parentId: 1,
            teamId: 1,
            children: [],
            parent: new User,
            brandOwnerships: [],
            team: new Team,
            userTeams: []
        },
        {
            id: 2,
            name: "Jane Smith",
            department: "Development",
            phoneNumber: "098-765-4321",
            email: "jane.smith@example.com",
            password: "securePassword2!",
            createdAt: new Date(),
            roles: [RoleName.TO],
            parentId: 1,
            teamId: 1,
            children: [],
            parent: new User,
            brandOwnerships: [],
            team: new Team,
            userTeams: []
        },
    ];
    
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should return all users successfully', async () => {
        // Arrange: Mock the user repository method
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getUserTree.mockResolvedValue(mockUsers); // Simulate returned users

        // Act: Call the getAllUser method
        const response = await useCase.getAllUser();

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            user: mockUsers, // Ensure 'user' key is used correctly
            message: "All users fetched successfully", // Ensure this matches the expected message
        });
    });

    it('should return an empty array if no users exist', async () => {
        // Arrange: Mock the user repository method to return no users
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getUserTree.mockResolvedValue([]); // No users found

        // Act: Call the getAllUser method
        const response = await useCase.getAllUser();

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            user: [], // Ensure an empty array is returned
            message: "All users fetched successfully", // Ensure this matches the expected message
        });
    });

    it('should return internal server error on unexpected error', async () => {
        // Arrange: Mock an unexpected error
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getUserTree.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        // Act: Call the getAllUser method
        const response = await useCase.getAllUser();

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when fetching users", // Ensure this matches your function's error handling
        });
    });
});





describe('User Use Case - getAllTo', () => {
    const mockToUsers: User[] = [
        {
            id: 1,
            name: "Alice Johnson",
            department: "Marketing",
            phoneNumber: "111-222-3333",
            email: "alice.johnson@example.com",
            password: "securePasswordA!",
            createdAt: new Date(),
            roles: [RoleName.TO],
            parentId: 1,
            teamId: 1,
            children: [],
            parent: new User, // or provide a mock User if needed
            brandOwnerships: [], // Assuming it's an array
            team: new Team, // or provide a mock Team object if needed
            userTeams: [], // Assuming it's an array
        },
        {
            id: 2,
            name: "Bob Brown",
            department: "Sales",
            phoneNumber: "444-555-6666",
            email: "bob.brown@example.com",
            password: "securePasswordB!",
            createdAt: new Date(),
            roles: [RoleName.TO],
            parentId: 1,
            teamId: 1,
            children: [],
            parent: new User, // or provide a mock User if needed
            brandOwnerships: [], // Assuming it's an array
            team: new Team, // or provide a mock Team object if needed
            userTeams: [], // Assuming it's an array
        },
    ];

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should return all users with role TO successfully', async () => {
        // Arrange: Mock the user repository method
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getUsersWithRoleTO.mockResolvedValue(mockToUsers); // Simulate returned users

        // Act: Call the getAllTo use case method
        const response = await useCase.getAllTo();

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            user: mockToUsers, // Ensure 'user' key is used correctly
            message: "all to fetched successfully", // Ensure this matches the expected message
        });
    });

    it('should return an empty array if no users with role TO exist', async () => {
        // Arrange: Mock the user repository method to return no users
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getUsersWithRoleTO.mockResolvedValue([]); // No users found

        // Act: Call the getAllTo use case method
        const response = await useCase.getAllTo();

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            user: [], // Ensure an empty array is returned
            message: "all to fetched successfully", // Ensure this matches the expected message
        });
    });

    it('should return internal server error on unexpected error', async () => {
        // Arrange: Mock an unexpected error
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getUsersWithRoleTO.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        // Act: Call the getAllTo use case method
        const response = await useCase.getAllTo();

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when creating node", // Ensure this matches your function's error handling
        });
    });
});



describe('Team API - getAllTeam', () => {
    const mockTeams: Team[] = [
        {
            id: 1,
            toUserId: 1, // Assuming this corresponds to a valid User ID
            teamId: new User,
            users: [], // Initially, no users in this team
            createdAt: new Date(),
        },
        {
            id: 2,
            toUserId: 2, // Assuming this corresponds to a valid User ID
            teamId: new User,
            users: [], // Initially, no users in this team
            createdAt: new Date(),
        },
    ];

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should return all teams successfully', async () => {
        // Arrange: Mock the user repository method
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getAllTeam.mockResolvedValue(mockTeams); // Simulate returned teams

        // Act: Call the getAllTeam method
        const response = await useCase.getAllTeam();

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            team: mockTeams, // Ensure 'team' key is used correctly
            message: "All teams fetched successfully", // Ensure this matches the expected message
        });
    });

    it('should return an empty array if no teams exist', async () => {
        // Arrange: Mock the user repository method to return no teams
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getAllTeam.mockResolvedValue([]); // No teams found

        // Act: Call the getAllTeam method
        const response = await useCase.getAllTeam();

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            team: [], // Ensure an empty array is returned
            message: "All teams fetched successfully", // Ensure this matches the expected message
        });
    });

    it('should return internal server error on unexpected error', async () => {
        // Arrange: Mock an unexpected error
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getAllTeam.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        // Act: Call the getAllTeam method
        const response = await useCase.getAllTeam();

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when fetching teams", // Ensure this matches your function's error handling
        });
    });
});



describe('User API - getUser', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should return user successfully when user exists', async () => {
        // Arrange: Mock the user repository method
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const mockUser: User = {
            id: 2,
            name: "Bob Brown",
            department: "Sales",
            phoneNumber: "444-555-6666",
            email: "bob.brown@example.com",
            password: "securePasswordB!",
            createdAt: new Date(),
            roles: [RoleName.TO],
            parentId: 1,
            teamId: 1,
            children: [],
            parent: new User, // or provide a mock User if needed
            brandOwnerships: [], // Assuming it's an array
            team: new Team, // or provide a mock Team object if needed
            userTeams: [], // Assuming it's an array
        }
        userRepoMock.getUserById.mockResolvedValue(mockUser); // Simulate returned user

        // Act: Call the getUser method
        const userId = 1; // Example user ID
        const response = await useCase.getUser(userId);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            User: mockUser, // Ensure the correct user is returned
            message: "User fetched successfully", // Ensure this matches the expected message
        });
    });

    it('should return not found if user does not exist', async () => {
        // Arrange: Mock the user repository method to return null
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getUserById.mockResolvedValue(null); // User not found

        // Act: Call the getUser method
        const userId = 999; // Non-existing user ID
        const response = await useCase.getUser(userId);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: `No user found with specific id ${userId}`, // Ensure this matches the expected message
        });
    });

    it('should return internal server error on unexpected error', async () => {
        // Arrange: Mock an unexpected error
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.getUserById.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        // Act: Call the getUser method
        const userId = 1; // Example user ID
        const response = await useCase.getUser(userId);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when fetching user", // Ensure this matches your function's error handling
        });
    });
});

const mockUser: User = {
    id: 2,
    name: "Bob Brown",
    department: "Sales",
    phoneNumber: "444-555-6666",
    email: "bob.brown@example.com",
    password: "securePasswordB!",
    createdAt: new Date(),
    roles: [RoleName.BO],
    parentId: 1,
    teamId: 1,
    children: [],
    parent: new User, // or provide a mock User if needed
    brandOwnerships: [], // Assuming it's an array
    team: new Team, // or provide a mock Team object if needed
    userTeams: [], // Assuming it's an array
}

describe('User API - deleteUser', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });
    
  
    it('should delete a user successfully when a valid ID is provided', async () => {
        // Arrange: Mock the user repository methods
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const userId = 1; // Example user ID

        userRepoMock.getUserById.mockResolvedValue(mockUser); // Mock user retrieval
        userRepoMock.deleteUserById.mockResolvedValue(undefined); // Mock successful deletion

        // Act: Call the deleteUser method
        const response = await useCase.deleteUser(userId);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            message: "User deleted successfully", // Ensure this matches the expected message
        });
    });

    it('should return not found if the user does not exist', async () => {
        // Arrange: Mock user repository method to return null
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const userId = 2; // Example user ID

        userRepoMock.getUserById.mockResolvedValue(null); // No user found

        // Act: Call the deleteUser method
        const response = await useCase.deleteUser(userId);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "User Not Found", // Ensure this matches the expected message
        });
    });

    it('should return internal server error on unexpected error', async () => {
        // Arrange: Mock an unexpected error during user retrieval
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const userId = 4; // Example user ID

        userRepoMock.getUserById.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        // Act: Call the deleteUser method
        const response = await useCase.deleteUser(userId);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when deleting user", // Ensure this matches the expected error message
        });
    });
});



describe('User API - login', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    // it('should log in successfully with valid email and password', async () => {
    //     // Arrange: Mock the user repository methods
    //     const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
    //     const loginData = { email: "admin@gmail.com", password: "admin@123" };

    //     userRepoMock.findUserByEmail.mockResolvedValue(mockUser); // Mock user retrieval

    //     // Act: Call the login method
    //     const response = await useCase.login(loginData);

    //     // Assert: Check the response
    //     expect(response).toEqual({
    //         status: StatusCode.OK,
    //         User: mockUser,
    //         token: expect.any(String), // Expect a token to be generated
    //         message: "User logged in successfully.", // Ensure this matches the expected message
    //     });
    // });

    it('should return bad request if the email does not exist', async () => {
        // Arrange: Mock user repository method to return null
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const loginData = { email: "nonexistent@example.com", password: "anyPassword" };

        userRepoMock.findUserByEmail.mockResolvedValue(null); // No user found

        // Act: Call the login method
        const response = await useCase.login(loginData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "Invalid email.", // Ensure this matches the expected message
        });
    });

    it('should return bad request if the password is invalid', async () => {
        // Arrange: Mock user repository method to return a user with an invalid password
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const loginData = { email: "user@example.com", password: "invalidPassword" };

        userRepoMock.findUserByEmail.mockResolvedValue(mockUser); // Mock user retrieval

        // Act: Call the login method
        const response = await useCase.login(loginData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "Invalid password.", // Ensure this matches the expected message
        });
    });

    // it('should allow admin login with direct password check', async () => {
    //     // Arrange: Mock user repository method to return an admin user
    //     const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
    //     const loginData = { email: "admin@gmaail.com", password: "admin@123" };

    //     userRepoMock.findUserByEmail.mockResolvedValue(mockUser); // Mock user retrieval

    //     // Act: Call the login method
    //     const response = await useCase.login(loginData);

    //     // Assert: Check the response
    //     expect(response).toEqual({
    //         status: StatusCode.OK,
    //         User: mockUser,
    //         token: expect.any(String), // Expect a token to be generated
    //         message: "User logged in successfully.", // Ensure this matches the expected message
    //     });
    // });

    it('should return internal server error on unexpected error', async () => {
        // Arrange: Mock an unexpected error during user retrieval
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const loginData = { email: "error@example.com", password: "anyPassword" };

        userRepoMock.findUserByEmail.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        // Act: Call the login method
        const response = await useCase.login(loginData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Internal server error.", // Ensure this matches the expected error message
        });
    });
});

const mockBrandData: Brand = {
    id: 1, // Auto-incrementing ID for the brand
    brandName: "AdisDas", // Name of the brand
    revenue: 890000, // Revenue of the brand
    dealClosedValue: 9839489, // Total value of closed deals for the brand
    createdAt: new Date(), // Current timestamp for creation date
    contacts: [], // Empty array for brand contacts (can be filled with mock data if needed)
    brandOwnerships: [], // Empty array for brand ownerships (can be filled with mock data if needed)
};
const brandData: BrandData = {
    brandName: "AdisDas", // The name of the brand
    revenue: 890000, // The revenue associated with the brand
    dealClosedValue: 9839489, // Total value of closed deals for the brand
    id: 0 // Assuming this is for a new brand (ID will be auto-generated)
};



jest.mock('../src/app/repository/UserRepo'); // Adjust this path as necessary



describe('User API - searchUser', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should fetch the user successfully if the email exists', async () => {
        // Arrange
        const email = 'admin@gmail.com'; // Sample email
        const mockUser = {
            id: 1,
            email: 'admin@gmail.com',
            name: 'Admin User',
            // Add other fields as necessary
        };

        (userRepo.findUserByEmail as jest.Mock).mockResolvedValue(mockUser); // Mock user retrieval

        // Act
        const response = await useCase.searchUser(email);

        // Assert
        expect(response).toEqual({
            status: StatusCode.OK,
            User: mockUser,
            message: 'serched user fetched successfully',
        });
    });

    it('should return internal server error on unexpected error', async () => {
        // Arrange
        const email = 'error@example.com'; // Sample email
        (userRepo.findUserByEmail as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected error"); // Simulate an unexpected error
        });

        // Act
        const response = await useCase.searchUser(email);

        // Assert
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: 'Error when adding brand ownership',
        });
    });
});




// describe('User Use Case - getAllTo', () => {
//     const mockToUsers: User[] = [
//         {
//             id: 1,
//             name: "Alice Johnson",
//             department: "Marketing",
//             phoneNumber: "111-222-3333",
//             email: "alice.johnson@example.com",
//             password: "securePasswordA!",
//             createdAt: new Date(),
//             roles: [RoleName.TO],
//             parentId: 1,
//             teamId: 1,
//             children: [],
//             parent: new User, // or provide a mock User if needed
//             brandOwnerships: [], // Assuming it's an array
//             team: new Team, // or provide a mock Team object if needed
//             userTeams: [], // Assuming it's an array
//         },
//         {
//             id: 2,
//             name: "Bob Brown",
//             department: "Sales",
//             phoneNumber: "444-555-6666",
//             email: "bob.brown@example.com",
//             password: "securePasswordB!",
//             createdAt: new Date(),
//             roles: [RoleName.TO],
//             parentId: 1,
//             teamId: 1,
//             children: [],
//             parent: new User, // or provide a mock User if needed
//             brandOwnerships: [], // Assuming it's an array
//             team: new Team, // or provide a mock Team object if needed
//             userTeams: [], // Assuming it's an array
//         },
//     ];

//     afterEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     it('should return all users with role TO successfully', async () => {
//         // Arrange: Mock the user repository method
//         const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
//         userRepoMock.getUsersWithRoleTO.mockResolvedValue(mockToUsers); // Simulate returned users

//         // Act: Call the getAllTo use case method
//         const response = await useCase.getAllTo();

//         // Assert: Check the response
//         expect(response).toEqual({
//             status: StatusCode.OK,
//             user: mockToUsers, // Ensure 'user' key is used correctly
//             message: "all to fetched successfully", // Ensure this matches the expected message
//         });
//     });

//     it('should return an empty array if no users with role TO exist', async () => {
//         // Arrange: Mock the user repository method to return no users
//         const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
//         userRepoMock.getUsersWithRoleTO.mockResolvedValue([]); // No users found

//         // Act: Call the getAllTo use case method
//         const response = await useCase.getAllTo();

//         // Assert: Check the response
//         expect(response).toEqual({
//             status: StatusCode.OK,
//             user: [], // Ensure an empty array is returned
//             message: "all to fetched successfully", // Ensure this matches the expected message
//         });
//     });

//     it('should return internal server error on unexpected error', async () => {
//         // Arrange: Mock an unexpected error
//         const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
//         userRepoMock.getUsersWithRoleTO.mockImplementation(() => {
//             throw new Error("Unexpected error");
//         });

//         // Act: Call the getAllTo use case method
//         const response = await useCase.getAllTo();

//         // Assert: Check the response
//         expect(response).toEqual({
//             status: StatusCode.InternalServerError,
//             message: "Error when creating node", // Ensure this matches your function's error handling
//         });
//     });
// });



// describe('Team API - getAllTeam', () => {
//     const mockTeams: Team[] = [
//         {
//             id: 1,
//             toUserId: 1, // Assuming this corresponds to a valid User ID
//             teamId: new User,
//             users: [], // Initially, no users in this team
//             createdAt: new Date(),
//         },
//         {
//             id: 2,
//             toUserId: 2, // Assuming this corresponds to a valid User ID
//             teamId: new User,
//             users: [], // Initially, no users in this team
//             createdAt: new Date(),
//         },
//     ];

//     afterEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     it('should return all teams successfully', async () => {
//         // Arrange: Mock the user repository method
//         const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
//         userRepoMock.getAllTeam.mockResolvedValue(mockTeams); // Simulate returned teams

//         // Act: Call the getAllTeam method
//         const response = await useCase.getAllTeam();

//         // Assert: Check the response
//         expect(response).toEqual({
//             status: StatusCode.OK,
//             team: mockTeams, // Ensure 'team' key is used correctly
//             message: "All teams fetched successfully", // Ensure this matches the expected message
//         });
//     });

//     it('should return an empty array if no teams exist', async () => {
//         // Arrange: Mock the user repository method to return no teams
//         const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
//         userRepoMock.getAllTeam.mockResolvedValue([]); // No teams found

//         // Act: Call the getAllTeam method
//         const response = await useCase.getAllTeam();

//         // Assert: Check the response
//         expect(response).toEqual({
//             status: StatusCode.OK,
//             team: [], // Ensure an empty array is returned
//             message: "All teams fetched successfully", // Ensure this matches the expected message
//         });
//     });

//     it('should return internal server error on unexpected error', async () => {
//         // Arrange: Mock an unexpected error
//         const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
//         userRepoMock.getAllTeam.mockImplementation(() => {
//             throw new Error("Unexpected error");
//         });

//         // Act: Call the getAllTeam method
//         const response = await useCase.getAllTeam();

//         // Assert: Check the response
//         expect(response).toEqual({
//             status: StatusCode.InternalServerError,
//             message: "Error when fetching teams", // Ensure this matches your function's error handling
//         });
//     });
// });







// describe('User API - createBrand', () => {
//     const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;

//     afterEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     it('should create a brand successfully if it does not exist', async () => {
//         // Arrange: Mock the user repository methods
        
//         userRepoMock.findBrandByName.mockResolvedValue(null); // No existing brand found
//         userRepoMock.createBrand.mockReturnValue(mockBrandData); // Return mock brand data
//         userRepoMock.saveBrand.mockResolvedValue(mockBrandData); // Mock saving brand

//         // Act: Call the createBrand method
//         const response = await useCase.createBrand(brandData);

//         // Assert: Check the response
//         expect(response).toEqual({
//             status: StatusCode.OK,
//             Brand: mockBrandData, // Ensure it returns the created brand data
//             message: "Brand created successfully", // Ensure this matches the expected message
//         });
//     });

//     it('should return conflict if the brand already exists', async () => {
//         // Arrange: Mock the user repository methods to simulate an existing brand
        
//         userRepoMock.findBrandByName.mockResolvedValue(mockBrandData); // Mock existing brand retrieval

//         // Act: Call the createBrand method
//         const response = await useCase.createBrand(brandData);

//         // Assert: Check the response
//         expect(response).toEqual({
//             status: StatusCode.Conflict,
//             message: "Brand already exists with the same name", // Ensure this matches the expected message
//         });
//     });

//     it('should return internal server error on unexpected error', async () => {
//         userRepoMock.findBrandByName.mockImplementation(() => {
//             throw new Error("Unexpected error"); // Simulate an unexpected error
//         });

//         // Act: Call the createBrand method
//         const response = await useCase.createBrand(brandData);

//         // Assert: Check the response
//         expect(response).toEqual({
//             status: StatusCode.InternalServerError,
//             message: "Error when creating brand", // Ensure this matches the expected error message
//         });
//     });
// });




// describe('User API - updateBrand', () => {
//     const userRepoMock = userRepo as jest.Mocked<typeof userRepo>; // Mock the UserRepo

//     afterEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     it('should update the brand successfully if it exists', async () => {
//         // Arrange
   


//         userRepoMock.findBrandByName.mockResolvedValue(null); // No brand with the same name exists
//         userRepoMock.findBrandByID.mockResolvedValue(mockBrandData); // Existing brand found
//         userRepoMock.saveBrand.mockResolvedValue(mockBrandData); // Mock saving updated brand

//         // Act
//         const response = await useCase.updateBrand(brandData);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.OK,
//             Brand: mockBrandData,
//             message: "Brand updated successfully",
//         });
//     });


//     it('should return not found if the brand does not exist', async () => {
//         // Arrange
//         const brandDatas = {...brandData}
//         brandDatas.id=999

//         userRepoMock.findBrandByName.mockResolvedValue(null); // No brand with the same name
//         userRepoMock.findBrandByID.mockResolvedValue(null); // No brand found with the given ID

//         // Act
//         const response = await useCase.updateBrand(brandDatas);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.NotFound,
//             message: "Brand not found",
//         });
//     });

//     it('should return internal server error on unexpected error', async () => {

//         userRepoMock.findBrandByName.mockResolvedValue(null); // No brand with the same name
//         userRepoMock.findBrandByID.mockImplementation(() => {
//             throw new Error("Unexpected error"); // Simulate unexpected error
//         });

//         // Act
//         const response = await useCase.updateBrand(brandData);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.InternalServerError,
//             message: "Error when updating brand",
//         });
//     });
// });



// describe('User API - getBrandDetail', () => {
//     const userRepoMock = userRepo as jest.Mocked<typeof userRepo>; // Mock the user repository

//     afterEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     it('should fetch the brand details successfully if the brand exists', async () => {
//         // Arrange
//         const brandId = 1; // Sample brand ID
//         const mockBrandDetail: Brand = {
//             id: brandId,
//             brandName: "Sample Brand",
//             revenue: 1000000,
//             dealClosedValue: 5000000,
//             createdAt: new Date(),
//             contacts: [],
//             brandOwnerships: [],
//         };

//         userRepoMock.getBrandDetail.mockResolvedValue(mockBrandDetail); // Mock the brand detail retrieval

//         // Act
//         const response = await useCase.getBrandDetail(brandId);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.OK,
//             Brand: mockBrandDetail,
//             message: "single brand detail fetched success fully",
//         });
//     });


//     it('should return internal server error on unexpected error', async () => {
//         // Arrange
//         const brandId = 1; // Sample brand ID
//         userRepoMock.getBrandDetail.mockImplementation(() => {
//             throw new Error("Unexpected error"); // Simulate an unexpected error
//         });

//         // Act
//         const response = await useCase.getBrandDetail(brandId);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.InternalServerError,
//             message: "Error when getting brand",
//         });
//     });
// });



// describe('User API - updateBrandContact', () => {
//     const userRepoMock = userRepo as jest.Mocked<typeof userRepo>; // Mock the user repository

//     afterEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     it('should update brand contact successfully if the brand exists and user is the owner', async () => {
//         // Arrange
//         const brandContactData: BrandContactData = {
//             id: 1, // Sample contact ID
//             brandId: 1, // Sample brand ID
//             contactPersonName: "John Doe", // Corrected contact name
//             contactPersonPhone: "123-456-7890", // Added phone number
//             contactPersonEmail: "john@example.com", // Corrected contact email
//         };

//         const loggedUserId = 1; // Sample logged-in user ID

     

//         const mockBrandContact = 
//             {
//                 id: 1,
//                 brand: new Brand,
//                 contactPersonName: "Alice Johnson",
//                 contactPersonPhone: "123-456-7890",
//                 contactPersonEmail: "alice@example.com",
//                 createdAt: new Date(), // Automatically set to the current timestamp
//             }
    

//         userRepoMock.getBrandDetail.mockResolvedValue(mockBrandData); // Mock the brand detail retrieval
//         userRepoMock.getBrandContactById.mockResolvedValue(mockBrandContact); // Mock existing brand contact retrieval
//         userRepoMock.updateBrandContact.mockResolvedValue({ ...mockBrandContact, ...brandContactData }); // Mock updating brand contact

//         // Act
//         const response = await useCase.updateBrandContact(brandContactData, loggedUserId);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.OK,
//             BrandContact: { ...mockBrandContact, ...brandContactData }, // Updated contact details in the response
//             message: "Brand contact updated successfully",
//         });
//     });

//     it('should return not found if the brand does not exist', async () => {
//         // Arrange
//         const brandContactData: BrandContactData = {
//             id: 1,
//             brandId: 1,
//             contactPersonName: "John Doe",
//             contactPersonPhone: "123-456-7890",
//             contactPersonEmail: "john@example.com",
//         };
//         const loggedUserId = 1;

//         userRepoMock.getBrandDetail.mockResolvedValue(null); // Simulate brand not found

//         // Act
//         const response = await useCase.updateBrandContact(brandContactData, loggedUserId);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.NotFound,
//             message: "Brand not found",
//         });
//     });

//     it('should return internal server error on unexpected error', async () => {
//         // Arrange
//         const brandContactData: BrandContactData = {
//             id: 1,
//             brandId: 1,
//             contactPersonName: "John Doe",
//             contactPersonPhone: "123-456-7890",
//             contactPersonEmail: "john@example.com",
//         };
//         const loggedUserId = 1;

//         userRepoMock.getBrandDetail.mockImplementation(() => {
//             throw new Error("Unexpected error"); // Simulate an unexpected error
//         });

//         // Act
//         const response = await useCase.updateBrandContact(brandContactData, loggedUserId);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.InternalServerError,
//             message: "Error when updating brand contact",
//         });
//     });
// });





// describe('User API - addBrandOwnership', () => {
//     const userRepoMock = userRepo as jest.Mocked<typeof userRepo>; // Mock the user repository

//     afterEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     it('should add brand ownership successfully if the user and brand exist', async () => {
//         // Arrange
//         const brandOwnershipData: BrandOwnershipData = {
//             brandId: 1, // Sample brand ID
//             boUserId: 1, // Sample BO user ID
//         };




//         const addedBrandOwnership = {
//             id: 1,
//             brand: mockBrandData,
//             boUser: mockUser,
//             createdAt: new Date(),
//         };

//         userRepoMock.findUserById.mockResolvedValue(mockUser); // Mock user retrieval
//         userRepoMock.findBrandByID.mockResolvedValue(mockBrandData); // Mock brand retrieval
//         userRepoMock.addBrandOwnership.mockResolvedValue(addedBrandOwnership); // Mock adding brand ownership

//         // Act
//         const response = await useCase.addBrandOwnership(brandOwnershipData,1);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.OK,
//             BrandOwnership: addedBrandOwnership,
//             message: 'Brand ownership added successfully',
//         });
//     });

//     it('should return not found if the BO user does not exist', async () => {
//         // Arrange
//         const brandOwnershipData: BrandOwnershipData = {
//             brandId: 1,
//             boUserId: 1,
//         };

//         userRepoMock.findUserById.mockResolvedValue(null); // Simulate user not found

//         // Act
//         const response = await useCase.addBrandOwnership(brandOwnershipData,1);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.NotFound,
//             message: `There is no BO user with this user id: ${brandOwnershipData.boUserId}`,
//         });
//     });

//     it('should return not found if the brand does not exist', async () => {
//         // Arrange
//         const brandOwnershipData: BrandOwnershipData = {
//             brandId: 1,
//             boUserId: 1,
//         };


//         userRepoMock.findUserById.mockResolvedValue(mockUser); // Mock user retrieval
//         userRepoMock.findBrandByID.mockResolvedValue(null); // Simulate brand not found

//         // Act
//         const response = await useCase.addBrandOwnership(brandOwnershipData,1);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.NotFound,
//             message: `There is no Brand with this brand id: ${brandOwnershipData.brandId}`,
//         });
//     });

//     it('should return bad request if adding brand ownership fails', async () => {
//         // Arrange
//         const brandOwnershipData: BrandOwnershipData = {
//             brandId: 1,
//             boUserId: 1,
//         };
//         userRepoMock.findUserById.mockResolvedValue(mockUser); // Mock user retrieval
//         userRepoMock.findBrandByID.mockResolvedValue(mockBrandData); // Mock brand retrieval
//         userRepoMock.addBrandOwnership.mockResolvedValue(null); // Simulate adding brand ownership failure

//         // Act
//         const response = await useCase.addBrandOwnership(brandOwnershipData,1);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.BadRequest,
//             message: 'Failed to add brand ownership',
//         });
//     });

//     it('should return internal server error on unexpected error', async () => {
//         // Arrange
//         const brandOwnershipData: BrandOwnershipData = {
//             brandId: 1,
//             boUserId: 1,
//         };

//         userRepoMock.findUserById.mockImplementation(() => {
//             throw new Error("Unexpected error"); // Simulate an unexpected error
//         });

//         // Act
//         const response = await useCase.addBrandOwnership(brandOwnershipData,1);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.InternalServerError,
//             message: 'Error when adding brand ownership',
//         });
//     });
// });


