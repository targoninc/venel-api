export const swaggerOptions = {
    apis: [],
    definition: {
        info: {
            title: "Venel API",
            version: "1.0.0",
            description: "Venel is a chat application that allows users to chat with each other. It also allows cross instance messaging."
        },
        openapi: "3.1.0",
        paths: {
            "/api/auth/authorize": {
                post: {
                    summary: "Authorize User",
                    description: "Authorize a user with username and password",
                    operationId: "authorizeUser",
                    tags: [
                        "User Management"
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        username: {
                                            type: "string",
                                            description: "Username of the User",
                                            example: "myusername"
                                        },
                                        password: {
                                            type: "string",
                                            description: "Password for the User",
                                            example: "testpassword1234"
                                        }
                                    },
                                    required: [
                                        "username",
                                        "password"
                                    ]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "User successfully authorized",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            user: {
                                                "$ref": "#/components/schemas/User"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        default: {
                            description: "Error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/auth/register": {
                post: {
                    summary: "Register a new user",
                    tags: [
                        "User Management"
                    ],
                    description: "Register a user",
                    requestBody: {
                        description: "User's entity",
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: [
                                        "username",
                                        "password"
                                    ],
                                    properties: {
                                        username: {
                                            type: "string",
                                            minLength: 3,
                                            maxLength: 255,
                                            default: "myusername"
                                        },
                                        password: {
                                            type: "string",
                                            format: "password",
                                            minLength: 16,
                                            maxLength: 64,
                                            default: "testpassword1234"
                                        }
                                    }
                                }
                            }
                        }
                    },
                }
            },
            "/api/auth/getUser": {
                get: {
                    summary: "Get the user object for the currently authenticated user",
                    tags: [
                        "User Management"
                    ],
                    description: "Get the user object",
                    responses: {
                        200: {
                            description: "The user object"
                        },
                        401: {
                            description: "Unauthorized"
                        }
                    },
                    security: [
                        {
                            cookieAuth: []
                        }
                    ]
                }
            },
            "/api/auth/updateUser": {
                post: {
                    summary: "Update user properties",
                    tags: [
                        "User Management"
                    ],
                    description: "Update a user",
                    requestBody: {
                        description: "Properties to update",
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        username: {
                                            type: "string",
                                            minLength: 3,
                                            maxLength: 255,
                                            default: "myusername",
                                            description: "The new username",
                                        },
                                        displayname: {
                                            type: "string",
                                            maxLength: 255,
                                            default: "My Username",
                                            description: "The new display name",
                                        },
                                        description: {
                                            type: "string",
                                            maxLength: 255,
                                            default: "I am a user",
                                            description: "The new description",
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                security: [
                    {
                        cookieAuth: []
                    }
                ]
            },
            "/api/auth/deleteUser": {
                delete: {
                    summary: "Delete a user",
                    tags: [
                        "User Management"
                    ],
                    description: "Delete a user",
                    requestBody: {
                        description: "User's entity",
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: [
                                        "id"
                                    ],
                                    properties: {
                                        userId: {
                                            type: "integer",
                                            description: "The ID of the user to delete"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "User deleted successfully"
                        },
                        401: {
                            description: "Unauthorized"
                        },
                        403: {
                            description: "You do not have permission to delete this user"
                        }
                    },
                    security: [
                        {
                            cookieAuth: []
                        }
                    ]
                }
            },
            "/api/auth/roles": {
                get: {
                    summary: "Get a list of roles",
                    tags: [
                        "Permission Management"
                    ],
                    description: "Get all roles",
                    responses: {
                        200: {
                            description: "All roles",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            roles: {
                                                type: "array",
                                                items: {
                                                    type: "object"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/auth/createRole": {
                post: {
                    summary: "Create a new empty role",
                    tags: [
                        "Permission Management"
                    ],
                    description: "Creates a new role in the system",
                    produces: [
                        "application/json"
                    ],
                    requestBody: {
                        description: "Role's entity",
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: [
                                        "name",
                                        "description"
                                    ],
                                    properties: {
                                        name: {
                                            type: "string"
                                        },
                                        description: {
                                            type: "string"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Role created successfully",
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string"
                                    }
                                }
                            }
                        },
                        403: {
                            description: "You do not have permission to create a role",
                            schema: {
                                type: "object",
                                properties: {
                                    error: {
                                        type: "string"
                                    }
                                }
                            }
                        },
                        400: {
                            description: "Name is required",
                            schema: {
                                type: "object",
                                properties: {
                                    error: {
                                        type: "string"
                                    }
                                }
                            }
                        }
                    },
                    security: [
                        {
                            cookieAuth: []
                        }
                    ]
                }
            },
            "/api/auth/addPermissionToRole": {
                post: {
                    summary: "Grants a permission to a role and thus implicitly to all users with that role",
                    tags: [
                        "Permission Management"
                    ],
                    description: "Grants a permission to a role",
                    requestBody: {
                        description: "Role's entity",
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: [
                                        "roleId",
                                        "permissionId"
                                    ],
                                    properties: {
                                        roleId: {
                                            type: "integer",
                                            description: "The ID of the role to add the permission to"
                                        },
                                        permissionId: {
                                            type: "integer",
                                            description: "The ID of the permission to add to the role"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Permission added to the role successfully"
                        },
                        400: {
                            description: "RoleId and permissionId are required"
                        },
                        403: {
                            description: "You do not have permission to add a permission to a role"
                        }
                    },
                    security: [
                        {
                            cookieAuth: []
                        }
                    ]
                }
            },
            "/api/auth/permissions": {
                get: {
                    summary: "Get all permissions",
                    tags: [
                        "Permission Management"
                    ],
                    parameters: [
                        {
                            name: "roleId",
                            in: "query",
                            description: "ID of the role to get permissions for",
                            required: true,
                            schema: {
                                type: "integer"
                            }
                        }
                    ],
                    description: "Get permissions of a role by its ID",
                    responses: {
                        200: {
                            description: "A list of permissions for the role",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            permissions: {
                                                type: "array",
                                                items: {
                                                    "$ref": "#/definitions/Permission"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: "roleId is required"
                        }
                    }
                }
            },
            "/api/auth/getUserRoles": {
                get: {
                    summary: "Get a list of all roles for a given user",
                    tags: [
                        "User Management"
                    ],
                    description: "Get all roles for a given user",
                    parameters: [
                        {
                            name: "userId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string",
                                default: 1,
                                description: "The id of the user"
                            }
                        }
                    ],
                    responses: {
                        200: {
                            description: "All roles for the user",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            roles: {
                                                type: "array",
                                                items: {
                                                    type: "object"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/auth/getUserPermissions": {
                get: {
                    summary: "Get a list of all permissions for a given user",
                    tags: [
                        "User Management"
                    ],
                    description: "Get all permissions for a given user",
                    parameters: [
                        {
                            name: "userId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string",
                                default: 1,
                                description: "The id of the user"
                            }
                        }
                    ],
                    responses: {
                        200: {
                            description: "All permissions for the user",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            permissions: {
                                                type: "array",
                                                items: {
                                                    type: "object"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    security: [
                        {
                            cookieAuth: []
                        }
                    ]
                }
            },
            "/api/auth/addRoleToUser": {
                post: {
                    summary: "Adds a role to a user",
                    tags: [
                        "Permission Management"
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        userId: {
                                            type: "number",
                                            description: "The user ID for whom a role should be added"
                                        },
                                        roleId: {
                                            type: "number",
                                            description: "The role ID to be added to the user"
                                        }
                                    },
                                    required: [
                                        "userId",
                                        "roleId"
                                    ]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Role added to user successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            message: {
                                                type: "string",
                                                example: "Role added to user successfully"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: "userId and roleId are required",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                example: "userId and roleId are required"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        403: {
                            description: "You do not have permission to add a role to a user",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                example: "You do not have permission to add a role to a user"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    security: [
                        {
                            cookieAuth: []
                        }
                    ]
                }
            },
            "/api/auth/removeRoleFromUser": {
                delete: {
                    summary: "Removes a role from a user",
                    tags: [
                        "Permission Management"
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        userId: {
                                            type: "number",
                                            description: "The user ID for whom a role should be removed"
                                        },
                                        roleId: {
                                            type: "number",
                                            description: "The role ID to be removed from the user"
                                        }
                                    },
                                    required: [
                                        "userId",
                                        "roleId"
                                    ]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Role removed from user successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            message: {
                                                type: "string",
                                                example: "Role removed from user successfully"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: "userId and roleId are required",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                example: "userId and roleId are required"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        403: {
                            description: "You do not have permission to remove a role from a user",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                example: "You do not have permission to remove a role from a user"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    security: [
                        {
                            cookieAuth: []
                        }
                    ]
                }
            },
            "/api/messaging/sendMessage": {
                post: {
                    summary: "Send a message to a channel",
                    tags: [
                        "Messaging"
                    ],
                    description: "Send a message to a channel",
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        channelId: {
                                            type: "integer",
                                            description: "The ID of the channel to send the message to"
                                        },
                                        text: {
                                            type: "string",
                                            description: "The text of the message"
                                        }
                                    },
                                    required: ["channelId", "text"]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Message sent successfully"
                        },
                        400: {
                            description: "Bad Request: Channel ID and/or text are required"
                        },
                        404: {
                            description: "Not Found: Channel not found"
                        }
                    }
                }
            },
            "/api/channels/createDirect": {
                post: {
                    summary: "Create a direct message channel",
                    tags: [
                        "Messaging"
                    ],
                    description: "Create a direct message channel",
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        targetUserId: {
                                            type: "integer",
                                            description: "The ID of the user to create the channel with"
                                        }
                                    },
                                    required: ["targetUserId"]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Channel created successfully",
                            content: {
                                'application/json': {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            channelId: {
                                                type: "integer",
                                                description: "The ID of the created channel"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: "Bad Request: Target User ID is required"
                        },
                        404: {
                            description: "Not Found: Target User not found"
                        }
                    }
                }
            }
        },
        components: {
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        archived: {type: "boolean"},
                        createdAt: {type: "string", format: "date-time"},
                        description: {type: "string"},
                        displayname: {type: "string"},
                        id: {type: "string"},
                        lastLoginIp: {type: "string"},
                        passwordHash: {type: "string"},
                        phoneNumber: {type: "string"},
                        registrationIp: {type: "string"},
                        updatedAt: {type: "string", format: "date-time"},
                        username: {type: "string"}
                    }
                }
            }
        }
    }
}