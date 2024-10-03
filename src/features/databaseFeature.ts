import fs from "fs";
import path from "path";
import {CLI} from "../tooling/CLI";
import {PermissionsList} from "../enums/permissionsList";
import {DefaultRoles} from "../enums/defaultRoles";
import {MariaDbDatabase} from "./database/mariaDbDatabase";
import {Reaction, ReactionGroup} from "./database/models";

export class DatabaseFeature {
    static async enable(__dirname: string) {
        const db = new MariaDbDatabase();
        await db.connect();
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
        try {
            await DatabaseFeature.createDefaultData(db, __dirname);
        } catch (e: any) {
            CLI.error("Failed to create default data.");
            CLI.error(e);
            return;
        }
        CLI.success("Database is up to date.");
    }

    static async createDefaultData(db: MariaDbDatabase, __dirname: string) {
        CLI.info("Creating default data...");
        await DatabaseFeature.createDefaultPermissions(db);
        await DatabaseFeature.createDefaultRoles(db);
        await DatabaseFeature.createDefaultReactionGroups(db, __dirname);
        await DatabaseFeature.createDefaultReactions(db, __dirname);
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

    static async createDefaultReactionGroups(db: MariaDbDatabase, __dirname: string) {
        const groupsContent = fs.readFileSync(path.join(__dirname, "../src/enums/reactionGroups.json"), "utf8");
        const groups = JSON.parse(groupsContent) as ReactionGroup[];
        for (const reactionGroup of groups) {
            await db.createReactionGroup(reactionGroup.id, reactionGroup.display);
        }
    }

    static async createDefaultReactions(db: MariaDbDatabase, __dirname: string) {
        const reactionsContent = fs.readFileSync(path.join(__dirname, "../src/enums/reactions.json"), "utf8");
        const reactions = JSON.parse(reactionsContent) as Reaction[];
        for (const reaction of reactions) {
            if (!reaction.content || (reaction.groupId === null || reaction.groupId === undefined) || !reaction.identifier) {
                CLI.warning(`Invalid reaction: ${JSON.stringify(reaction)}`);
                continue;
            }
            await db.createReaction(reaction.content, reaction.groupId, reaction.identifier);
        }
    }
}