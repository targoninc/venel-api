import passportLocal from "passport-local";
import bcrypt from "bcryptjs";

const LocalStrategy = passportLocal.Strategy;

export function PassportStrategy(db) {
    return new LocalStrategy(
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
    return (user, done) => {
        done(null, user.id);
    }
}

export function PassportDeserializeUser(db) {
    return async (id, done) => {
        const user = await db.getUserById(id);
        delete user.passwordHash;
        done(null, user);
    }
}