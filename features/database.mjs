import {MariaDbDatabase} from "./database/mariaDbDatabase.mjs";
import fs from "fs";
import path from "path";
import {CLI} from "../tooling/CLI.mjs";
import {Permissions} from "../enums/permissions.mjs";
import {DefaultRoles} from "../enums/defaultRoles.mjs";

export class DatabaseFeature {
    static async enable(__dirname) {
        const db = new MariaDbDatabase();
        await db.connect();
        await DatabaseFeature.checkDatabaseIntegrity(db, __dirname);
        return db;
    }

    /**
     * @param {MariaDbDatabase} db
     * @param {String} __dirname
     */
    static async checkDatabaseIntegrity(db, __dirname) {
        const file = fs.readFileSync(path.join(__dirname, "features/database/updateDb.sql"), "utf8");
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

    static async createDefaultData(db) {
        CLI.info("Creating default data...");
        await DatabaseFeature.createDefaultPermissions(db);
        await DatabaseFeature.createDefaultRoles(db);
    }

    /**
     * @param {MariaDbDatabase} db
     * @returns {Promise<void>}
     */
    static async createDefaultPermissions(db) {
        const permissions = Object.values(Permissions);
        for (const permission of permissions) {
            await db.createPermission(permission.name, permission.description);
        }
    }

    /**
     * @param {MariaDbDatabase} db
     * @returns {Promise<void>}
     */
    static async createDefaultRoles(db) {
        const roles = Object.values(DefaultRoles);
        for (const role of roles) {
            await db.createRole(role.name, role.description);
            for (const permission of role.permissions) {
                await db.query(`INSERT INTO rolePermissions (roleId, permissionId) VALUES 
((SELECT id FROM roles WHERE name = ?), (SELECT id FROM permissions WHERE name = ?)) ON DUPLICATE KEY UPDATE roleId = roleId`,
                    [role.name, permission.name]);
            }
        }
    }
}