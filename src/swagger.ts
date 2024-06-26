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
            "/api/auth/logout": {
                post: {
                    summary: "Logout a user",
                    tags: [
                        "User Management"
                    ],
                    description: "Logout a user",
                    responses: {
                        200: {
                            description: "User logged out successfully"
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
                                            example: "myusername"
                                        },
                                        password: {
                                            type: "string",
                                            format: "password",
                                            minLength: 16,
                                            maxLength: 64,
                                            example: "testpassword1234"
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
            "/api/auth/getUsers": {
                get: {
                    summary: "Get a list of all users",
                    tags: [
                        "User Management"
                    ],
                    description: "Get all users",
                    responses: {
                        200: {
                            description: "All users",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            users: {
                                                type: "array",
                                                items: {
                                                    "$ref": "#/components/schemas/User"
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
            "/api/auth/changePassword": {
                patch: {
                    summary: "Change the password of the current user",
                    tags: [
                        "User Management"
                    ],
                    description: "Change the password of the current user",
                    requestBody: {
                        description: "The new password",
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: [
                                        "oldPassword",
                                        "newPassword"
                                    ],
                                    properties: {
                                        oldPassword: {
                                            type: "string",
                                            format: "password",
                                            minLength: 16,
                                            maxLength: 64,
                                            example: "testpassword1234",
                                            description: "The old password"
                                        },
                                        newPassword: {
                                            type: "string",
                                            format: "password",
                                            minLength: 16,
                                            maxLength: 64,
                                            example: "testpassword1234",
                                            description: "The new password"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Password changed successfully"
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
                patch: {
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
                                            example: "myusername",
                                            description: "The new username",
                                        },
                                        displayname: {
                                            type: "string",
                                            maxLength: 255,
                                            example: "My Username",
                                            description: "The new display name",
                                        },
                                        description: {
                                            type: "string",
                                            maxLength: 255,
                                            example: "I am a user",
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
            "/api/auth/updateAvatar": {
                post: {
                    summary: "Update the user's avatar",
                    tags: [
                        "User Management"
                    ],
                    description: "Update the user's avatar",
                    requestBody: {
                        description: "The new avatar",
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        avatar: {
                                            type: "string",
                                            description: "The new avatar as a blob"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Avatar updated successfully"
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
            "/api/auth/updateSetting": {
                patch: {
                    summary: "Update a user's setting",
                    tags: [
                        "User Management"
                    ],
                    description: "Update a user's setting",
                    requestBody: {
                        description: "Setting's entity",
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: [
                                        "setting",
                                        "value"
                                    ],
                                    properties: {
                                        setting: {
                                            type: "string",
                                            description: "The setting to update"
                                        },
                                        value: {
                                            type: "string",
                                            description: "The new value for the setting"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Setting updated successfully"
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
                                example: 1,
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
                                example: 1,
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
            "/api/reactions/getAvailableReactions": {
                get: {
                    summary: "Get available reactions",
                    tags: [
                        "Messaging"
                    ],
                    description: "Get available reactions",
                    responses: {
                        200: {
                            description: "Reactions retrieved successfully",
                            content: {
                                'application/json': {
                                    schema: {
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
            "/api/reactions/getReactionGroups": {
                get: {
                    summary: "Get reaction groups",
                    tags: [
                        "Messaging"
                    ],
                    description: "Get reaction groups",
                    responses: {
                        200: {
                            description: "Reaction groups retrieved successfully",
                            content: {
                                'application/json': {
                                    schema: {
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
            "/api/messaging/sendMessage": {
                post: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
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
            "/api/messaging/deleteMessage": {
                delete: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Delete a message",
                    tags: [
                        "Messaging"
                    ],
                    description: "Delete a message",
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        messageId: {
                                            type: "integer",
                                            description: "The ID of the message to delete"
                                        }
                                    },
                                    required: ["messageId"]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Message deleted successfully"
                        },
                        400: {
                            description: "Bad Request: Message ID is required"
                        },
                        404: {
                            description: "Not Found: Message not found"
                        }
                    }
                }
            },
            "/api/messaging/editMessage": {
                patch: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Edit a message",
                    tags: [
                        "Messaging"
                    ],
                    description: "Edit a message",
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        messageId: {
                                            type: "integer",
                                            description: "The ID of the message to edit"
                                        },
                                        text: {
                                            type: "string",
                                            description: "The new text of the message"
                                        }
                                    },
                                    required: ["messageId", "text"]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Message edited successfully"
                        },
                        400: {
                            description: "Bad Request: Message ID and/or text are required"
                        },
                        404: {
                            description: "Not Found: Message not found"
                        }
                    }
                }
            },
            "/api/channels/createDirect": {
                post: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
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
            },
            "/api/channels/getMessages": {
                get: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Get messages for a channel",
                    tags: [
                        "Messaging"
                    ],
                    description: "Get messages for a channel",
                    parameters: [
                        {
                            name: "channelId",
                            in: "query",
                            description: "The ID of the channel to get messages for",
                            required: true,
                            schema: {
                                type: "integer"
                            }
                        },
                        {
                            name: "offset",
                            in: "query",
                            description: "The offset to start from",
                            schema: {
                                type: "integer"
                            }
                        }
                    ],
                    responses: {
                        200: {
                            description: "Messages retrieved successfully",
                            content: {
                                'application/json': {
                                    schema: {
                                        type: "array",
                                        items: {
                                            type: "object"
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: "Bad Request: Channel ID is required"
                        }
                    }
                }
            },
            "/api/channels/getChannels": {
                get: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Get channels for a user",
                    tags: [
                        "Messaging"
                    ],
                    description: "Get channels for a user",
                    responses: {
                        200: {
                            description: "Channels retrieved successfully",
                            content: {
                                'application/json': {
                                    schema: {
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
            "/api/auth/getConnectionSid": {
                get: {
                    summary: "Get the connection SID of the current user",
                    tags: [
                        "User Management"
                    ],
                    description: "Get the connection SID of the current user",
                    responses: {
                        200: {
                            description: "Connection SID retrieved successfully",
                            content: {
                                'application/json': {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            connectionSid: {
                                                type: "string",
                                                description: "The connection SID of the current user"
                                            }
                                        }
                                    }
                                }
                            }
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
            "/api/live/url": {
                get: {
                    summary: "Get the websocket URL",
                    tags: [
                        "Live"
                    ],
                    description: "Get the websocket URL",
                    responses: {
                        200: {
                            description: "Websocket URL retrieved successfully",
                            content: {
                                'application/json': {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            url: {
                                                type: "string",
                                                description: "The websocket URL"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/users/search": {
                get: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Search for users",
                    tags: [
                        "User Management"
                    ],
                    description: "Search for users",
                    parameters: [
                        {
                            name: "query",
                            in: "query",
                            description: "The search query",
                            required: true,
                            schema: {
                                type: "string"
                            }
                        }
                    ],
                    responses: {
                        200: {
                            description: "Users found",
                            content: {
                                'application/json': {
                                    schema: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            "$ref": "#/components/schemas/User"
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: "Bad Request: Query is required"
                        }
                    }
                }
            },
            "/api/bridging/getInstances": {
                get: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Get all instances",
                    tags: [
                        "Bridging"
                    ],
                    description: "Get all instances",
                    responses: {
                        200: {
                            description: "Instances retrieved successfully",
                            content: {
                                'application/json': {
                                    schema: {
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
            "/api/bridging/addInstance": {
                post: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Add an instance",
                    tags: [
                        "Bridging"
                    ],
                    description: "Add an instance",
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        url: {
                                            type: "string",
                                            description: "The URL of the instance"
                                        },
                                        useAllowlist: {
                                            type: "boolean",
                                            description: "Whether to use the allowlist"
                                        },
                                        enabled: {
                                            type: "boolean",
                                            description: "Whether the instance is enabled"
                                        }
                                    },
                                    required: ["url"]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Instance added successfully"
                        },
                        400: {
                            description: "Bad Request: URL is required"
                        }
                    }
                }
            },
            "/api/bridging/removeInstance": {
                delete: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Remove an instance",
                    tags: [
                        "Bridging"
                    ],
                    description: "Remove an instance",
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "integer",
                                            description: "The ID of the instance to remove"
                                        }
                                    },
                                    required: ["id"]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Instance removed successfully"
                        },
                        400: {
                            description: "Bad Request: ID is required"
                        }
                    }
                }
            },
            "/api/bridging/toggleAllowlist": {
                patch: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Toggle the allowlist for an instance",
                    tags: [
                        "Bridging"
                    ],
                    description: "Toggle the allowlist for an instance",
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "integer",
                                            description: "The ID of the instance to toggle the allowlist for"
                                        }
                                    },
                                    required: ["id"]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Allowlist toggled successfully"
                        },
                        400: {
                            description: "Bad Request: ID is required"
                        }
                    }
                }
            },
            "/api/bridging/toggleEnabled": {
                patch: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Toggle the enabled status for an instance",
                    tags: [
                        "Bridging"
                    ],
                    description: "Toggle the enabled status for an instance",
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "integer",
                                            description: "The ID of the instance to toggle the enabled status for"
                                        }
                                    },
                                    required: ["id"]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Enabled status toggled successfully"
                        },
                        400: {
                            description: "Bad Request: ID is required"
                        }
                    }
                }
            },
            "/api/bridging/addBridgedUser": {
                post: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Add a bridged user",
                    tags: [
                        "Bridging"
                    ],
                    description: "Add a bridged user",
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        userId: {
                                            type: "integer",
                                            description: "The ID of the user to bridge"
                                        },
                                        instanceId: {
                                            type: "integer",
                                            description: "The ID of the instance to bridge the user to"
                                        }
                                    },
                                    required: ["userId", "instanceId"]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "User bridged successfully"
                        },
                        400: {
                            description: "Bad Request: User ID and/or Instance ID are required"
                        }
                    }
                }
            },
            "/api/bridging/removeBridgedUser": {
                delete: {
                    security: [
                        {
                            cookieAuth: []
                        }
                    ],
                    summary: "Remove a bridged user",
                    tags: [
                        "Bridging"
                    ],
                    description: "Remove a bridged user",
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        userId: {
                                            type: "integer",
                                            description: "The ID of the user to disallow bridging"
                                        },
                                        instanceId: {
                                            type: "integer",
                                            description: "The ID of the instance to disallow bridging the user from"
                                        }
                                    },
                                    required: ["userId", "instanceId"]
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "User unbridged successfully"
                        },
                        400: {
                            description: "Bad Request: User ID and/or Instance ID are required"
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