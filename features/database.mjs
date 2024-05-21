import {MariaDbDatabase} from "./database/mariaDbDatabase.mjs";
import fs from "fs";
import path from "path";
import {CLI} from "../tooling/CLI.mjs";

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
        CLI.success("Database is up to date.");
    }
}