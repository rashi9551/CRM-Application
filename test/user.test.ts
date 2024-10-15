import useCase from '../src/app/useCase/useCase'; // Adjust the import according to your file structure
import userRepo from '../src/app/repository/UserRepo'; // Adjust accordingly
import { GetAllUser, Department, RoleName, UserData, BrandData, BrandContactData, BrandOwnershipData, updatingUserData } from '../src/interfaces/interface'; // Adjust accordingly
import { StatusCode } from '../src/interfaces/enum';
import { User } from '../src/entity/User';
import { Team } from '../src/entity/Team';
import bcrypt from 'bcryptjs';
import { Brand } from '../src/entity/Brand';
import { BrandContact } from '../src/entity/BrandContact';


const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;


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
     team: new Team,
     userTeams: [],
     assignedTasks: [],
     createdTasks: [],
     comments: [],
     notifications: []
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
}));


describe('User API - createUser', () => {
    

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test to ensure no state is shared
    });

    it('should create a new user successfully', async () => {
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.userExist.mockResolvedValue(mockUserCreateResponseData); // Parent exists
        userRepoMock.createUser.mockResolvedValue(mockUserCreateResponseData); // Mock user creation

        const response = await useCase.createUser(mockCreateUserData);

        expect(response).toEqual({
            status: StatusCode.Created,
            message: "User created successfully.",
            User: mockUserCreateResponseData
        });
    });

    it('should return error if user with this email already exists', async () => {
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(mockUserCreateResponseData); // Existing user

        const response = await useCase.createUser(mockCreateUserData);

        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "User with this email already exists."
        });
    });

    it('should return error if no roles are assigned', async () => {
        const invalidUserData = { ...mockCreateUserData};
        invalidUserData.roles=[]
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.userExist.mockResolvedValue(mockUserCreateResponseData); // Parent exists

        const response = await useCase.createUser(invalidUserData);

        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "At least one role must be assigned."
        });
    });

    it('should return error if parent does not exist', async () => {
        const invalidUserData = { ...mockCreateUserData};
        invalidUserData.parentId=9999
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.userExist.mockResolvedValue(null); // Parent does not exist

        const response = await useCase.createUser(invalidUserData);

        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: `Parent node with ID ${invalidUserData.parentId} does not exist.`
        });
    });

    it('should return error if PO role is assigned without TO role', async () => {
        const invalidUserData = { ...mockCreateUserData};
        invalidUserData.roles=[RoleName.PO] 
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.userExist.mockResolvedValue(mockUserCreateResponseData); // Parent exists

        const response = await useCase.createUser(invalidUserData);

        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "A TO must be selected if a PO role is assigned."
        });
    });

    it('should return error if TO role is not assigned but teamId is not provided', async () => {
        const invalidUserData = { ...mockCreateUserData};
        invalidUserData.roles=[RoleName.BO], 
        invalidUserData.teamId=null 
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.userExist.mockResolvedValue(mockUserCreateResponseData); // Parent exists

        const response = await useCase.createUser(invalidUserData);

        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "A team owner must be provided, or a TO role must be included."
        });
    });

    it('should return error if teamId is provided but the team does not exist', async () => {
        const dataWithInwalidTeamId = { ...mockCreateUserData};
        dataWithInwalidTeamId.teamId=999
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.findTeamById.mockResolvedValue(null)

        const response = await useCase.createUser(dataWithInwalidTeamId);

        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: `There is no team with this id.${dataWithInwalidTeamId.teamId}`
        });
    });

    it('should return error if BO role is assigned without any TO roles in the system', async () => {
        const data = { ...mockCreateUserData };
        data.roles=[RoleName.BO]
        data.teamId=1
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockResolvedValue(null); // No existing user
        userRepoMock.findUsersByRole.mockResolvedValue(null); // No TO users
        await useCase.createUser(mockCreateUserData);

        const response = await useCase.createUser(data);

        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "A TO role must be created before creating a BO."
        });
    });

    it('should return internal server error on unexpected error', async () => {
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        userRepoMock.findUserByEmail.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        const response = await useCase.createUser(mockCreateUserData);

        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Internal server error."
        });
    });
});






