import {IP} from "../../tooling/IP";
import bcrypt from 'bcryptjs';
import {DefaultRoles} from "../../enums/defaultRoles";
import {CLI} from "../../tooling/CLI";
import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {Request, Response} from "express";
import {Id, User} from "../database/models";

export class AuthActions {
    static async registerUser(req: Request, db: MariaDbDatabase, cleanUsername: string, password: string) {
        const ip = IP.get(req);
        const hashedPassword = bcrypt.hashSync(password, 10);
        await db.createUser(cleanUsername, hashedPassword, ip);

        const users = await db.getUsers();
        if (users && users.length === 1) {
            CLI.info("First user created, assigning admin role...")
            const user = users[0];
            const adminRole = await db.getRoleByName(DefaultRoles.admin.name);
            if (!adminRole) {
                throw new Error("Admin role not found after registration");
            }
            await db.createUserRole(user.id, adminRole.id);
        } else {
            const user = await db.getUserByUsername(cleanUsername);
            if (!user) {
                throw new Error("User not found after registration");
            }
            const memberRole = await db.getRoleByName(DefaultRoles.member.name);
            if (!memberRole) {
                throw new Error("Member role not found after registration");
            }
            await db.createUserRole(user.id, memberRole.id);
        }
    }

    static checkAuthenticated = (req: Request & { requestId?: string }, res: Response, next: Function) => {
        if (req.isAuthenticated()) {
            req.requestId = Math.random().toString(36).substring(7);
            return next();
        }
        res.send({error: "Not authenticated"});
    }
}

export interface SafeUser {
    'id': Id;
    'username': string;
    'displayname': string | null;
    'createdAt': Date;
    'updatedAt': Date;
    'description': string | null;
    'archived': boolean;
}

export function safeUser(user: User): SafeUser {
    return {
        id: user.id,
        username: user.username,
        displayname: user.displayname,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        description: user.description,
        archived: user.archived
    };
}