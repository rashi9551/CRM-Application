import useCase from '../src/app/useCase/useCase'; // Adjust the import according to your file structure
import userRepo from '../src/app/repository/UserRepo'; // Adjust accordingly
import { GetAllUser, Department, RoleName, UserData, BrandData, BrandContactData, BrandOwnershipData } from '../src/interfaces/interface'; // Adjust accordingly
import { StatusCode } from '../src/interfaces/enum';
import { User } from '../src/entity/User';
import { Team } from '../src/entity/Team';
import bcrypt from 'bcryptjs';
import { Brand } from '../src/entity/Brand';
import { BrandContact } from '../src/entity/BrandContact';


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