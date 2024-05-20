import bcrypt from "bcryptjs";
import passportLocal from "passport-local";
import express from "express";
import session from "express-session";
import passport from "passport";
import {CLI} from "../tooling/CLI.mjs";
import {IP} from "../tooling/IP.mjs";

const LocalStrategy = passportLocal.Strategy;

export function PassportStrategy(db) {
    return new LocalStrategy(
        async (username, password, done) => {
            const user = await db.getUserByUsername(username);
            if (!user) {
                return done(null, false, {message: "Incorrect username."});
            }
            if (!bcrypt.compareSync(password, user.password_hash)) {
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
        delete user.password_hash;
        done(null, user);
    }
}

export class AuthenticationFeature {
    static enable(__dirname, db) {
        const app = express();
        app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        }));

        app.use(passport.initialize());
        app.use(passport.session({}));

        app.use(express.json());

        passport.use(PassportStrategy(db));
        passport.serializeUser(PassportSerializeUser());
        passport.deserializeUser(PassportDeserializeUser(db));

        app.post("/api/authorize", AuthenticationFeature.authorizeUser(db));
        app.post("/api/logout", AuthenticationFeature.logout());
        app.get("/api/isAuthorized", AuthenticationFeature.isAuthorized());
        return app;
    }

    static logout() {
        return (req, res) => {
            req.logout(() => {
                const isHttps = req.headers['x-forwarded-proto'] === 'https';

                res.clearCookie('connect.sid', {
                    path: '/',
                    httpOnly: true,
                    secure: isHttps,
                    sameSite: 'none'
                });

                res.send({message: "User has been successfully logged out."});
            });
        }
    }

    static authorizeUser(db) {
        return async (req, res, next) => {
            const cleanUsername = req.body.username.toLowerCase();
            if (cleanUsername.length < 3) {
                return res.send({error: "Username must be at least 3 characters long"});
            }
            const existing = await db.getUserByUsername(cleanUsername);
            if (!existing) {
                if (process.env.REGISTER_USERS_ON_MISSING === "true") {
                    await AuthenticationFeature.registerUser(req, db, cleanUsername);
                } else {
                    res.send({error: "Invalid username or password"});
                    return;
                }
            }
            if (existing && !existing.ip) {
                const ip = IP.get(req);
                await db.updateUserIp(existing.id, ip);
            }

            passport.authenticate("local", async (err, user) => {
                if (err) {
                    CLI.error(err);
                    return next(err);
                }
                if (!user) {
                    return res.send({error: "Invalid username or password"});
                }
                req.logIn(user, AuthenticationFeature.requestLogin(next, db, req, res, existing, user));
            })(req, res, next);
        }
    }

    static requestLogin(next, db, req, res, existing, user) {
        return async (err) => {
            if (err) {
                return next(err);
            }

            const outUser = {
                id: user.id,
                username: user.username,
            };
            if (!existing) {
                outUser.justRegistered = true;
            }

            return res.send({
                user: outUser
            });
        }
    }

    static async registerUser(req, db, cleanUsername) {
        const ip = IP.get(req);
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        await db.insertUser(cleanUsername, hashedPassword, ip);
    }

    static isAuthorized() {
        return (req, res) => {
            if (req.isAuthenticated()) {
                res.send({user: req.user});
                return;
            }
            res.send({});
        };
    }

    static checkAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
            req.requestId = Math.random().toString(36).substring(7);
            return next();
        }
        res.send({error: "Not authenticated"});
    }
}