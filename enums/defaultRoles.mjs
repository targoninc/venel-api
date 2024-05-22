import {PermissionsList} from "./permissionsList.mjs";

export const DefaultRoles = {
    admin: {
        name: "admin",
        description: "Administrator. Can do anything.",
        permissions: Object.values(PermissionsList)
    },
    member: {
        name: "member",
        description: "Member. No permissions per default.",
        permissions: []
    }
}