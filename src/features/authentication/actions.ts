import {IP} from "../../tooling/IP";
import bcrypt from 'bcryptjs';
import {DefaultRoles} from "../../enums/defaultRoles";
import {CLI} from "../../tooling/CLI";
import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {Request, Response} from "express";
import {User} from "../database/models";
import {SafeUser} from "../../models/safeUser";

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
        res.status(401).send({error: "Not authenticated"});
    }
}

export function safeUser(user: User | SafeUser): SafeUser {
    let avatar = null;
    if (user.avatar?.constructor === Buffer) {
        avatar = user.avatar.toString();
    }

    return {
        id: user.id,
        username: user.username,
        displayname: user.displayname,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        description: user.description,
        avatar,
        archived: user.archived
    };
}

export function avatarUser(user: User): User & { avatar: string | null } {
    let avatar: (Buffer & string) | null = null;
    if (user.avatar?.constructor === Buffer) {
        avatar = user.avatar.toString() as (Buffer & string);
    }

    return {
        ...user,
        avatar
    };
}