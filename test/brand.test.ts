import userRepo from '../src/app/repository/UserRepo'; // Adjust accordingly
import { GetAllUser, Department, RoleName, UserData, BrandData, BrandContactData, BrandOwnershipData, updatingUserData } from '../src/interfaces/interface'; // Adjust accordingly
import { StatusCode } from '../src/interfaces/enum';
import { User } from '../src/entity/User';
import { Team } from '../src/entity/Team';
import bcrypt from 'bcryptjs';
import { Brand } from '../src/entity/Brand';
import { BrandContact } from '../src/entity/BrandContact';
import useCase from '../src/app/useCase/userUseCase'

const team:Team=
    {
        id: 1,
        toUserId: 2,
        createdAt: new Date,
        users: [
            {
                id: 3,
                name: "rashid",
                department: "Development",
                phoneNumber: "9867452323",
                email: "rashdid@gmail.com",
                password: "$2a$10$xfBxcsgx7Oq7mQhUV8ctFe3yr8nAk7wGeaz7XeJ/NCZ939hG3VTGq",
                createdAt: new Date,
                roles: [
                    RoleName.BO
                ],
                parentId: 2,
                teamId: 1,
                parent: new User,
                children: [],
                brandOwnerships: [],
                team: new Team,
                userTeams: [],
                assignedTasks: [],
                createdTasks: [],
                comments: [],
                notifications: [],
                taskHistories: []
            },
            {
                id: 2,
                name: "rashid",
                department: "Development",
                phoneNumber: "9867452323",
                email: "rashid@gmail.com",
                password: "$2a$10$9IEWstqBcvOqrNHg5LIVI.j/DVWjmAW4stBxbrG8vHUV.Uxz2Y2jK",
                createdAt: new Date,
                roles: [
                    RoleName.BO
                ],
                parentId: 1,
                teamId: 1,
                parent: new User,
                children: [],
                brandOwnerships: [],
                team: new Team,
                userTeams: [],
                assignedTasks: [],
                createdTasks: [],
                comments: [],
                notifications: [],
                taskHistories: []
            }
        ],
        teamOwner: {
            id: 2,
            name: "rashid",
            department: "Development",
            phoneNumber: "9867452323",
            email: "rashid@gmail.com",
            password: "$2a$10$9IEWstqBcvOqrNHg5LIVI.j/DVWjmAW4stBxbrG8vHUV.Uxz2Y2jK",
            createdAt: new Date,
            roles: [
                RoleName.TO
            ],
            parentId: 1,
            teamId: 1,
            parent: new User,
            children: [],
            brandOwnerships: [],
            team: new Team,
            userTeams: [],
            assignedTasks: [],
            createdTasks: [],
            comments: [],
            notifications: [],
            taskHistories: []
        }
    }


const mockUserCreateResponseData:User={
    name: "Rashid",
    department: Department.DEVELOPMENT,
    phoneNumber: "9867452323",
    email: "rashid@gmail.com",
    password: "$2a$10$6hmonDVFAysPWVrLft9D4.RS3/4bT.LXHuItFJQnI4aSSV4WFTjnG",
    roles: [
        RoleName.TO,
    ],
    parentId: 1,
    teamId: 1,
    id: 2,
    createdAt: new Date(),
    parent: new User,
    children: [],
    brandOwnerships: [],
    team: team,
    userTeams: [],
    assignedTasks: [],
    createdTasks: [],
    comments: [],
    notifications: [],
    taskHistories: []
}

const BrandCreateData:BrandData={
    brandName: "Adidas",
    revenue: 890000,
    dealClosedValue: 9839489,
    id: 0
}

