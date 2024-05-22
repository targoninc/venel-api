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
     * @returns {Promise<User|undefined>}
     */
    async getUsers() {
        return await this.query("SELECT * FROM venel.users");
    }

    /**
     * @param {String} username
     * @returns {Promise<User | null>}
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
    async createUser(username, hashedPassword, ip) {
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

    async createRole(name, description = "") {
        await this.query("INSERT INTO venel.roles (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name", [name, description]);
    }

    async createPermission(name, description) {
        await this.query("INSERT INTO venel.permissions (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name", [name, description]);
    }

    async createRolePermission(roleId, permissionId) {
        await this.query("INSERT INTO venel.rolePermissions (roleId, permissionId) VALUES (?, ?) ON DUPLICATE KEY UPDATE roleId = roleId", [roleId, permissionId]);
    }

    async createUserRole(userId, roleId) {
        await this.query("INSERT INTO venel.userRoles (userId, roleId) VALUES (?, ?)", [userId, roleId]);
    }

    /**
     * @param name
     * @returns {Promise<Role|null>}
     */
    async getRoleByName(name) {
        const rows = await this.query("SELECT * FROM venel.roles WHERE name = ?", [name]);
        return rows ? rows[0] : null;
    }

    async deleteUserRole(userId, roleId) {
        await this.query("DELETE FROM venel.userRoles WHERE userId = ? AND roleId = ?", [userId, roleId]);
    }

    /**
     * @returns {Promise<Permission[]|undefined>}
     */
    async getPermissions() {
        return await this.query("SELECT * FROM venel.permissions");
    }

    /**
     * @returns {Promise<Role[]|undefined>}
     */
    async getRoles() {
        return await this.query("SELECT * FROM venel.roles");
    }

    /**
     * @param userId
     * @returns {Promise<Role[]|undefined>}
     */
    async getUserRoles(userId) {
        return await this.query("SELECT r.id, r.name, r.description FROM venel.roles r INNER JOIN venel.userRoles ur ON r.id = ur.roleId WHERE ur.userId = ?", [userId]);
    }

    /**
     * @param roleId
     * @returns {Promise<Permission[]|undefined>}
     */
    async getRolePermissions(roleId) {
        return await this.query(`SELECT * FROM venel.permissions INNER JOIN venel.rolePermissions ON 
permissions.id = rolePermissions.permissionId WHERE rolePermissions.roleId = ?`, [roleId]);
    }

    /**
     * @param userId
     * @returns {Promise<Permission[]|undefined>}
     */
    async getUserPermissions(userId) {
        return await this.query(`SELECT p.id, p.name, p.description FROM venel.permissions p INNER JOIN venel.rolePermissions rp ON 
p.id = rp.permissionId INNER JOIN venel.userRoles ur ON rp.roleId = ur.roleId 
WHERE ur.userId = ?`, [userId]);
    }
}