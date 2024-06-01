import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {Request, Response} from "express";
import {User} from "../database/models";
import {PermissionsList} from "../../enums/permissionsList";
import {ViewableInstance} from "../../models/viewableInstance";
import {safeUser} from "../authentication/actions";
import {SafeUser} from "../../models/safeUser";

export class BridgingEndpoints {
    static getInstances(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const permissions = await db.getUserPermissions(user.id);
            if (!permissions || !permissions.some(p => p.name === PermissionsList.viewBridgedInstances.name)) {
                res.status(403).send("You do not have permission to view bridged instances.");
                return;
            }

            const instances = await db.getBridgedInstances() || [];
            let out: ViewableInstance[] = [];
            for (const instance of instances) {
                const newInstance = instance as ViewableInstance;
                newInstance.bridgedUsers = await db.getBridgesUsersForInstance(instance.id);
                let outUsers: SafeUser[] = [];
                for (let user of newInstance.bridgedUsers) {
                    user = safeUser(user);
                    outUsers.push(user);
                }
                newInstance.bridgedUsers = outUsers;
                out.push(newInstance);
            }
            res.send(out);
        }
    }

    static addInstance(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const permissions = await db.getUserPermissions(user.id);
            if (!permissions || !permissions.some(p => p.name === PermissionsList.addBridgedInstance.name)) {
                res.status(403).send("You do not have permission to add bridged instances.");
                return;
            }

            const {url, useAllowlist, enabled} = req.body;
            if (!url) {
                res.status(400).send("Missing required field 'url'");
                return;
            }

            const exists = await db.getBridgedInstanceByUrl(url);
            if (exists) {
                res.status(400).send("An instance with that URL already exists.");
                return;
            }

            await db.addBridgedInstance(url, useAllowlist, enabled);
            const instance = await db.getBridgedInstanceByUrl(url);
            if (!instance) {
                res.status(500).send("Failed to add instance.");
                return;
            }
            res.send(instance);
        }
    }

    static removeInstance(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const permissions = await db.getUserPermissions(user.id);
            if (!permissions || !permissions.some(p => p.name === PermissionsList.removeBridgedInstance.name)) {
                res.status(403).send("You do not have permission to remove bridged instances.");
                return;
            }

            const {id} = req.body;
            if (!id) {
                res.status(400).send("Missing required field 'id'");
                return;
            }

            await db.removeBridgedInstance(id);
            res.send("Instance removed.");
        }
    }

    static toggleAllowlist(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const permissions = await db.getUserPermissions(user.id);
            if (!permissions || !permissions.some(p => p.name === PermissionsList.toggleBridgeInstanceAllowlist.name)) {
                res.status(403).send("You do not have permission to edit bridged instances.");
                return;
            }

            const {id} = req.body;
            if (!id) {
                res.status(400).send("Missing required field 'id'");
                return;
            }

            await db.toggleBridgedInstanceAllowlist(id);
            res.send("Allowlist toggled.");
        }
    }

    static toggleEnabled(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const permissions = await db.getUserPermissions(user.id);
            if (!permissions || !permissions.some(p => p.name === PermissionsList.toggleBridgeInstanceEnabled.name)) {
                res.status(403).send("You do not have permission to edit bridged instances.");
                return;
            }

            const {id} = req.body;
            if (!id) {
                res.status(400).send("Missing required field 'id'");
                return;
            }

            await db.toggleBridgedInstanceEnabled(id);
            res.send("Enabled toggled.");
        }
    }

    static addBridgedUser(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const permissions = await db.getUserPermissions(user.id);
            if (!permissions || !permissions.some(p => p.name === PermissionsList.addBridgedInstanceUser.name)) {
                res.status(403).send("You do not have permission to add users to bridged instances.");
                return;
            }

            const {instanceId, userId} = req.body;
            if (!instanceId || !userId) {
                res.status(400).send("Missing required field 'instanceId' or 'userId'");
                return;
            }

            const addUser = await db.getUserById(userId);
            if (!addUser) {
                res.status(404).send("User not found.");
                return;
            }

            const instance = await db.getBridgedInstanceById(instanceId);
            if (!instance) {
                res.status(404).send("Instance not found.");
                return;
            }

            await db.addBridgedUser(instanceId, userId);
            res.json(safeUser(addUser));
        }
    }

    static removeBridgedUser(db: MariaDbDatabase) {
        return async (req: Request, res: Response) => {
            const user = req.user as User;

            const permissions = await db.getUserPermissions(user.id);
            if (!permissions || !permissions.some(p => p.name === PermissionsList.removeBridgedInstanceUser.name)) {
                res.status(403).send("You do not have permission to remove users from bridged instances.");
                return;
            }

            const {instanceId, userId} = req.body;
            if (!instanceId || !userId) {
                res.status(400).send("Missing required field 'instanceId' or 'userId'");
                return;
            }

            const addUser = await db.getUserById(userId);
            if (!addUser) {
                res.status(404).send("User not found.");
                return;
            }

            const instance = await db.getBridgedInstanceById(instanceId);
            if (!instance) {
                res.status(404).send("Instance not found.");
                return;
            }

            await db.removeBridgedUser(instanceId, userId);
            res.json(safeUser(addUser));
        }
    }
}