export type Permission = {
    name: string;
    description: string;
};

export const PermissionsList: Record<string, Permission> = {
    viewUsers: {
        name: "viewUsers",
        description: "Can view a list of users."
    },
    addUser: {
        name: "addUser",
        description: "Can add a user."
    },
    archiveUser: {
        name: "archiveUser",
        description: "Can archive a user."
    },
    editUser: {
        name: "editUser",
        description: "Can edit a user."
    },
    deleteUser: {
        name: "deleteUser",
        description: "Can delete a user."
    },
    createRole: {
        name: "createRole",
        description: "Can create a role."
    },
    deleteRole: {
        name: "deleteRole",
        description: "Can delete a role."
    },
    addPermissionToRole: {
        name: "addPermissionToRole",
        description: "Can add a permission to a role."
    },
    removePermissionFromRole: {
        name: "removePermissionFromRole",
        description: "Can remove a permission from a role."
    },
    addUserToRole: {
        name: "addUserToRole",
        description: "Can add a user to a role."
    },
    removeUserFromRole: {
        name: "removeUserFromRole",
        description: "Can remove a user from a role."
    },
    getUserPermissions: {
        name: "getUserPermissions",
        description: "Can get the permissions of another user."
    },
    deleteMessage: {
        name: "deleteMessage",
        description: "Can delete a message."
    },
    deleteChannel: {
        name: "deleteChannel",
        description: "Can delete a channel."
    },
}