export const BrandCreateReponseData:Brand={
    brandName: "Adidas",
    revenue: 890000,
    dealClosedValue: 9839489,
    id: 2,
    createdAt: new Date,
    contacts: [],
    brandOwnerships: [{
        id: 3,
        createdAt: new Date,
        boUser: mockUserCreateResponseData,
        brand: new Brand
    }
    ],
    tasks: []
}
const BrandContactAddingReponseData:BrandContact={
    contactPersonName: "rashid",
    contactPersonPhone: "+1234567890",
    contactPersonEmail: "john.doe@example.com",
    brand: {
        id: 2,
        brandName: '',
        revenue: 0,
        dealClosedValue: 0,
        createdAt: new Date,
        contacts: [],
        brandOwnerships: [],
        tasks: []
    },
    id: 3,
    createdAt: new Date
}



const mockBrandContactData: BrandContactData = {
    brandId: 1,
    contactPersonName: "John Doe",
    contactPersonEmail: "johndoe@example.com",
    contactPersonPhone: "1234567890"
};


jest.mock('../src/app/repository/UserRepo', () => ({
    findUserByEmail: jest.fn(),
    userExist: jest.fn(),
    findBrandByName: jest.fn(),
    createBrand: jest.fn(),
    saveBrand: jest.fn(),
    findUserById: jest.fn(),
    saveUser: jest.fn(),
    checkForCycle: jest.fn(),
    getUserTree: jest.fn(),
    getUserById: jest.fn(),
    updateChildrenParentId: jest.fn(),
    deleteUserById: jest.fn(),
    findBrandByID: jest.fn(),
    getBrandDetail: jest.fn(),
    addingBrandContact: jest.fn(),
    getBrandOwnerShip: jest.fn(),
    addBrandOwnership: jest.fn(),
    getHierarchyTO: jest.fn(),
}));
const hierarchyTo=[{
    name: "Rashid",
    department: "Development",
    phoneNumber: "9867452323",
    email: "rashid@gmail.com",
    password: "$2a$10$6hmonDVFAysPWVrLft9D4.RS3/4bT.LXHuItFJQnI4aSSV4WFTjnG",
    roles: [
        "TO"
    ],
    parentId: 1,
    teamId: 1,
    id: 2,
    createdAt: "2024-10-09T05:50:12.000Z"
}]
const BrandOwnershipCreateReponse={
    brand: BrandCreateReponseData,
    boUser:mockUserCreateResponseData,
    id: 3,
    createdAt: new Date
}
const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;




describe('User API - createBrand', () => {
    const userRepoMock = userRepo as jest.Mocked<typeof userRepo>;

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should create a brand successfully if it does not exist', async () => {
        // Arrange: Mock the user repository methods
        
        userRepoMock.findBrandByName.mockResolvedValue(null); // No existing brand found
        userRepoMock.createBrand.mockReturnValue(BrandCreateReponseData); // Return mock brand data
        userRepoMock.saveBrand.mockResolvedValue(BrandCreateReponseData); // Mock saving brand

        // Act: Call the createBrand method
        const response = await useCase.createBrand(BrandCreateData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            Brand: BrandCreateReponseData, // Ensure it returns the created brand data
            message: "Brand created successfully", // Ensure this matches the expected message
        });
    });

    it('should return conflict if the brand already exists', async () => {
        // Arrange: Mock the user repository methods to simulate an existing brand
        
        userRepoMock.findBrandByName.mockResolvedValue(BrandCreateReponseData); // Mock existing brand retrieval

        // Act: Call the createBrand method
        const response = await useCase.createBrand(BrandCreateData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.Conflict,
            message: "Brand already exists with the same name", // Ensure this matches the expected message
        });
    });

    it('should return internal server error on unexpected error', async () => {
        userRepoMock.findBrandByName.mockImplementation(() => {
            throw new Error("Unexpected error"); // Simulate an unexpected error
        });

        // Act: Call the createBrand method
        const response = await useCase.createBrand(BrandCreateData);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when creating brand", // Ensure this matches the expected error message
        });
    });
});