describe('User API - updateUser', () => {
    let mockUserData:updatingUserData
    let userRepoMock;

    beforeEach(() => {
        mockUserData = {
            id:3,
            name: "Rashid",
            department: Department.DEVELOPMENT,
            phoneNumber: "9867452323",
            email: "rashid@gmail.com",
            password: "12345",
            roles: [RoleName.TO], // At least one role must be provided
            teamId: null, // Required if a TO is selected
            parentId: 1
        }
        
        userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
    });

    it('should return error if user does not exist', async () => {
        userRepoMock.findUserById.mockResolvedValue(null);
        const response = await useCase.updateUser(mockUserData);
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "User not found."
        });
    });

    it('should return error if email is already in use', async () => {
        // Step 1: Modify mock user data to simulate the email change
        const emailChange = { ...mockUserData, email: "rashidroz@gmail.com" };
    
        // Step 2: Mock repository methods
        userRepoMock.findUserById.mockResolvedValue(mockUserData); // Mocking existing user
        userRepoMock.findUserByEmail.mockResolvedValue(true); // Simulating that the email is already in use
    
        // Step 3: Call updateUser with the modified user data
        const response = await useCase.updateUser(emailChange);
    
        // Step 4: Assert that the response matches the expected error
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "Email is already in use."
        });
    });

    it('should return error if no roles are assigned', async () => {
        const existingUser = { ...mockUserData, roles: [] };
        userRepoMock.findUserById.mockResolvedValue(existingUser);
        const response = await useCase.updateUser({ ...existingUser, roles: [] });
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "At least one role must be assigned."
        });
    });

    it('should return error if PO role is assigned without TO role', async () => {
        const existingUser = { ...mockUserData, roles: [] };
        userRepoMock.findUserById.mockResolvedValue(existingUser);
        userRepoMock.findUserByEmail.mockResolvedValue(null);
        const response = await useCase.updateUser({ ...existingUser, roles: [RoleName.PO] });
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "A TO must be selected if a PO role is assigned."
        });
    });

    it('should return error if parentId does not exist', async () => {
        userRepoMock.findUserById.mockResolvedValue(mockUserData);
        userRepoMock.userExist.mockResolvedValue(false);
        const response = await useCase.updateUser({ ...mockUserData, parentId: 99 });
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "Parent node with ID 99 does not exist."
        });
    });

    it('should return error if trying to remove TO role', async () => {
        userRepoMock.findUserById.mockResolvedValue({ ...mockUserData, roles: [RoleName.TO] });
        const response = await useCase.updateUser({ ...mockUserData, roles: [] });
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "Cannot remove TO role;"
        });
    });

    
    
    it('should update user successfully when all conditions are met', async () => {
        userRepoMock.findUserById.mockResolvedValue(mockUserData);
        userRepoMock.findUserByEmail.mockResolvedValue(null);
        userRepoMock.userExist.mockResolvedValue(true); // Mock team existence
        userRepoMock.checkForCycle.mockResolvedValue(false); // No cycle detected
        userRepoMock.saveUser.mockResolvedValue(mockUserData); // Simulate user save
        
        const response = await useCase.updateUser(mockUserData);
        expect(response).toEqual({
            status: StatusCode.OK,
            message: "User updated successfully.",
            User: mockUserData
        });
    });

    it('should handle unexpected errors', async () => {
        userRepoMock.findUserById.mockRejectedValue(new Error("Unexpected error"));
        const response = await useCase.updateUser(mockUserData);
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Unexpected error"
        });
    });
});




