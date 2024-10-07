// import useCase from '../src/app/useCase/useCase'; // Adjust the import according to your file structure
// import userRepo from '../src/app/repository/UserRepo'; // Adjust accordingly
// import { GetAllUser, Department, RoleName, UserData, BrandData, BrandContactData, BrandOwnershipData } from '../src/interfaces/interface'; // Adjust accordingly
// import { StatusCode } from '../src/interfaces/enum';
// import { User } from '../src/entity/User';
// import { Team } from '../src/entity/Team';
// import bcrypt from 'bcryptjs';
// import { Brand } from '../src/entity/Brand';
// import { BrandContact } from '../src/entity/BrandContact';

// const mockBrandData: Brand = {
//     id: 1, // Auto-incrementing ID for the brand
//     brandName: "AdisDas", // Name of the brand
//     revenue: 890000, // Revenue of the brand
//     dealClosedValue: 9839489, // Total value of closed deals for the brand
//     createdAt: new Date(), // Current timestamp for creation date
//     contacts: [], // Empty array for brand contacts (can be filled with mock data if needed)
//     brandOwnerships: [], // Empty array for brand ownerships (can be filled with mock data if needed)
// };
// const brandData: BrandData = {
//     brandName: "AdisDas", // The name of the brand
//     revenue: 890000, // The revenue associated with the brand
//     dealClosedValue: 9839489, // Total value of closed deals for the brand
//     id: 0 // Assuming this is for a new brand (ID will be auto-generated)
// };

// const mockUser: User = {
//     id: 2,
//     name: "Bob Brown",
//     department: "Sales",
//     phoneNumber: "444-555-6666",
//     email: "bob.brown@example.com",
//     password: "securePasswordB!",
//     createdAt: new Date(),
//     roles: [RoleName.BO],
//     parentId: 1,
//     teamId: 1,
//     children: [],
//     parent: new User, // or provide a mock User if needed
//     brandOwnerships: [], // Assuming it's an array
//     team: new Team, // or provide a mock Team object if needed
//     userTeams: [], // Assuming it's an array
// }

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
//         const response = await useCase.addBrandOwnership(brandOwnershipData);

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
//         const response = await useCase.addBrandOwnership(brandOwnershipData);

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
//         const response = await useCase.addBrandOwnership(brandOwnershipData);

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
//         const response = await useCase.addBrandOwnership(brandOwnershipData);

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
//         const response = await useCase.addBrandOwnership(brandOwnershipData);

//         // Assert
//         expect(response).toEqual({
//             status: StatusCode.InternalServerError,
//             message: 'Error when adding brand ownership',
//         });
//     });
// });

