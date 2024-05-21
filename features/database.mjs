import {MariaDbDatabase} from "./database/mariaDbDatabase.mjs";
import fs from "fs";
import path from "path";

export class DatabaseFeature {
    static async enable() {
        const db = new MariaDbDatabase();
        await db.connect();
        await DatabaseFeature.checkDatabaseIntegrity(db);
        return db;
    }

    /**
     * @param {MariaDbDatabase} db
     */
    static async checkDatabaseIntegrity(db) {
        const file = fs.readFileSync(path.join(__dirname, "updateDb.sql"), "utf8");
        const queries = file.split(";");
        for (const query of queries) {
            await db.query(query);
        }
    }
}