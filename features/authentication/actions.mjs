import {IP} from "../../tooling/IP.mjs";
import bcrypt from 'bcryptjs';
import {DefaultRoles} from "../../enums/defaultRoles.mjs";
import {CLI} from "../../tooling/CLI.mjs";

export class AuthActions {
    /**
     *
     * @param {Request} req
     * @param {MariaDbDatabase} db
     * @param {String} cleanUsername
     * @param {String} password
     * @returns {Promise<void>}
     */
    static async registerUser(req, db, cleanUsername, password) {
        const ip = IP.get(req);
        const hashedPassword = bcrypt.hashSync(password, 10);
        await db.createUser(cleanUsername, hashedPassword, ip);

        const users = await db.getUsers();
        if (users && users.length === 1) {
            CLI.info("First user created, assigning admin role...")
            const user = users[0];
            const adminRoleId = await db.getRoleByName(DefaultRoles.admin.name);
            await db.createUserRole(user.id, adminRoleId.id);
        } else {
            const user = await db.getUserByUsername(cleanUsername);
            if (!user) {
                throw new Error("User not found after registration");
            }
            const memberRoleId = await db.getRoleByName(DefaultRoles.member.name);
            await db.createUserRole(user.id, memberRoleId.id);
        }
    }

    static checkAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
            req.requestId = Math.random().toString(36).substring(7);
            return next();
        }
        res.send({error: "Not authenticated"});
    }
}

/**
 *
 * @param {User} user
 * @returns {User}
 */
export function safeUser(user) {
    return {
        id: user.id,
        username: user.username,
        displayname: user.displayname,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        description: user.description,
    };
}