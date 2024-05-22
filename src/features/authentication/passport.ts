import passportLocal from "passport-local";
import bcrypt from "bcryptjs";
import {safeUser} from "./actions";
import {MariaDbDatabase} from "../database/mariaDbDatabase";

const LocalStrategy = passportLocal.Strategy;

export function PassportStrategy(db: MariaDbDatabase) {
    return new LocalStrategy(
        {},
        async (username, password, done) => {
            const user = await db.getUserByUsername(username);
            if (!user) {
                return done(null, false, {message: "Incorrect username."});
            }
            if (!bcrypt.compareSync(password, user.passwordHash)) {
                return done(null, false, {message: "Incorrect password."});
            }
            return done(null, user);
        }
    )
}

export function PassportSerializeUser() {
    return (user: Express.User & { id?: number }, done: Function) => {
        done(null, user.id);
    }
}

export function PassportDeserializeUser(db: MariaDbDatabase) {
    return async (id: number, done: Function) => {
        const user = await db.getUserById(id);
        if (!user) {
            return done(null, null);
        }
        user.passwordHash = "";
        done(null, safeUser(user));
    }
}