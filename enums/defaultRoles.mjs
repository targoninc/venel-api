import {Permissions} from "./permissions.mjs";

export const DefaultRoles = {
    admin: {
        name: "admin",
        description: "Administrator. Can do anything.",
        permissions: [
            Permissions.addUser,
            Permissions.archiveUser,
            Permissions.deleteUser
        ]
    }
}