import {IP} from "../../tooling/IP.mjs";
import bcrypt from 'bcryptjs';

export class AuthActions {
    static async registerUser(req, db, cleanUsername, password) {
        const ip = IP.get(req);
        const hashedPassword = bcrypt.hashSync(password, 10);
        await db.createUser(cleanUsername, hashedPassword, ip);
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