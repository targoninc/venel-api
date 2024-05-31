import passport from "passport";
import {CLI} from "../../tooling/CLI";
import {AuthActions, safeUser} from "./actions";
import {IP} from "../../tooling/IP";
import {PermissionsList} from "../../enums/permissionsList";
import {Request, Response} from "express";
import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {User} from "../database/models";
import {SafeUser} from "../../models/safeUser";
import Jimp from "jimp";
import {OwnUser} from "../../models/ownUser";

export class AuthEndpoints {
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

    static getUser(db: MariaDbDatabase): (arg0: Request, arg1: Response) => void {
        return async (req: Request, res: Response) => {
            const user = req.user as OwnUser;

            let roles = await db.getUserRoles(user.id);
            if (!roles) {
                roles = [];
            }
            user.roles = roles;
            let permissions = await db.getUserPermissions(user.id);
            if (!permissions) {
                permissions = [];
            }
            user.permissions = permissions;

            res.send({ user });
        };
    }

    static getUsers(db: MariaDbDatabase): (arg0: Request, arg1: Response) => void {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const permissions = await db.getUserPermissions(user.id);
            if (!permissions || !permissions.some(p => p.name === PermissionsList.viewUsers.name)) {
                res.status(403).send({error: "You do not have permission to view users"});
                return;
            }

            const users = await db.getUsers();
            if (!users) {
                res.send({error: "No users found"});
                return;
            }

            res.send({users: users.map(u => safeUser(u))});
        };
    }

    static authorizeUser(db: MariaDbDatabase) {
        async function authUser(req: Request, res: Response, next: Function): Promise<void> {
            const cleanUsername = req.body.username.toLowerCase();
            if (cleanUsername.length < 3) {
                res.status(400);
                res.send({error: "Username must be at least 3 characters long"});
                return;
            }
            const existing = await db.getUserByUsername(cleanUsername);
            if (!existing) {
                res.status(404);
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
                    res.status(401);
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

            const outUser = <SafeUser & { justRegistered?: boolean; }>safeUser(user);
            if (!existing) {
                outUser.justRegistered = true;
            }

            res.send({
                user: outUser
            });
        }
    }

    static registerUser(db: MariaDbDatabase): (arg0: any, arg1: any, arg2: Function) => Promise<void> {
        return async (req: any, res: any, next: Function) => {
            let cleanUsername = req.body.username;
            if (!cleanUsername) {
                res.status(400);
                res.send({error: "Username is required"});
                return;
            }
            if (cleanUsername.length < 3) {
                res.status(400);
                res.send({error: "Username must be at least 3 characters long"});
                return;
            }
            cleanUsername = cleanUsername.toLowerCase();
            const existing = await db.getUserByUsername(cleanUsername);
            if (existing) {
                res.status(400);
                res.send({error: "Username already exists on this instance"});
                return;
            }

            const passwordMinLength = 16;
            const passwordMaxLength = 64;
            const passwordMustContainNumbers = true;
            const password = req.body.password;
            if (!password) {
                res.status(400);
                res.send({error: "Password is required"});
                return;
            }
            if (password.length < passwordMinLength) {
                res.status(400);
                res.send({error: `Password must be at least ${passwordMinLength} characters long`});
                return;
            }
            if (password.length > passwordMaxLength) {
                res.status(400);
                res.send({error: `Password must be at most ${passwordMaxLength} characters long`});
                return;
            }
            if (passwordMustContainNumbers && !/\d/.test(password)) {
                res.status(400);
                res.send({error: "Password must contain at least one number"});
                return;
            }

            const users = await db.getUsers();
            if (users && users.length > 0 && process.env.ALLOW_FREE_REGISTRATION !== "true") {
                res.status(403);
                res.send({error: "This instance does not allow free registration"});
                return;
            }
            CLI.info(`Registering user ${cleanUsername}`);
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

    static updateUser(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;
            const {username, displayname, description} = req.body;
            const oldUser = await db.getUserById(user.id);
            if (!oldUser) {
                res.send({error: "User not found"});
                return;
            }

            if (username && username !== oldUser.username) {
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

            if (displayname && displayname !== oldUser.displayname) {
                await db.updateUserDisplayname(user.id, displayname);
            }

            if (description && description !== oldUser.description) {
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

    static updateAvatar(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;
            const {avatar} = req.body;
            if (!avatar) {
                res.status(400).send({error: "Avatar is required"});
                return;
            }

            const image = await Jimp.read(Buffer.from(avatar, 'base64'));
            image.quality(60).resize(256, 256);
            const compressedImage = await image.getBase64Async(Jimp.MIME_JPEG);

            await db.updateUserAvatar(user.id, compressedImage);
            const outUser = await db.getUserById(user.id);
            if (!outUser) {
                res.status(404).send({error: "User not found"});
                return;
            }
            res.send({
                user: safeUser(outUser)
            });
        }
    }

    static getAllPermissions(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            res.send({
                permissions: await db.getPermissions()
            });
        }
    }

    static getAllRoles(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            res.send({
                roles: await db.getRoles()
            });
        }
    }

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
            if (!description) {
                res.send({error: "Description is required"});
                return;
            }
            await db.createRole(name, description);
            res.send({message: "Role created successfully"});
        }
    }

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

    static getUserPermissions(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const {userId} = req.query as { userId: string };
            if (!userId) {
                res.status(400);
                res.send({error: "userId is required"});
                return;
            }

            const user = await db.getUserById(parseInt(userId));
            if (!user) {
                res.status(404);
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

    static addRoleToUser(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const {userId, roleId} = req.body;
            if (!userId || !roleId) {
                res.status(400);
                res.send({error: "userId and roleId are required"});
                return;
            }

            const user = req.user as User;
            const selfPermissions = await db.getUserPermissions(user.id);
            if (!selfPermissions || !selfPermissions.some(p => p.name === PermissionsList.addUserToRole.name)) {
                res.status(403);
                res.send({error: "You do not have permission to add a role to a user"});
                return;
            }

            await db.createUserRole(parseInt(userId), parseInt(roleId));
            res.send({message: "Role added to user successfully"});
        }
    }

    static removeRoleFromUser(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const {userId, roleId} = req.body;
            if (!userId || !roleId) {
                res.status(400);
                res.send({error: "userId and roleId are required"});
                return;
            }

            const user = req.user as User;
            const selfPermissions = await db.getUserPermissions(user.id);
            if (!selfPermissions || !selfPermissions.some(p => p.name === PermissionsList.removeUserFromRole.name)) {
                res.status(403);
                res.send({error: "You do not have permission to remove a role from a user"});
                return;
            }

            await db.deleteUserRole(parseInt(userId), parseInt(roleId));
            res.send({message: "Role removed from user successfully"});
        }
    }

    static deleteUser(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;
            const {userId} = req.body;
            if (!userId) {
                res.send({error: "userId is required"});
                return;
            }

            if (user.id !== parseInt(userId)) {
                const selfPermissions = await db.getUserPermissions(user.id);
                if (!selfPermissions || !selfPermissions.some(p => p.name === PermissionsList.deleteUser.name)) {
                    res.status(403);
                    res.send({error: "You do not have permission to delete this user"});
                    return;
                }
            }

            await db.deleteUser(parseInt(userId));
            res.send({message: "User deleted successfully"});
        }
    }

    static getConnectionSid() {
        return (req: Request, res: Response) => {
            let connectSid = req.headers.cookie?.split(';').find((c: string) => c.trim().startsWith('connect.sid='));
            if (connectSid) {
                connectSid = connectSid.split('=')[1];
            }
            res.send({connectSid});
        }
    }
}