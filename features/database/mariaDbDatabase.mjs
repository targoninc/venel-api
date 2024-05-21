import mariadb from 'mariadb';
import {CLI} from "../../tooling/CLI.mjs";

export class MariaDbDatabase {
    constructor(host = null, user = null, password = null, port = null) {
        this.host = host || process.env.MYSQL_HOST;
        this.port = port || 3306;
        this.user = user || process.env.MYSQL_USER;
        this.password = password || process.env.MYSQL_PASSWORD;
        this.database = 'venel';
        CLI.info(`Set up MariaDB connection to ${this.host}:${this.port} with user ${this.user} and database venel.`);
    }

    async connect() {
        this.pool = await mariadb.createPool({
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.database
        });
    }

    async query(sql, params = []) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            return await conn.query({
                sql,
                supportBigNumbers: true
            }, params);
        } catch (e) {
            throw e;
        } finally {
            if (conn) {
                await conn.end();
            }
        }
    }

    async getUserByUsername(username) {
        const rows = await this.query("SELECT * FROM venel.users WHERE username = ?", [username]);
        return rows ? rows[0] : null;
    }

    /**
     *
     * @param id
     * @returns {Promise<User|null>}
     */
    async getUserById(id) {
        const rows = await this.query("SELECT * FROM venel.users WHERE id = ?", [id]);
        return rows ? rows[0] : null;
    }

    async insertUser(username, hashedPassword, ip) {
        await this.query("INSERT INTO venel.users (username, passwordHash, registrationIp) VALUES (?, ?, ?)", [username, hashedPassword, ip]);
    }

    async updateUserIp(id, ip) {
        await this.query("UPDATE venel.users SET lastLoginIp = ? WHERE id = ?", [ip, id]);
    }

    async updateUserUsername(id, username) {
        await this.query("UPDATE venel.users SET username = ? WHERE id = ?", [username, id]);
    }

    async updateUserDisplayname(id, displayname) {
        await this.query("UPDATE venel.users SET displayname = ? WHERE id = ?", [displayname, id]);
    }

    async updateUserDescription(id, description) {
        await this.query("UPDATE venel.users SET description = ? WHERE id = ?", [description, id]);
    }
}