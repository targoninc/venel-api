import {Permission, PermissionsList} from "./permissionsList";

export type Role = {
    name: string;
    description: string;
    permissions: Permission[];
}

export const DefaultRoles: Record<string, Role> = {
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