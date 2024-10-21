const swaggerOptions = {
  swagger: "2.0",
  info: {
    title: "Awesome Project Build with TypeORM API",
    version: "1.0.0",
    description:
      "API documentation for managing users, brands, and teams in the sales-oriented organization.",
  },
  host: "type-orm-production.up.railway.app",
  // host: "localhost:3001",
  basePath: "/api",
  schemes: ["https"],
  // schemes: ["http"],
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
                  example: "Rashid",
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
                  example: "rashid@gmail.com",
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
                teamId: {
                  type: "string",
                  example: null,
                },
                parentId: {
                  type: "integer",
                  example: 1,
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
                  example: ["BO", "TO"],
                },
                name: {
                  type: "string",
                  example: "Rashid",
                },
                email: {
                  type: "string",
                  example: "raashid@gmail.com",
                },
                parentId: {
                  type: "integer",
                  example: 1,
                },
                teamId: {
                  type: "integer",
                  example: null,
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
    "/getHierarchyTo/{id}": {
      get: {
        summary: "Get users under TO hierarchy by ID",
        description:
          "Retrieves a hierarchy of users under a TO role based on their ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "ID of the TO role user to fetch hierarchy",
          },
        ],
        responses: {
          "200": {
            description: "Users fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "integer",
                      example: 200,
                    },
                    user: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "integer",
                            example: 4,
                          },
                          name: {
                            type: "string",
                            example: "hakeem",
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
                            example: "hakeem@gmail.com",
                          },
                          password: {
                            type: "string",
                            example:
                              "$2a$10$AGjHmUL34iLln7SEnphPfOXaPoSo0vkSrQ0jTNyDj0PgDV2Zj0QuK",
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-10-08T05:56:36.000Z",
                          },
                          roles: {
                            type: "array",
                            items: {
                              type: "string",
                              example: "PO",
                            },
                          },
                          parentId: {
                            type: "integer",
                            example: 2,
                          },
                          teamId: {
                            type: "integer",
                            example: 1,
                          },
                        },
                      },
                    },
                    message: {
                      type: "string",
                      example: "all to fetched successfully",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "User not found",
          },
          "500": {
            description: "Error retrieving hierarchy",
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
                  example: "co-co-cola",
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
                  example: 1,
                },
                brandName: {
                  type: "string",
                  example: "pepsi",
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
    "/getBrand/{id}": {
      get: {
        summary: "Get brand by ID",
        description: "Retrieves a specific brand by its ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
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
                contactPersonName: {
                  type: "string",
                  example: "John Doe",
                },
                contactPersonEmail: {
                  type: "string",
                  example: "john.doe@example.com",
                },
                contactPersonPhone: {
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
                  example: "rashi@example.com",
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
    "/getBrandDetail/{id}": {
      get: {
        summary: "Get brand details",
        description: "Retrieves details of a specific brand by its ID.",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "integer",
            description: "ID of the brand to retrieve",
            example: 1,
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
                  example: "raashid@gmail.com",
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
    "/deleteUser/{id}": {
      delete: {
        summary: "Delete a user by ID",
        description:
          "Deletes a user based on their ID and adjusts child relationships as needed.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "ID of the user to delete",
          },
        ],
        responses: {
          "200": {
            description: "User deleted successfully",
          },
          "400": {
            description: "Cannot remove TO role",
          },
          "404": {
            description: "User not found",
          },
          "500": {
            description: "Error when deleting user",
          },
        },
      },
    },
    "/deleteBrand/{id}": {
      delete: {
        summary: "Delete a brand by ID",
        description: "Deletes a brand based on its ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "ID of the brand to delete",
          },
        ],
        responses: {
          "200": {
            description: "Brand deleted successfully",
          },
          "404": {
            description: "Brand not found",
          },
          "500": {
            description: "Error during brand deletion",
          },
        },
      },
    },
    "/createEvent": {
      post: {
        summary: "Create a new event",
        description:
          "Creates a new event with a name, date, location, and additional details.",
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
                  example: "Dabzee",
                },
                date: {
                  type: "string",
                  format: "date-time",
                  example: "2024-10-21T21:00:00",
                },
                location: {
                  type: "string",
                  example: "madiwala",
                },
                details: {
                  type: "string",
                  example: "dabzee is coming",
                },
              },
              required: ["name", "date", "location", "details"],
            },
          },
        ],
        responses: {
          201: {
            description: "Event created successfully",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Event created successfully",
                },
              },
            },
          },
          400: {
            description: "Invalid input data",
          },
          500: {
            description: "Error during event creation",
          },
        },
      },
    },
    "/getAllEvent": {
      get: {
        summary: "Retrieve all events",
        description: "Fetches a list of all events stored in the database.",
        produces: ["application/json"],
        responses: {
          200: {
            description: "List of events retrieved successfully",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    example: 1,
                    description: "Unique identifier for the event",
                  },
                  name: {
                    type: "string",
                    example: "Dabzee",
                    description: "Name of the event",
                  },
                  date: {
                    type: "string",
                    format: "date-time",
                    example: "2024-10-21T21:00:00",
                    description: "Date and time of the event",
                  },
                  location: {
                    type: "string",
                    example: "madiwala",
                    description: "Location of the event",
                  },
                  details: {
                    type: "string",
                    example: "dabzee is coming",
                    description: "Additional details about the event",
                  },
                },
              },
            },
          },
          404: {
            description: "No events found",
          },
          500: {
            description: "Error retrieving events",
          },
        },
      },
    },
    "/createInventory": {
      post: {
        summary: "Create a new inventory item",
        description:
          "Creates a new inventory item with a name, description, and quantity.",
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
                  example: "Disha",
                  description: "Name of the inventory item",
                },
                description: {
                  type: "string",
                  example: "its a sports club",
                  description: "Description of the inventory item",
                },
                quantity: {
                  type: "integer",
                  example: 7,
                  description: "Quantity of the inventory item",
                },
              },
              required: ["name", "description", "quantity"],
            },
          },
        ],
        responses: {
          201: {
            description: "Inventory item created successfully",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Inventory item created successfully",
                },
              },
            },
          },
          400: {
            description: "Invalid input data",
          },
          500: {
            description: "Error during inventory creation",
          },
        },
      },
    },
    "/getAllInventory": {
      get: {
        summary: "Retrieve all inventory items",
        description:
          "Fetches a list of all inventory items stored in the database.",
        produces: ["application/json"],
        responses: {
          200: {
            description: "List of inventory items retrieved successfully",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    example: 1,
                    description: "Unique identifier for the inventory item",
                  },
                  name: {
                    type: "string",
                    example: "Disha",
                    description: "Name of the inventory item",
                  },
                  description: {
                    type: "string",
                    example: "its a sports club",
                    description: "Description of the inventory item",
                  },
                  quantity: {
                    type: "integer",
                    example: 7,
                    description: "Quantity of the inventory item",
                  },
                },
              },
            },
          },
          404: {
            description: "No inventory items found",
          },
          500: {
            description: "Error retrieving inventory items",
          },
        },
      },
    },
    "/createTask": {
      post: {
        summary: "Create a new task",
        description:
          "Creates a new task with title, description, type, assignment, and due date.",
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
                title: {
                  type: "string",
                  example: "Evolution on clothing",
                  description: "Title of the task",
                },
                description: {
                  type: "string",
                  example: "Design",
                  description: "Description of the task",
                },
                type: {
                  type: "string",
                  example: "Brand",
                  description: "Type of the task",
                },
                assigned_to: {
                  type: "integer",
                  example: 4,
                  description:
                    "User ID of the person to whom the task is assigned",
                },
                created_by: {
                  type: "integer",
                  example: 4,
                  description: "User ID of the person creating the task",
                },
                due_date: {
                  type: "string",
                  format: "date-time",
                  example: "2024-10-17T06:53:08.910776Z",
                  description: "Due date for the task",
                },
                brand_id: {
                  type: "integer",
                  example: 1,
                  description: "ID of the brand associated with the task",
                },
              },
              required: [
                "title",
                "description",
                "type",
                "assigned_to",
                "created_by",
                "due_date",
                "brand_id",
              ],
            },
          },
        ],
        responses: {
          201: {
            description: "Task created successfully",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Task created successfully",
                },
              },
            },
          },
          400: {
            description: "Invalid input data",
          },
          500: {
            description: "Error during task creation",
          },
        },
      },
    },
    "/updateTask": {
      patch: {
        summary: "Update an existing task",
        description: "Updates the details of an existing task based on its ID.",
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
                  description: "ID of the task to update",
                },
                description: {
                  type: "string",
                  example: "HR",
                  description: "Updated description of the task",
                },
              },
              required: ["id"],
            },
          },
        ],
        responses: {
          200: {
            description: "Task updated successfully",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Task updated successfully",
                },
              },
            },
          },
          404: {
            description: "Task not found",
          },
          400: {
            description: "Invalid input data",
          },
          500: {
            description: "Error during task update",
          },
        },
      },
    },
    "/getAllTasks": {
      get: {
        summary: "Get all tasks",
        description:
          "Retrieves a list of all tasks, with optional filtering based on completion status and pagination.",
        produces: ["application/json"],
        parameters: [
          {
            name: "filter",
            in: "query",
            required: false,
            type: "string",
            example: "All tasks",
            description: "Filter for the tasks to be retrieved",
          },
          {
            name: "isCompleted",
            in: "query",
            required: false,
            type: "boolean",
            example: false,
            description: "Filter tasks based on their completion status",
          },
          {
            name: "page",
            in: "query",
            required: false,
            type: "integer",
            example: 1,
            description: "The page number for pagination (default is 1)",
          },
          {
            name: "pageSize",
            in: "query",
            required: false,
            type: "integer",
            example: 10,
            description:
              "The number of tasks to retrieve per page (default is 10)",
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved tasks",
            schema: {
              type: "object",
              properties: {
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1,
                        description: "ID of the task",
                      },
                      title: {
                        type: "string",
                        example: "Evolution on clothing",
                        description: "Title of the task",
                      },
                      description: {
                        type: "string",
                        example: "Design",
                        description: "Description of the task",
                      },
                      type: {
                        type: "string",
                        example: "Brand",
                        description: "Type of the task",
                      },
                      assigned_to: {
                        type: "integer",
                        example: 4,
                        description:
                          "User ID of the person assigned to the task",
                      },
                      created_by: {
                        type: "integer",
                        example: 4,
                        description:
                          "User ID of the person who created the task",
                      },
                      due_date: {
                        type: "string",
                        format: "date-time",
                        example: "2024-10-17T06:53:08.910776Z",
                        description: "Due date for the task",
                      },
                      brand_id: {
                        type: "integer",
                        example: 1,
                        description: "ID of the brand associated with the task",
                      },
                      isCompleted: {
                        type: "boolean",
                        example: false,
                        description: "Indicates if the task is completed",
                      },
                    },
                  },
                },
                totalTasks: {
                  type: "integer",
                  example: 100,
                  description: "Total number of tasks available",
                },
              },
            },
          },
          "404": {
            description: "No tasks found",
          },
          "500": {
            description: "Error during retrieval of tasks",
          },
        },
      },
    },
    "/getTask/{id}": {
      get: {
        summary: "Get a task by ID",
        description: "Retrieves a specific task based on its ID.",
        produces: ["application/json"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "integer",
            description: "ID of the task to retrieve",
            example: 2,
          },
        ],
        responses: {
          200: {
            description: "Successfully retrieved the task",
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  example: 2,
                  description: "ID of the task",
                },
                title: {
                  type: "string",
                  example: "Evolution on clothing",
                  description: "Title of the task",
                },
                description: {
                  type: "string",
                  example: "Design",
                  description: "Description of the task",
                },
                type: {
                  type: "string",
                  example: "Brand",
                  description: "Type of the task",
                },
                assigned_to: {
                  type: "integer",
                  example: 4,
                  description: "User ID of the person assigned to the task",
                },
                created_by: {
                  type: "integer",
                  example: 4,
                  description: "User ID of the person who created the task",
                },
                due_date: {
                  type: "string",
                  format: "date-time",
                  example: "2024-10-17T06:53:08.910776Z",
                  description: "Due date for the task",
                },
                brand_id: {
                  type: "integer",
                  example: 1,
                  description: "ID of the brand associated with the task",
                },
                isCompleted: {
                  type: "boolean",
                  example: false,
                  description: "Indicates if the task is completed",
                },
              },
            },
          },
          404: {
            description: "Task not found",
          },
          500: {
            description: "Error during retrieval of the task",
          },
        },
      },
    },
    "/getNotification/{id}": {
      get: {
        summary: "Get a notification by ID",
        description: "Retrieves a specific notification based on its ID.",
        produces: ["application/json"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "integer",
            description: "ID of the notification to retrieve",
            example: 3,
          },
        ],
        responses: {
          200: {
            description: "Successfully retrieved the notification",
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  example: 3,
                  description: "ID of the notification",
                },
                title: {
                  type: "string",
                  example: "New Event Created",
                  description: "Title of the notification",
                },
                message: {
                  type: "string",
                  example: "An event has been created successfully.",
                  description: "Message of the notification",
                },
                created_at: {
                  type: "string",
                  format: "date-time",
                  example: "2024-10-17T06:53:08.910776Z",
                  description:
                    "Date and time when the notification was created",
                },
                read: {
                  type: "boolean",
                  example: false,
                  description:
                    "Indicates whether the notification has been read",
                },
              },
            },
          },
          404: {
            description: "Notification not found",
          },
          500: {
            description: "Error during retrieval of the notification",
          },
        },
      },
    },
    "/getTaskHistory/{id}": {
      get: {
        summary: "Get task history by task ID",
        description:
          "Retrieves the history of a specific task based on its ID.",
        produces: ["application/json"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "integer",
            description: "ID of the task to retrieve its history",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Successfully retrieved the task history",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    example: 1,
                    description: "ID of the task history entry",
                  },
                  task_id: {
                    type: "integer",
                    example: 1,
                    description: "ID of the associated task",
                  },
                  status: {
                    type: "string",
                    example: "Completed",
                    description: "Current status of the task",
                  },
                  updated_at: {
                    type: "string",
                    format: "date-time",
                    example: "2024-10-17T06:53:08.910776Z",
                    description:
                      "Date and time when the task status was last updated",
                  },
                  updated_by: {
                    type: "integer",
                    example: 4,
                    description: "ID of the user who updated the task",
                  },
                },
              },
            },
          },
          404: {
            description: "Task not found",
          },
          500: {
            description: "Error during retrieval of task history",
          },
        },
      },
    },
    "/filterTask": {
      post: {
        summary: "Filter tasks",
        description:
          "Filters tasks based on specified criteria such as type, assignment, due date, brand name, and status.",
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
                type: {
                  type: "string",
                  example: "Brand",
                  description: "Filter by task type",
                },
                assignedBy: {
                  type: "integer",
                  example: 4,
                  description: "Filter by the user who created the task",
                },
                assignedTo: {
                  type: "integer",
                  example: 4,
                  description: "Filter by the user assigned to the task",
                },
                teamOwner: {
                  type: "integer",
                  example: 2,
                  description: "Filter by the team owner (optional)",
                },
                dueDatePassed: {
                  type: "boolean",
                  example: false,
                  description: "Filter by whether the due date has passed",
                },
                brandName: {
                  type: "string",
                  example: "Adidas",
                  description: "Filter by brand name",
                },
                inventoryName: {
                  type: "string",
                  example: null,
                  description: "Filter by inventory name (if any)",
                },
                eventName: {
                  type: "string",
                  example: null,
                  description: "Filter by event name (if any)",
                },
                sortBy: {
                  type: "string",
                  example: "createdAt",
                  description: "Sort by specified field (e.g., createdAt)",
                },
                status: {
                  type: "string",
                  example: "Completed",
                  description: "Filter by task status",
                },
                sortOrder: {
                  type: "string",
                  enum: ["ASC", "DESC"],
                  example: "ASC",
                  description: "Sort order (ascending or descending)",
                },
              },
              required: [
                "type",
                "assignedBy",
                "assignedTo",
                "sortBy",
                "status",
                "sortOrder",
              ],
            },
          },
        ],
        responses: {
          200: {
            description: "Successfully retrieved filtered tasks",
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    example: 1,
                    description: "ID of the task",
                  },
                  title: {
                    type: "string",
                    example: "Evolution on clothing",
                    description: "Title of the task",
                  },
                  description: {
                    type: "string",
                    example: "Design",
                    description: "Description of the task",
                  },
                  type: {
                    type: "string",
                    example: "Brand",
                    description: "Type of the task",
                  },
                  assigned_to: {
                    type: "integer",
                    example: 4,
                    description: "User assigned to the task",
                  },
                  created_by: {
                    type: "integer",
                    example: 4,
                    description: "User who created the task",
                  },
                  due_date: {
                    type: "string",
                    format: "date-time",
                    example: "2024-10-17T06:53:08.910776Z",
                    description: "Due date of the task",
                  },
                  status: {
                    type: "string",
                    example: "Completed",
                    description: "Status of the task",
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid filter parameters",
          },
          500: {
            description: "Error during task filtering",
          },
        },
      },
    },
    "/getAnalytics": {
      post: {
        summary: "Get analytics data",
        description: "Retrieves analytics data based on the specified filter.",
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
                filter: {
                  type: "string",
                  example: "Last 3 Days",
                  description: "Time period for which analytics are requested",
                },
              },
              required: ["filter"],
            },
          },
        ],
        responses: {
          200: {
            description: "Analytics data retrieved successfully",
            schema: {
              type: "object",
              properties: {
                totalTasks: {
                  type: "integer",
                  example: 100,
                  description:
                    "Total number of tasks within the specified filter",
                },
                completedTasks: {
                  type: "integer",
                  example: 75,
                  description:
                    "Total number of completed tasks within the specified filter",
                },
                pendingTasks: {
                  type: "integer",
                  example: 25,
                  description:
                    "Total number of pending tasks within the specified filter",
                },
                taskBreakdown: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      taskType: {
                        type: "string",
                        example: "Brand",
                        description: "Type of the task",
                      },
                      count: {
                        type: "integer",
                        example: 40,
                        description: "Number of tasks of this type",
                      },
                    },
                  },
                  description: "Breakdown of tasks by type",
                },
              },
            },
          },
          400: {
            description: "Invalid filter value",
          },
          500: {
            description: "Error during analytics retrieval",
          },
        },
      },
    },
    "/deleteTask/{id}": {
      delete: {
        summary: "Delete a task by ID",
        description: "Deletes a task based on its ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "integer",
            description: "ID of the task to delete",
          },
        ],
        responses: {
          200: {
            description: "Task deleted successfully",
          },
          404: {
            description: "Task not found",
          },
          500: {
            description: "Error during task deletion",
          },
        },
      },
    },

    "/addComment": {
      post: {
        summary: "Add a comment to a task with image uploads",
        description:
          "Allows a user to add a comment to a task, including uploading two image files. Token verification is required.",
        consumes: ["multipart/form-data"],
        produces: ["application/json"],
        parameters: [
          {
            name: "Authorization",
            in: "header",
            description: "Bearer token for user authentication",
            required: true,
            type: "string",
          },
          {
            name: "taskId",
            in: "formData",
            description: "ID of the task to which the comment is added",
            required: true,
            type: "integer",
          },
          {
            name: "comment",
            in: "formData",
            description: "Text content of the comment",
            required: true,
            type: "string",
          },
          {
            name: "files",
            in: "formData",
            description:
              "Array of image files to be uploaded (2 files expected)",
            required: true,
            type: "array",
            items: {
              type: "file",
            },
          },
        ],
        responses: {
          "200": {
            description: "Comment added successfully",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Comment added successfully",
                },
                data: {
                  type: "object",
                  properties: {
                    comment: {
                      type: "string",
                      example: "This is a sample comment",
                    },
                    filePaths: {
                      type: "array",
                      items: {
                        type: "string",
                        example: "uploads/image1.png",
                      },
                    },
                    fileTypes: {
                      type: "array",
                      items: {
                        type: "string",
                        example: "image/png",
                      },
                    },
                    taskId: {
                      type: "integer",
                      example: 123,
                    },
                    userId: {
                      type: "integer",
                      example: 1,
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Bad request (e.g., missing fields, invalid file types)",
          },
          "401": {
            description: "Unauthorized (invalid or missing token)",
          },
          "500": {
            description: "Internal server error during comment creation",
          },
        },
      },
    },
    "/getComment/{id}": {
      get: {
        summary: "Fetch comments for a specific task",
        description:
          "Allows a user to fetch comments for a specified task with pagination support. Token verification is required.",
        produces: ["application/json"],
        parameters: [
          {
            name: "Authorization",
            in: "header",
            description: "Bearer token for user authentication",
            required: true,
            type: "string",
          },
          {
            name: "id",
            in: "path",
            description: "ID of the task for which comments are fetched",
            required: true,
            type: "integer",
          },
          {
            name: "page",
            in: "query",
            description: "The page number for pagination (default is 1)",
            required: false,
            type: "integer",
            example: 1,
          },
          {
            name: "pageSize",
            in: "query",
            description:
              "The number of comments to fetch per page (default is 10)",
            required: false,
            type: "integer",
            example: 10,
          },
        ],
        responses: {
          "200": {
            description: "Comments fetched successfully",
            schema: {
              type: "object",
              properties: {
                status: {
                  type: "integer",
                  example: 200,
                },
                message: {
                  type: "string",
                  example: "Comments fetched successfully",
                },
                TaskComment: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 6,
                      },
                      comment: {
                        type: "string",
                        example: "you want more pace",
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2024-10-21T09:17:17.393Z",
                      },
                      filePaths: {
                        type: "array",
                        items: {
                          type: "string",
                          example: "uploads/1729502237378-Adhaar.jpg",
                        },
                      },
                      taskId: {
                        type: "integer",
                        example: 2,
                      },
                      userId: {
                        type: "integer",
                        example: 1,
                      },
                    },
                  },
                },
                totalTasks: {
                  type: "integer",
                  example: 4,
                },
              },
            },
          },
          "400": {
            description: "Bad request (e.g., missing fields, invalid task ID)",
          },
          "401": {
            description: "Unauthorized (invalid or missing token)",
          },
          "500": {
            description: "Internal server error during fetching comments",
          },
        },
      },
    },
    "/deleteComment/{id}": {
      delete: {
        summary: "Delete a comment by ID",
        description:
          "Allows a user to delete a specific comment based on its ID. Token verification is required.",
        produces: ["application/json"],
        parameters: [
          {
            name: "Authorization",
            in: "header",
            description: "Bearer token for user authentication",
            required: true,
            type: "string",
          },
          {
            name: "id",
            in: "path",
            description: "ID of the comment to be deleted",
            required: true,
            type: "integer",
          },
        ],
        responses: {
          "201": {
            description: "Comment deleted successfully",
            schema: {
              type: "object",
              properties: {
                status: {
                  type: "integer",
                  example: 201,
                },
                message: {
                  type: "string",
                  example: "Comment deleted successfully",
                },
              },
            },
          },
          "400": {
            description:
              "Bad request (e.g., missing fields, invalid comment ID)",
          },
          "401": {
            description: "Unauthorized (invalid or missing token)",
          },
          "404": {
            description: "Not found (comment ID does not exist)",
          },
          "500": {
            description: "Internal server error during comment deletion",
          },
        },
      },
    },
    "/updateComment": {
      put: {
        summary: "Update a comment",
        description:
          "Allows a user to update an existing comment, including uploading multiple files. Token verification is required.",
        consumes: ["multipart/form-data"],
        produces: ["application/json"],
        parameters: [
          {
            name: "Authorization",
            in: "header",
            description: "Bearer token for user authentication",
            required: true,
            type: "string",
          },
          {
            name: "id",
            in: "formData",
            description: "ID of the comment to be updated",
            required: true,
            type: "integer",
          },
          {
            name: "taskId",
            in: "formData",
            description: "ID of the task associated with the comment",
            required: true,
            type: "integer",
          },
          {
            name: "comment",
            in: "formData",
            description: "Updated text content of the comment",
            required: true,
            type: "string",
          },
          {
            name: "files",
            in: "formData",
            description: "Upload multiple files associated with the comment",
            required: false,
            type: "file",
            collectionFormat: "multi",
          },
        ],
        responses: {
          "200": {
            description: "Comment updated successfully",
            schema: {
              type: "object",
              properties: {
                status: {
                  type: "integer",
                  example: 200,
                },
                message: {
                  type: "string",
                  example: "Comment updated successfully",
                },
                updatedComment: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer",
                      example: 1,
                    },
                    comment: {
                      type: "string",
                      example: "you didn't want more pace",
                    },
                    taskId: {
                      type: "integer",
                      example: 1,
                    },
                    filePaths: {
                      type: "array",
                      items: {
                        type: "string",
                        example: "uploads/file1.png",
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Bad request (e.g., missing fields, invalid comment ID)",
          },
          "401": {
            description: "Unauthorized (invalid or missing token)",
          },
          "404": {
            description: "Not found (comment ID does not exist)",
          },
          "500": {
            description: "Internal server error during comment update",
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
