import {IP} from "../../tooling/IP.mjs";
import {hash} from 'bcryptjs';

export class AuthActions {
    static async registerUser(req, db, cleanUsername, password) {
        const ip = IP.get(req);
        const hashedPassword = hash(password, 10);
        await db.insertUser(cleanUsername, hashedPassword, ip);
    }

    static checkAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
            req.requestId = Math.random().toString(36).substring(7);
            return next();
        }
        res.send({error: "Not authenticated"});
    }
}