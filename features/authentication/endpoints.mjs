import passport from "passport";
import {CLI} from "../../tooling/CLI.mjs";
import {AuthActions} from "./actions.mjs";
import {IP} from "../../tooling/IP.mjs";

export class AuthEndpoints {
    /**
     * @swagger
     * /api/logout:
     *  post:
     *    description: Log out a user
     *    responses:
     *      200:
     *        description: User logged out successfully
     */
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

    /**
     * @swagger
     * /api/isAuthorized:
     *  get:
     *    description: Check if a user is authorized
     *    responses:
     *      200:
     *        description: User is authorized
     *      401:
     *        description: Unauthorized
     */
    static isAuthorized() {
        return (req, res) => {
            if (req.isAuthenticated()) {
                res.send({user: req.user});
                return;
            }
            res.send({});
        };
    }

    /**
     * @swagger
     * /api/authorize:
     *  post:
     *    description: Authorize a user
     *    parameters:
     *      - name: username
     *        in: body
     *        required: true
     *        type: string
     *      - name: password
     *        in: body
     *        required: true
     *        type: string
     *    responses:
     *      200:
     *        description: User authorized successfully
     *      401:
     *        description: Unauthorized
     */
    static authorizeUser(db) {
        return async (req, res, next) => {
            const cleanUsername = req.body.username.toLowerCase();
            if (cleanUsername.length < 3) {
                return res.send({error: "Username must be at least 3 characters long"});
            }
            const existing = await db.getUserByUsername(cleanUsername);
            if (!existing) {
                res.send({error: "This username does not exist on this instance"});
                return;
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
                req.logIn(user, AuthEndpoints.requestLogin(next, db, req, res, existing, user));
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

    static registerUser(db) {
        return async (req, res, next) => {
            const cleanUsername = req.body.username.toLowerCase();
            if (cleanUsername.length < 3) {
                return res.send({error: "Username must be at least 3 characters long"});
            }
            const existing = await db.getUserByUsername(cleanUsername);
            if (existing) {
                return res.send({error: "Username already exists on this instance"});
            }

            await AuthActions.registerUser(req, db, cleanUsername);

            passport.authenticate("local", async (err, user) => {
                if (err) {
                    CLI.error(err);
                    return next(err);
                }
                req.logIn(user, AuthEndpoints.requestLogin(next, db, req, res, false, user));
            })(req, res, next);
        }
    }
}