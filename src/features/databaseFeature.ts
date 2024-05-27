import fs from "fs";
import path from "path";
import {CLI} from "../tooling/CLI";
import {PermissionsList} from "../enums/permissionsList";
import {DefaultRoles} from "../enums/defaultRoles";
import {MariaDbDatabase} from "./database/mariaDbDatabase";

export class DatabaseFeature {
    static async enable(__dirname: string) {
        const db = new MariaDbDatabase();
        db.connect();
        await DatabaseFeature.checkDatabaseIntegrity(db, __dirname);
        return db;
    }

    static async checkDatabaseIntegrity(db: MariaDbDatabase, __dirname: string) {
        const file = fs.readFileSync(path.join(__dirname, "../updateDb.sql"), "utf8");
        const queries = file.split(";");
        CLI.info("Checking database integrity...");
        for (const query of queries) {
            if (!query.trim()) {
                continue;
            }
            await db.query(query.trim());
        }
        await DatabaseFeature.createDefaultData(db);
        CLI.success("Database is up to date.");
    }

    static async createDefaultData(db: MariaDbDatabase) {
        CLI.info("Creating default data...");
        await DatabaseFeature.createDefaultPermissions(db);
        await DatabaseFeature.createDefaultRoles(db);
    }

    static async createDefaultPermissions(db: MariaDbDatabase) {
        const permissions = Object.values(PermissionsList);
        for (const permission of permissions) {
            await db.createPermission(permission.name, permission.description);
        }
    }

    static async createDefaultRoles(db: MariaDbDatabase) {
        const roles = Object.values(DefaultRoles);
        for (const role of roles) {
            await db.createRole(role.name, role.description);
            for (const permission of role.permissions) {
                await db.query(`INSERT INTO venel.rolePermissions (roleId, permissionId)
                                VALUES ((SELECT id FROM venel.roles WHERE name = ?),
                                        (SELECT id FROM venel.permissions WHERE name = ?))
                                ON DUPLICATE KEY UPDATE roleId = roleId`,
                    [role.name, permission.name]);
            }
        }
    }
}