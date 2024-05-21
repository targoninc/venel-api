import {Permissions} from "./permissions.mjs";

export const DefaultRoles = {
    admin: {
        name: "admin",
        description: "Administrator. Can do anything.",
        permissions: Object.values(Permissions)
    }
}