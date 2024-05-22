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
            "/api/getUser": {
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
            "/api/authorize": {
                post: {
                    summary: "Authorize a user",
                    tags: [
                        "User Management"
                    ],
                    description: "Authorize a user",
                    parameters: [
                        {
                            name: "user_info",
                            in: "body",
                            required: true,
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
                    ],
                    responses: {
                        200: {
                            description: "User authorized successfully"
                        },
                        401: {
                            description: "Unauthorized"
                        }
                    }
                }
            },
            "/api/register": {
                post: {
                    summary: "Register a new user",
                    tags: [
                        "User Management"
                    ],
                    description: "Register a user",
                    parameters: [
                        {
                            name: "user_info",
                            in: "body",
                            required: true,
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
                    ]
                }
            },
            "/api/updateUser": {
                post: {
                    summary: "Update user properties",
                    tags: [
                        "User Management"
                    ],
                    description: "Update a user",
                    parameters: [
                        {
                            name: "user_info",
                            in: "body",
                            required: true,
                            schema: {
                                type: "object",
                                properties: {
                                    username: {
                                        type: "string",
                                        minLength: 3,
                                        maxLength: 255,
                                        default: "myusername",
                                        description: "The new username",
                                        required: false
                                    },
                                    displayname: {
                                        type: "string",
                                        maxLength: 255,
                                        default: "My Username",
                                        description: "The new display name",
                                        required: false
                                    },
                                    description: {
                                        type: "string",
                                        maxLength: 255,
                                        default: "I am a user",
                                        description: "The new description",
                                        required: false
                                    }
                                }
                            }
                        }
                    ]
                },
                security: [
                    {
                        cookieAuth: []
                    }
                ]
            },
            "/api/roles": {
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
            "/api/createRole": {
                post: {
                    summary: "Create a new empty role",
                    tags: [
                        "Permission Management"
                    ],
                    description: "Creates a new role in the system",
                    produces: [
                        "application/json"
                    ],
                    parameters: [
                        {
                            name: "body",
                            description: "Role's entity",
                            in: "body",
                            required: true,
                            schema: {
                                type: "object",
                                required: [
                                    "name"
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
                    ],
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
                        default: {
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
            "/api/addPermissionToRole": {
                post: {
                    summary: "Grants a permission to a role and thus implicitly to all users with that role",
                    tags: [
                        "Permission Management"
                    ],
                    description: "Grants a permission to a role",
                    parameters: [
                        {
                            name: "roleId",
                            description: "The ID of the role that will be granted the permission",
                            in: "body",
                            required: true,
                            type: "integer"
                        },
                        {
                            name: "permissionId",
                            description: "The ID of the permission that will be granted to the role",
                            in: "body",
                            required: true,
                            type: "integer"
                        }
                    ],
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
            "/api/permissions": {
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
            "/api/getUserRoles": {
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
            "/api/getUserPermissions": {
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
            "/api/addRoleToUser": {
                post: {
                    summary: "Adds a role to a user",
                    tags: [
                        "User Management"
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
            }
        }
    }
}