const swaggerOptions = {
  swagger: "2.0",
  info: {
    title: "Awesome Project Build with TypeORM API",
    version: "1.0.0",
    description:
      "API documentation for managing users, brands, and teams in the sales-oriented organization.",
  },
  host: "localhost:3001",
  basePath: "/api",
  schemes: ["http"],
  paths: {
    "/login": {
      post: {
        summary: "User login",
        description: "Logs in a user and returns a JWT token.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  example: "admin@gmail.com",
                },
                password: {
                  type: "string",
                  example: "admin@123",
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "Successfully logged in",
            schema: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                user: {
                  type: "object",
                  description: "User details",
                },
              },
            },
          },
          400: {
            description: "Invalid email or password",
          },
        },
      },
    },
    "/createUser": {
      post: {
        summary: "Create a new user",
        description: "Creates a new user in the system.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                department: {
                  type: "string",
                  example: "Development",
                },
                phoneNumber: {
                  type: "string",
                  example: "9867452323",
                },
                email: {
                  type: "string",
                  example: "rasddi@gmail.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                roles: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  example: ["TO"],
                },
                teamOwner: {
                  type: "string",
                  example: null,
                },
                parentId: {
                  type: "integer",
                  example: 3,
                },
              },
            },
          },
        ],
        responses: {
          201: {
            description: "User created successfully",
          },
          400: {
            description:
              "Bad request (e.g., email already exists, no roles provided)",
          },
        },
      },
    },
    "/updateUser": {
      put: {
        summary: "Update user information",
        description: "Updates an existing user's information.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  example: 2,
                },
                roles: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  example: ["BO"],
                },
                name: {
                  type: "string",
                  example: "Rashid",
                },
                email: {
                  type: "string",
                  example: "rsassdsmi@gmail.com",
                },
                parentId: {
                  type: "integer",
                  example: 1,
                },
                teamId: {
                  type: "integer",
                  example: 1,
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "User updated successfully",
          },
          400: {
            description: "Bad request",
          },
        },
      },
    },
    "/getAllUser": {
      get: {
        summary: "Get all users",
        description: "Retrieves a list of all users in the system.",
        responses: {
          200: {
            description: "A list of users",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                  },
                  name: {
                    type: "string",
                  },
                  email: {
                    type: "string",
                  },
                  department: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/getUser/{id}": {
      get: {
        summary: "Get user by ID",
        description: "Retrieves a specific user by their ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "integer",
            description: "User ID",
          },
        ],
        responses: {
          200: {
            description: "User details",
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                },
                name: {
                  type: "string",
                },
                email: {
                  type: "string",
                },
                department: {
                  type: "string",
                },
              },
            },
          },
          404: {
            description: "User not found",
          },
        },
      },
    },
    "/getAllTo": {
      get: {
        summary: "Get all team owners",
        description: "Retrieves a list of all team owners in the system.",
        responses: {
          200: {
            description: "A list of team owners",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                  },
                  name: {
                    type: "string",
                  },
                  email: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/getAllTeam": {
      get: {
        summary: "Get all teams",
        description: "Retrieves a list of all teams in the organization.",
        responses: {
          200: {
            description: "A list of teams",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                  },
                  name: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/createBrand": {
      post: {
        summary: "Create a new brand",
        description: "Creates a new brand entry.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                brandName: {
                  type: "string",
                  example: "AdisDas",
                },
                revenue: {
                  type: "number",
                  example: 890000,
                },
                dealClosedValue: {
                  type: "number",
                  example: 9839489,
                },
              },
            },
          },
        ],
        responses: {
          201: {
            description: "Brand created successfully",
          },
          400: {
            description: "Bad request",
          },
        },
      },
    },
    "/updateBrand": {
      put: {
        summary: "Update brand information",
        description: "Updates an existing brand entry.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  example: 2,
                },
                brandName: {
                  type: "string",
                  example: "AdisDas",
                },
                revenue: {
                  type: "number",
                  example: 890000,
                },
                dealClosedValue: {
                  type: "number",
                  example: 9839489,
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "Brand updated successfully",
          },
          400: {
            description: "Bad request",
          },
        },
      },
    },
    "/getAllBrand": {
      get: {
        summary: "Get all brands",
        description: "Retrieves a list of all brands in the system.",
        responses: {
          200: {
            description: "A list of brands",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                  },
                  brandName: {
                    type: "string",
                  },
                  revenue: {
                    type: "number",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/getBrand": {
      get: {
        summary: "Get brand by ID",
        description: "Retrieves a specific brand by its ID.",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            type: "integer",
            description: "Brand ID",
          },
        ],
        responses: {
          200: {
            description: "Brand details",
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                },
                brandName: {
                  type: "string",
                },
                revenue: {
                  type: "number",
                },
                dealClosedValue: {
                  type: "number",
                },
              },
            },
          },
          404: {
            description: "Brand not found",
          },
        },
      },
    },
    "/addBrandContact": {
      post: {
        summary: "Add a new brand contact",
        description: "Adds a contact for a specific brand.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                brandId: {
                  type: "integer",
                  example: 1,
                },
                contactName: {
                  type: "string",
                  example: "John Doe",
                },
                email: {
                  type: "string",
                  example: "john.doe@example.com",
                },
                phone: {
                  type: "string",
                  example: "1234567890",
                },
              },
            },
          },
        ],
        responses: {
          201: {
            description: "Brand contact added successfully",
          },
          400: {
            description: "Bad request",
          },
        },
      },
    },
    "/updateBrandContact": {
      put: {
        summary: "Update brand contact information",
        description: "Updates an existing brand contact.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  example: 1,
                },
                contactName: {
                  type: "string",
                  example: "John Doe",
                },
                email: {
                  type: "string",
                  example: "john.doe@example.com",
                },
                phone: {
                  type: "string",
                  example: "1234567890",
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "Brand contact updated successfully",
          },
          400: {
            description: "Bad request",
          },
        },
      },
    },
    "/getBrandDetail": {
      post: {
        summary: "Get brand details",
        description: "Retrieves details of a specific brand by its ID.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  example: 1,
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "Brand details retrieved successfully",
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                },
                name: {
                  type: "string",
                },
                // Add other brand properties as needed
              },
            },
          },
          404: {
            description: "Brand not found",
          },
        },
      },
    },
    "/addBrandOwnership": {
      post: {
        summary: "Add brand ownership",
        description: "Associates a BO user with a specific brand.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                boUserId: {
                  type: "integer",
                  example: 2,
                },
                brandId: {
                  type: "integer",
                  example: 1,
                },
              },
            },
          },
        ],
        responses: {
          201: {
            description: "Brand ownership added successfully",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Brand ownership added successfully",
                },
              },
            },
          },
          400: {
            description: "Invalid input data",
          },
        },
      },
    },
    "/searchUser": {
      post: {
        summary: "Search for a user by email",
        description: "Finds a user based on their email address.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  example: "rsasmi@gmail.com",
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "User found successfully",
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                },
                name: {
                  type: "string",
                },
                email: {
                  type: "string",
                },
                // Add other user properties as needed
              },
            },
          },
          404: {
            description: "User not found",
          },
        },
      },
    },
  },
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Please enter a valid token",
    },
  },
  security: [{ Bearer: [] }],
};

export default swaggerOptions;
