import passport from "passport";
import {CLI} from "../../tooling/CLI.mjs";
import {AuthActions, safeUser} from "./actions.mjs";
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
     * /api/getUser:
     *  get:
     *    description: Get the user object
     *    responses:
     *      200:
     *        description: The user object
     *      401:
     *        description: Unauthorized
     */
    static getUser() {
        return (req, res) => {
            if (req.isAuthenticated()) {
                res.send({user: req.user});
                return;
            }
            res.status(401);
            res.send({error: "Not authenticated"});
        };
    }

    /**
     * @returns {function(Request, Response, Function): Promise<User>}
     * @swagger
     * /api/authorize:
     *  post:
     *    description: Authorize a user
     *    parameters:
     *      - name: user_info
     *        in: body
     *        required: true
     *        schema:
     *          type: object
     *          required:
     *            - username
     *            - password
     *          properties:
     *            username:
     *              type: string
     *              minLength: 3
     *              maxLength: 255
     *              default: "myusername"
     *            password:
     *              type: string
     *              format: password
     *              minLength: 16
     *              maxLength: 64
     *              default: "testpassword1234"
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
                res.send({error: "Username must be at least 3 characters long"});
                return;
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
                    res.send({error: "Invalid username or password"});
                    return;
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

            res.send({
                user: outUser
            });
        }
    }

    /** @swagger
     *  /api/register:
     *  post:
     *    description: Register a user
     *    parameters:
     *      - name: user_info
     *        in: body
     *        required: true
     *        schema:
     *          type: object
     *          required:
     *            - username
     *            - password
     *          properties:
     *            username:
     *              type: string
     *              minLength: 3
     *              maxLength: 255
     *              default: "myusername"
     *            password:
     *              type: string
     *              format: password
     *              minLength: 16
     *              maxLength: 64
     *              default: "testpassword1234"
     */
    static registerUser(db) {
        return async (req, res, next) => {
            const cleanUsername = req.body.username.toLowerCase();
            if (cleanUsername.length < 3) {
                res.send({error: "Username must be at least 3 characters long"});
                return;
            }
            const existing = await db.getUserByUsername(cleanUsername);
            if (existing) {
                res.send({error: "Username already exists on this instance"});
                return;
            }

            const passwordMinLength = 16;
            const passwordMaxLength = 64;
            const passwordMustContainNumbers = true;
            if (req.body.password < passwordMinLength) {
                res.send({error: `Password must be at least ${passwordMinLength} characters long`});
                return;
            }
            if (req.body.password > passwordMaxLength) {
                res.send({error: `Password must be at most ${passwordMaxLength} characters long`});
                return;
            }
            if (passwordMustContainNumbers && !/\d/.test(req.body.password)) {
                res.send({error: "Password must contain at least one number"});
                return;
            }
            await AuthActions.registerUser(req, db, cleanUsername, req.body.password);

            passport.authenticate("local", async (err, user) => {
                if (err) {
                    CLI.error(err);
                    return next(err);
                }
                req.logIn(user, AuthEndpoints.requestLogin(next, db, req, res, false, user));
            })(req, res, next);
        }
    }

    static updateUser(db) {
        return async (req, res) => {
            const user = req.user;
            const {username, displayname, description} = req.body;
            if (username) {
                if (username.length < 3) {
                    res.send({error: "Username must be at least 3 characters long"});
                    return;
                }
                const existing = await db.getUserByUsername(username);
                if (existing) {
                    res.send({error: "Username already exists on this instance"});
                    return;
                }
                await db.updateUserUsername(user.id, username);
            }
            if (displayname) {
                await db.updateUserDisplayname(user.id, displayname);
            }
            if (description) {
                await db.updateUserDescription(user.id, description);
            }

            const outUser = await db.getUserById(user.id);
            res.send({
                user: safeUser(outUser)
            });
        }
    }
}