describe('User API - login', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should log in successfully with valid email and password', async () => {
        // Arrange: Mock the user repository methods
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const loginData = { email: "rashid@gmail.com", password: "12345" };

        userRepoMock.findUserByEmail.mockResolvedValue(mockUserCreateResponseData); // Mock user retrieval

        // Act: Call the login method
        const response = await useCase.login(loginData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            User: mockUserCreateResponseData,
            token: expect.any(String), // Expect a token to be generated
            message: "User logged in successfully.", // Ensure this matches the expected message
        });
    });

    

    it('should return bad request if the password is invalid', async () => {
        // Arrange: Mock user repository method to return a user with an invalid password
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const loginData = { email: "rashid@gmail.com", password: "545323" };

        userRepoMock.findUserByEmail.mockResolvedValue(mockUserCreateResponseData); // Mock user retrieval

        // Act: Call the login method
        const response = await useCase.login(loginData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "Invalid password.", // Ensure this matches the expected message
        });
    });


    it('should return bad request if the email does not exist', async () => {
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const loginData = { email: "nonexistent@example.com", password: "anyPassword" };

        userRepoMock.findUserByEmail.mockResolvedValue(null); // No user found

        const response = await useCase.login(loginData);

        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "Invalid email.", // Ensure this matches the expected message
        });
    });


    it('should return internal server error on unexpected error', async () => {
        // Arrange: Mock an unexpected error during user retrieval
        const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;
        const loginData = { email: "error@example.com", password: "12345" };

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



describe('User API - getAllUser', () => {
    const mockUsers: User[] = [mockUserCreateResponseData,mockUserCreateResponseData];
    
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
            user: [], // Ensure 'user' key is used correctly
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




describe('User API - getUser', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });
    const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;


    it('should fetch user successfully with valid id', async () => {
        // Arrange: Create mock user data
        const mockUser = { id: 1, name: "John Doe", email: "john@example.com" }; // Mock user data
        userRepoMock.getUserById.mockResolvedValue(mockUserCreateResponseData); // Mock user retrieval

        // Act: Call the getUser method
        const response = await useCase.getUser(1); // Assuming the valid id is 1

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            User: mockUserCreateResponseData,
            message: "User fetched successfully"
        });
    });

    it('should return not found if no user exists with the given id', async () => {
        // Arrange: Mock the user repository method to return null
        userRepoMock.getUserById.mockResolvedValue(null); // No user found

        // Act: Call the getUser method
        const response = await useCase.getUser(999); // Using a non-existent id

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "No user found with specific id 999"
        });
    });

    it('should return internal server error on unexpected error', async () => {
        // Arrange: Mock an unexpected error during user retrieval
        userRepoMock.getUserById.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        // Act: Call the getUser method
        const response = await useCase.getUser(1); // Using a valid id, but will trigger an error

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when fetching user"
        });
    });
});





describe('User API - deleteUser', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should delete user successfully if user has BO role', async () => {
        // Arrange: Create mock user data with BO role
        const mockUser: User = { ...mockUserCreateResponseData, id: 2, roles: [RoleName.BO] };
        console.log(mockUser);
        
        userRepoMock.getUserById.mockResolvedValue(mockUser); // Mock user retrieval
        userRepoMock.deleteUserById.mockResolvedValue(undefined); // Mock successful deletion

        // Act: Call the deleteUser method
        const response = await useCase.deleteUser(2); // Assuming the valid id is 2

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            message: "User deleted successfully"
        });
    });


    it('should return not found if no user exists with the given id', async () => {
        // Arrange: Mock the user repository method to return null
        userRepoMock.getUserById.mockResolvedValue(null); // No user found

        // Act: Call the deleteUser method
        const response = await useCase.deleteUser(999); // Using a non-existent id

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "User Not Found"
        });
    });

    it('should return bad request if user has TO role', async () => {
        // Arrange: Create mock user data with TO role
        const mockUser={...mockUserCreateResponseData}
        mockUser.roles=[RoleName.TO]
        userRepoMock.getUserById.mockResolvedValue(mockUser); // Mock user retrieval

        // Act: Call the deleteUser method
        const response = await useCase.deleteUser(1); // Assuming the valid id is 1

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            message: "Cannot remove TO role;"
        });
    });

    it('should update parent ID for children if user has children', async () => {
        // Arrange: Create mock user data with children
        const mockUser={...mockUserCreateResponseData}
        mockUser.roles=[RoleName.BO]
        mockUser.children=[new User]

        userRepoMock.getUserById.mockResolvedValue(mockUser); // Mock user retrieval
        userRepoMock.updateChildrenParentId.mockResolvedValue(undefined); // Mock successful update

        // Act: Call the deleteUser method
        const response = await useCase.deleteUser(2); // Assuming the valid id is 1

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            message: "User deleted successfully"
        });
        expect(userRepoMock.updateChildrenParentId).toHaveBeenCalledWith(mockUser.children, mockUser.parentId);
    });

    it('should return internal server error on unexpected error', async () => {
        // Arrange: Mock an unexpected error during user retrieval
        userRepoMock.getUserById.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        // Act: Call the deleteUser method
        const response = await useCase.deleteUser(1); // Using a valid id, but will trigger an error

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when deleting user"
        });
    });
});