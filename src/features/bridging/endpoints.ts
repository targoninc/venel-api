import {MariaDbDatabase} from "../database/mariaDbDatabase";
import {Request, Response} from "express";
import {User} from "../database/models";
import {PermissionsList} from "../../enums/permissionsList";

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
            res.send(instances);
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

            const instance = await db.addBridgedInstance(url, useAllowlist, enabled);
            res.send(instance);
        }
    }
}