describe('User API - updateBrand', () => {
    const userRepoMock = userRepo as jest.Mocked<typeof userRepo>; // Mock the UserRepo

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should update the brand successfully if it exists', async () => {
        // Arrange
   


        userRepoMock.findBrandByName.mockResolvedValue(null); // No brand with the same name exists
        userRepoMock.findBrandByID.mockResolvedValue(BrandCreateReponseData); // Existing brand found
        userRepoMock.saveBrand.mockResolvedValue(BrandCreateReponseData); // Mock saving updated brand

        // Act
        const response = await useCase.updateBrand(BrandCreateData);

        // Assert
        expect(response).toEqual({
            status: StatusCode.OK,
            Brand: BrandCreateReponseData,
            message: "Brand updated successfully",
        });
    });


    it('should return not found if the brand does not exist', async () => {
        // Arrange
        const brandDatas = {...BrandCreateData}
        brandDatas.id=999

        userRepoMock.findBrandByName.mockResolvedValue(null); // No brand with the same name
        userRepoMock.findBrandByID.mockResolvedValue(null); // No brand found with the given ID

        // Act
        const response = await useCase.updateBrand(brandDatas);

        // Assert
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "Brand not found",
        });
    });

    it('should return internal server error on unexpected error', async () => {

        userRepoMock.findBrandByName.mockResolvedValue(null); // No brand with the same name
        userRepoMock.findBrandByID.mockImplementation(() => {
            throw new Error("Unexpected error"); // Simulate unexpected error
        });

        // Act
        const response = await useCase.updateBrand(BrandCreateData);

        // Assert
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when updating brand",
        });
    });
});





describe('User API - getBrandDetail', () => {
    const userRepoMock = userRepo as jest.Mocked<typeof userRepo>; // Mock the user repository

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should fetch the brand details successfully if the brand exists', async () => {
        // Arrange
        const brandId = 1; // Sample brand ID
        const mockBrandDetail: Brand = {
            id: brandId,
            brandName: "Sample Brand",
            revenue: 1000000,
            dealClosedValue: 5000000,
            createdAt: new Date(),
            contacts: [],
            brandOwnerships: [{
                id: 1,
                createdAt: new Date("2024-10-08T05:55:23.000Z"),
                brand: new Brand,
                boUser: mockUserCreateResponseData
            }],
            tasks: []
        };

        userRepoMock.getBrandDetail.mockResolvedValue(mockBrandDetail); // Mock the brand detail retrieval

        // Act
        const response = await useCase.getBrandDetail(brandId,2);

        // Assert
        expect(response).toEqual({
            status: StatusCode.OK,
            Brand: mockBrandDetail,
            message: "single brand detail fetched success fully",
        });
    });


    it('should return internal server error on unexpected error', async () => {
        // Arrange
        const brandId = 1; // Sample brand ID
        userRepoMock.getBrandDetail.mockImplementation(() => {
            throw new Error("Unexpected error"); // Simulate an unexpected error
        });

        // Act
        const response = await useCase.getBrandDetail(brandId,1);

        // Assert
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when getting brand",
        });
    });
});





