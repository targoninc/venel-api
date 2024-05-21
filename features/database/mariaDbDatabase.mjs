import mariadb from 'mariadb';
import {CLI} from "../../tooling/CLI.mjs";

export class MariaDbDatabase {

    /**
     * @param {String} host
     * @param {String} user
     * @param {String} password
     * @param {Number} port
     */
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

    /**
     * @param {String} sql
     * @param {unknown[]} params
     * @returns {Promise<unknown[]>}
     */
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

    /**
     * @param {String} username
     * @returns {Promise<Users| null>}
     **/
    async getUserByUsername(username) {
        const rows = await this.query("SELECT * FROM venel.users WHERE username = ?", [username]);

        return rows ? rows[0] : null;
    }

    /**
     * @param {Number} id
     * @returns {Promise<User| null>}
     */
    async getUserById(id) {
        const rows = await this.query("SELECT * FROM venel.users WHERE id = ?", [id]);
        return rows ? rows[0] : null;
    }

    /**
     * @param {String} username
     * @param {String} hashedPassword
     * @param {String} ip
     * @returns {Promise<void>}
     */
    async insertUser(username, hashedPassword, ip) {
        await this.query("INSERT INTO venel.users (username, passwordHash, registrationIp) VALUES (?, ?, ?)", [username, hashedPassword, ip]);
    }

    /**
     * @param {Number} id
     * @param {String} ip
     * @returns {Promise<void>}
     */
    async updateUserIp(id, ip) {
        await this.query("UPDATE venel.users SET lastLoginIp = ? WHERE id = ?", [ip, id]);
    }

    /**
     * @param {Number} id
     * @param {String} username
     * @returns {Promise<void>}
     */
    async updateUserUsername(id, username) {
        await this.query("UPDATE venel.users SET username = ? WHERE id = ?", [username, id]);
    }

    /**
     * @param {Number} id
     * @param {String} displayname
     * @returns {Promise<void>}
     */
    async updateUserDisplayname(id, displayname) {
        await this.query("UPDATE venel.users SET displayname = ? WHERE id = ?", [displayname, id]);
    }

    /**
     * @param {Number} id
     * @param {String} description
     * @returns {Promise<void>}
     */
    async updateUserDescription(id, description) {
        await this.query("UPDATE venel.users SET description = ? WHERE id = ?", [description, id]);
    }
}