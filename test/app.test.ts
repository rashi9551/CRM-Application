import useCase from '../src/app/useCase/useCase'; // Adjust the import according to your file structure
import userRepo from '../src/app/repository/UserRepo'; // Adjust accordingly
import { Department, RoleName, UserData } from '../src/interfaces/interface'; // Adjust accordingly
import { StatusCode } from '../src/interfaces/enum';
import { User } from '../src/entity/User';
import { Team } from '../src/entity/Team';

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
        teamOwner: 1,
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
        validateEmail: function (): void {
            throw new Error('Function not implemented.');
        }
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