describe('Brand API - addingBrandContact', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock data between tests
    });

    it('should add brand contact successfully if logged user is the owner of the brand', async () => {

        userRepoMock.getBrandDetail.mockResolvedValue(BrandCreateReponseData); // Mock brand retrieval
        userRepoMock.addingBrandContact.mockResolvedValue(BrandContactAddingReponseData); // Mock successful contact addition

        // Act: Call the addingBrandContact method
        const response = await useCase.addingBrandContact(mockBrandContactData, 2); // Logged user ID = 1

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.OK,
            BrandContact: BrandContactAddingReponseData,
            message: "Brand contact added successfully"
        });
        expect(userRepoMock.addingBrandContact).toHaveBeenCalledWith(mockBrandContactData); // Verify repository call
    });

    it('should return 404 error if brand is not found', async () => {
        // Arrange: Create mock data for a non-existing brand
        const mockData={...mockBrandContactData}
        mockData.brandId=99

        userRepoMock.getBrandDetail.mockResolvedValue(null); // Mock brand not found

        // Act: Call the addingBrandContact method
        const response = await useCase.addingBrandContact(mockData, 1); // Logged user ID = 1

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "Brand not found"
        });
        expect(userRepoMock.getBrandDetail).toHaveBeenCalledWith(mockData.brandId); // Verify repository call
    });

    it('should return 403 error if logged user is not the brand owner', async () => {

        userRepoMock.getBrandDetail.mockResolvedValue(BrandCreateReponseData); // Mock brand retrieval

        // Act: Call the addingBrandContact method
        const response = await useCase.addingBrandContact(mockBrandContactData, 1); // Logged user ID = 1

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.Forbidden,
            message: "You do not have permission to add contacts for this brand"
        });
    });

    it('should return 500 error if there is an unexpected error', async () => {
        // Arrange: Create mock data for adding brand contact
            const mockBrandContactData: BrandContactData = {
                brandId: 1,
                contactPersonName: "John Doe",
                contactPersonEmail: "johndoe@example.com",
                contactPersonPhone: "1234567890"
            }

        // Mock an unexpected error during the process
        userRepoMock.getBrandDetail.mockRejectedValue(new Error("Unexpected error"));

        // Act: Call the addingBrandContact method
        const response = await useCase.addingBrandContact(mockBrandContactData, 1);

        // Assert: Check the response
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when adding brand contact"
        });
    });
});




describe('User API - updateBrandContact', () => {
    const userRepoMock = userRepo as jest.Mocked<typeof userRepo>; // Mock the user repository

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

   

    it('should return not found if the brand does not exist', async () => {
     
        const loggedUserId = 6;

        userRepoMock.getBrandDetail.mockResolvedValue(null); // Simulate brand not found

        // Act
        const response = await useCase.updateBrandContact(mockBrandContactData, loggedUserId);

        // Assert
        expect(response).toEqual({
            status: StatusCode.NotFound,
            message: "Brand not found",
        });
    });

    it('should return internal server error on unexpected error', async () => {
        // Arrange
        const brandContactData: BrandContactData = {
            id: 1,
            brandId: 1,
            contactPersonName: "John Doe",
            contactPersonPhone: "123-456-7890",
            contactPersonEmail: "john@example.com",
        };
        const loggedUserId = 1;

        userRepoMock.getBrandDetail.mockImplementation(() => {
            throw new Error("Unexpected error"); // Simulate an unexpected error
        });

        // Act
        const response = await useCase.updateBrandContact(brandContactData, loggedUserId);

        // Assert
        expect(response).toEqual({
            status: StatusCode.InternalServerError,
            message: "Error when updating brand contact",
        });
    });
});




// describe('addBrandOwnership', () => {
//     const brandOwnershipData: BrandOwnershipData = {
//         brandId: 2,
//         boUserId: 2
//     };
    
//     const loggedUserId = 2; // assuming logged user has ID 1
//     const userRepoMock = userRepo as jest.Mocked<typeof userRepo>; // Mock the user repository

//     beforeEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     it('should return NotFound if the brand does not exist', async () => {
//         userRepoMock.findBrandByID.mockResolvedValue(null); // Simulate brand not found

//         const result = await useCase.addBrandOwnership(brandOwnershipData, loggedUserId);

//         expect(result).toEqual({
//             status: StatusCode.NotFound,
//             message: `There is no BO user with this user id: ${brandOwnershipData.boUserId}`,
//         });
//         expect(userRepoMock.findBrandByID).toHaveBeenCalledWith(brandOwnershipData.brandId);
//     });

//     it('should return NotFound if the user does not exist', async () => {
//         userRepoMock.findBrandByID.mockResolvedValue(BrandCreateReponseData); // Brand exists
//         userRepoMock.findUserById.mockResolvedValue(null); // User does not exist

//         const result = await useCase.addBrandOwnership(brandOwnershipData, loggedUserId);

//         expect(result).toEqual({
//             status: StatusCode.NotFound,
//             message: 'user not found',
//         });
//         expect(userRepoMock.findUserById).toHaveBeenCalledWith(brandOwnershipData.boUserId);
//     });

