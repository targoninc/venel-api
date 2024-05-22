import passport from "passport";
import {CLI} from "../../tooling/CLI";
import {AuthActions, safeUser} from "./actions";
import {IP} from "../../tooling/IP";
import {PermissionsList} from "../../enums/permissionsList";
import {Request, Response} from "express";
import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {User} from "../database/models";

export class AuthEndpoints {
    /**
     * @swagger
     * /api/logout:
     *  post:
     *    tags:
     *      - User Management
     *    description: Log out a user
     *    responses:
     *      200:
     *        description: User logged out successfully
     */
    static logout(): (arg0: Request, arg1: Response) => void {
        return (req: Request, res: Response) => {
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
     *    tags:
     *      - User Management
     *    description: Get the user object
     *    responses:
     *      200:
     *        description: The user object
     *      401:
     *        description: Unauthorized
     */
    static getUser(): (arg0: Request, arg1: Response) => void {
        return (req: Request, res: Response) => {
            res.send({user: req.user});
        };
    }

    /**
     * @swagger
     * /api/authorize:
     *  post:
     *    tags:
     *      - User Management
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
    static authorizeUser(db: MariaDbDatabase) {
        async function authUser(req: Request, res: Response, next: Function): Promise<void> {
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

            if (!existing.lastLoginIp) {
                const ip = IP.get(req);
                await db.updateUserIp(existing.id, ip);
            }

            passport.authenticate("local", async (err: any, user: User) => {
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

        return authUser;
    }

    static requestLogin(next: Function, db: MariaDbDatabase, req: Request, res: Response, existing: User | false, user: User) {
        return async (err: any) => {
            if (err) {
                return next(err);
            }

            const outUser = <User & {
                justRegistered?: boolean;
            }>{
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

    /**
     * @swagger
     *  /api/register:
     *  post:
     *    tags:
     *      - User Management
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
    static registerUser(db: MariaDbDatabase): (arg0: Request, arg1: Response, arg2: Function) => Promise<void> {
        return async (req: Request, res: Response, next: Function) => {
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

            passport.authenticate("local", async (err: any, user: User) => {
                if (err) {
                    CLI.error(err);
                    return next(err);
                }
                req.logIn(user, AuthEndpoints.requestLogin(next, db, req, res, false, user));
            })(req, res, next);
        }
    }

    /**
     * @swagger
     *   /api/updateUser:
     *     post:
     *       tags:
     *         - User Management
     *       description: Update a user
     *       parameters:
     *         - name: user_info
     *           in: body
     *           required: true
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *                 minLength: 3
     *                 maxLength: 255
     *                 default: "myusername"
     *                 description: The new username
     *                 required: false
     *               displayname:
     *                 type: string
     *                 maxLength: 255
     *                 default: "My Username"
     *                 description: The new display name
     *                 required: false
     *               description:
     *                 type: string
     *                 maxLength: 255
     *                 default: "I am a user"
     *                 description: The new description
     *                 required: false
     */
    static updateUser(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;
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
            if (!outUser) {
                res.send({error: "User not found"});
                return;
            }
            res.send({
                user: safeUser(outUser)
            });
        }
    }

    /**
     * @swagger
     *   /api/permissions:
     *     get:
     *       tags:
     *         - Permission Management
     *       description: Get all permissions
     *       responses:
     *         200:
     *           description: All permissions
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 permissions:
     *                   type: array
     *                   items:
     *                     type: object
     */
    static getAllPermissions(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            res.send({
                permissions: await db.getPermissions()
            });
        }
    }

