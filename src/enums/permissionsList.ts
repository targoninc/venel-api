export type Permission = {
    name: string;
    description: string;
};

export const PermissionsList: Record<string, Permission> = {
    addUser: {
        name: "addUser",
        description: "Can add a user."
    },
    archiveUser: {
        name: "archiveUser",
        description: "Can archive a user."
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
    addBridgedInstance: {
        name: "addBridgedInstance",
        description: "Can add a bridged instance."
    },
    removeBridgedInstance: {
        name: "removeBridgedInstance",
        description: "Can remove a bridged instance."
    },
    toggleBridgeInstanceAllowlist: {
        name: "toggleBridgeInstanceAllowlist",
        description: "Can toggle the allowlist of a bridged instance."
    },
    addBridgedInstanceUser: {
        name: "addBridgedInstanceUser",
        description: "Can add an allowed user to a bridged instance."
    },
    removeBridgedInstanceUser: {
        name: "removeBridgedInstanceUser",
        description: "Can remove an allowed user from a bridged instance."
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