//     it('should return NotFound if the user does not have BO role', async () => {
//         userRepoMock.findBrandByID.mockResolvedValue(BrandCreateReponseData); // Brand exists
//         userRepoMock.findUserById.mockResolvedValue(mockUserCreateResponseData); // User exists but no BO role

//         const result = await useCase.addBrandOwnership(brandOwnershipData, loggedUserId);

//         expect(result).toEqual({
//             status: StatusCode.NotFound,
//             message: `There is no BO user with this user id: ${brandOwnershipData.brandId}`,
//         });
//         expect(userRepoMock.findUserById).toHaveBeenCalledWith(brandOwnershipData.boUserId);
//     });

//     it('should return NotFound if logged user is not the TO of the BO user', async () => {
//         userRepoMock.findBrandByID.mockResolvedValue(BrandCreateReponseData); // Brand exists
//         userRepoMock.findUserById.mockResolvedValue(mockUserCreateResponseData); // User exists with BO role
//         userRepoMock.getHierarchyTO.mockResolvedValue(hierarchyTo); // Logged user is not TO of the BO user

//         const result = await useCase.addBrandOwnership(brandOwnershipData, 2);

//         expect(result).toEqual({
//             status: StatusCode.NotFound,
//             message: 'you have no permission to add this BO to brand because your not teamOwner of the this BO user',
//         });
//         expect(userRepoMock.getHierarchyTO).toHaveBeenCalledWith(brandOwnershipData.boUserId);
//     });

//     it('should return BadRequest if the brand ownership already exists', async () => {
//         userRepoMock.findBrandByID.mockResolvedValue(BrandCreateReponseData); // Brand exists
//         userRepoMock.findUserById.mockResolvedValue(mockUserCreateResponseData); // User exists with BO role
//         userRepoMock.getHierarchyTO.mockResolvedValue(hierarchyTo); // Logged user is the TO
//         userRepoMock.getBrandOwnerShip.mockResolvedValue(BrandOwnershipCreateReponse); // Brand ownership already exists\\\

        
//         const result = await useCase.addBrandOwnership(brandOwnershipData, loggedUserId);

//         expect(result).toEqual({
//             status: StatusCode.BadRequest,
//             message: 'Brand ownership already exist',
//         });
//         expect(userRepoMock.getBrandOwnerShip).toHaveBeenCalledWith(brandOwnershipData);
//     });

//     it('should return OK if brand ownership is added successfully', async () => {
//         const mockUserData={...mockUserCreateResponseData}
//         mockUserData.roles=[RoleName.BO]
//         userRepoMock.findBrandByID.mockResolvedValue(BrandCreateReponseData); // Brand exists
//         userRepoMock.findUserById.mockResolvedValue(mockUserData); // User exists with BO role
//         userRepoMock.getHierarchyTO.mockResolvedValue(hierarchyTo); // Logged user is the TO
//         userRepoMock.getBrandOwnerShip.mockResolvedValue(null); // No existing ownership
//         userRepoMock.addBrandOwnership.mockResolvedValue(BrandOwnershipCreateReponse); // Successfully added ownership

//         const result = await useCase.addBrandOwnership(brandOwnershipData, 2);

//         expect(result).toEqual({
//             status: StatusCode.OK,
//             BrandOwnership: mockUserData,
//             message: 'Brand ownership added successfully',
//         });
//         expect(userRepoMock.addBrandOwnership).toHaveBeenCalledWith(brandOwnershipData);
//     });

//     it('should return InternalServerError on unexpected error', async () => {
//         userRepoMock.findBrandByID.mockRejectedValue(new Error('Unexpected Error')); // Simulate error

//         const result = await useCase.addBrandOwnership(brandOwnershipData, loggedUserId);

//         expect(result).toEqual({
//             status: StatusCode.InternalServerError,
//             message: 'Error when adding brand ownership',
//         });
//         expect(userRepoMock.findBrandByID).toHaveBeenCalledWith(brandOwnershipData.brandId);
//     });
// });