    /**
     * @swagger
     *   /api/roles:
     *     get:
     *       tags:
     *         - Permission Management
     *       description: Get all roles
     *       responses:
     *         200:
     *           description: All roles
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   roles:
     *                     type: array
     *                     items:
     *                       type: object
     */
    static getAllRoles(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            res.send({
                roles: await db.getRoles()
            });
        }
    }

    /**
     * @swagger
     * /api/createRole:
     *   post:
     *     tags:
     *       - Permission Management
     *     description: Creates a new role in the system
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: body
     *         description: Role's entity
     *         in: body
     *         required: true
     *         schema:
     *           type: object
     *           required:
     *             - name
     *           properties:
     *             name:
     *               type: string
     *             description:
     *               type: string
     *     responses:
     *       200:
     *         description: Role created successfully
     *         schema:
     *           type: object
     *           properties:
     *             message:
     *               type: string
     *       403:
     *         description: You do not have permission to create a role
     *         schema:
     *           type: object
     *           properties:
     *             error:
     *               type: string
     *       default:
     *         description: Name is required
     *         schema:
     *           type: object
     *           properties:
     *             error:
     *               type: string
     */
    static createRole(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;
            const userPermissions = await db.getUserPermissions(user.id);
            if (!userPermissions || !userPermissions.some(p => p.name === PermissionsList.createRole.name)) {
                res.status(403);
                res.send({error: "You do not have permission to create a role"});
                return;
            }

            const {name, description} = req.body;
            if (!name) {
                res.send({error: "Name is required"});
                return;
            }
            await db.createRole(name, description);
            res.send({message: "Role created successfully"});
        }
    }

    /**
     * @swagger
     * /api/addPermissionToRole:
     *   post:
     *     tags:
     *       - Permission Management
     *     description: Grants a permission to a role
     *     parameters:
     *       - name: roleId
     *         description: The ID of the role that will be granted the permission
     *         in: body
     *         required: true
     *         type: integer
     *       - name: permissionId
     *         description: The ID of the permission that will be granted to the role
     *         in: body
     *         required: true
     *         type: integer
     *     responses:
     *       200:
     *         description: Permission added to the role successfully
     *       403:
     *         description: You do not have permission to add a permission to a role
     *       400:
     *         description: RoleId and permissionId are required
     *     security:
     *       - ApiKeyAuth: []
     */
    static addPermissionToRole(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;
            const userPermissions = await db.getUserPermissions(user.id);
            if (!userPermissions || !userPermissions.some(p => p.name === PermissionsList.addPermissionToRole.name)) {
                res.status(403);
                res.send({error: "You do not have permission to add a permission to a role"});
                return;
            }

            const {roleId, permissionId} = req.body;
            if (!roleId || !permissionId) {
                res.send({error: "roleId and permissionId are required"});
                return;
            }

            await db.createRolePermission(roleId, permissionId);
            res.send({message: "Permission added to role successfully"});
        }
    }

    static getRolePermissions(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const {roleId} = req.query as { roleId: string };
            if (!roleId) {
                res.send({error: "roleId is required"});
                return;
            }

            res.send({
                permissions: await db.getRolePermissions(parseInt(roleId))
            });
        }
    }

    /**
     * @swagger
     * /api/getUserRoles:
     *   get:
     *     tags:
     *       - User Management
     *     description: Get all roles for a given user
     *     parameters:
     *       - name: userId
     *         in: query
     *         required: true
     *         schema:
     *           type: string
     *           default: 1
     *           description: The id of the user
     *     responses:
     *       200:
     *         description: All roles for the user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 roles:
     *                   type: array
     *                   items:
     *                     type: object
     */
    static getUserRoles(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const {userId} = req.query as { userId: string };
            if (!userId) {
                res.send({error: "userId is required"});
                return;
            }

            const user = await db.getUserById(parseInt(userId));
            if (!user) {
                res.send({error: "User not found"});
                return;
            }

            res.send({
                roles: await db.getUserRoles(parseInt(userId))
            });
        }
    }

    /**
     * @swagger
     * /api/getUserPermissions:
     *   get:
     *     tags:
     *       - User Management
     *     description: Get all permissions for a given user
     *     parameters:
     *       - name: userId
     *         in: query
     *         required: true
     *         schema:
     *           type: string
     *           default: 1
     *           description: The id of the user
     *     responses:
     *       200:
     *         description: All permissions for the user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 permissions:
     *                   type: array
     *                   items:
     *                     type: object
     */
    static getUserPermissions(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const {userId} = req.query as { userId: string };
            if (!userId) {
                res.send({error: "userId is required"});
                return;
            }

            const user = await db.getUserById(parseInt(userId));
            if (!user) {
                res.send({error: "User not found"});
                return;
            }

            const reqUser = req.user as User;
            const selfPermissions = await db.getUserPermissions(reqUser.id);
            if (!selfPermissions || !selfPermissions.some(p => p.name === PermissionsList.getUserPermissions.name)) {
                res.status(403);
                res.send({error: "You do not have permission to get user permissions for another user"});
                return;
            }

            res.send({
                permissions: await db.getUserPermissions(parseInt(userId))
            });
        }
    }
}