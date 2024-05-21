import mariadb from 'mariadb';

export class MariaDbDatabase {
    constructor(host = null, user = null, password = null, database = null, port = null) {
        this.host = host || process.env.MARIADB_HOST;
        this.port = port || 3306;
        this.user = user || process.env.MARIADB_USER;
        this.password = password || process.env.MARIADB_PASSWORD;
        this.database = database || process.env.MARIADB_DB;
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
            return await conn.query(sql, params);
        } catch (e) {
            throw e;
        } finally {
            if (conn) {
                await conn.end();
            }
        }
    }

    async getUserByUsername(username) {
        const rows = await this.query("SELECT * FROM ${this.database}.users WHERE username = ?", [username]);
        return rows ? rows[0] : null;
    }

    async getUserById(id) {
        const rows = await this.query("SELECT * FROM ${this.database}.users WHERE id = ?", [id]);
        return rows ? rows[0] : null;
    }

    async insertUser(username, hashedPassword, ip) {
        await this.query("INSERT INTO ${this.database}.users (username, password_hash, ip) VALUES (?, ?, ?)", [username, hashedPassword, ip]);
    }

    async updateUserIp(id, ip) {
        await this.query("UPDATE ${this.database}.users SET ip = ? WHERE id = ?", [ip, id]);
    }
}