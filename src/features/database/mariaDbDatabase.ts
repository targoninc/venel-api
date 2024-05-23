import mariadb from 'mariadb';
import {CLI} from "../../tooling/CLI";
import {Id, Permission, Role, User} from "./models";

export class MariaDbDatabase {
    private readonly host: string;
    private readonly port: number;
    private readonly user: string;
    private readonly password: string;
    private readonly database: string;
    private pool: mariadb.Pool | null = null;

    constructor(host: string | null = null, user: string | null = null, password: string | null = null, port: number | null = null) {
        this.host = host || process.env.MYSQL_HOST || 'localhost';
        this.port = port || 3306;
        this.user = user || process.env.MYSQL_USER || 'root';
        this.password = password || process.env.MYSQL_PASSWORD || '';
        this.database = 'venel';
        CLI.info(`Set up MariaDB connection to ${this.host}:${this.port} with user ${this.user} and database venel.`);
    }

    connect() {
        this.pool = mariadb.createPool({
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.database
        });
        if (!this.pool) {
            throw new Error("Could not connect to database.");
        }
    }

    async query(sql: string, params: unknown[] = []) {
        if (!this.pool) {
            this.connect();
        }
        let conn;
        try {
            conn = await this.pool!.getConnection();
            return await conn.query({
                sql,
                bigIntAsNumber: true
            }, params);
        } catch (e) {
            throw e;
        } finally {
            if (conn) {
                await conn.end();
            }
        }
    }

    async getUsers(): Promise<User[] | undefined> {
        return await this.query("SELECT * FROM venel.users");
    }

    async getUserByUsername(username: string): Promise<User | null> {
        const rows = await this.query("SELECT * FROM venel.users WHERE username = ?", [username]);

        return rows ? rows[0] : null;
    }

    async getUserById(id: Id): Promise<User | null> {
        const rows = await this.query("SELECT * FROM venel.users WHERE id = ?", [id]);
        return rows ? rows[0] : null;
    }

    async createUser(username: string, hashedPassword: string, ip: string): Promise<void> {
        await this.query("INSERT INTO venel.users (username, passwordHash, registrationIp) VALUES (?, ?, ?)", [username, hashedPassword, ip]);
    }

    async updateUserIp(id: Id, ip: string): Promise<void> {
        await this.query("UPDATE venel.users SET lastLoginIp = ? WHERE id = ?", [ip, id]);
    }

    async updateUserUsername(id: Id, username: string): Promise<void> {
        await this.query("UPDATE venel.users SET username = ? WHERE id = ?", [username, id]);
    }

    async updateUserDisplayname(id: Id, displayname: string): Promise<void> {
        await this.query("UPDATE venel.users SET displayname = ? WHERE id = ?", [displayname, id]);
    }

    async updateUserDescription(id: Id, description: string): Promise<void> {
        await this.query("UPDATE venel.users SET description = ? WHERE id = ?", [description, id]);
    }

    async createRole(name: string, description = "") {
        await this.query("INSERT INTO venel.roles (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name", [name, description]);
    }

    async createPermission(name: string, description: string) {
        await this.query("INSERT INTO venel.permissions (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name", [name, description]);
    }

    async createRolePermission(roleId: Id, permissionId: Id) {
        await this.query("INSERT INTO venel.rolePermissions (roleId, permissionId) VALUES (?, ?) ON DUPLICATE KEY UPDATE roleId = roleId", [roleId, permissionId]);
    }

    async createUserRole(userId: Id, roleId: Id) {
        await this.query("INSERT INTO venel.userRoles (userId, roleId) VALUES (?, ?) ON DUPLICATE KEY UPDATE userId = userId", [userId, roleId]);
    }

    async getRoleByName(name: string): Promise<Role | null> {
        const rows = await this.query("SELECT * FROM venel.roles WHERE name = ?", [name]);
        return rows ? rows[0] : null;
    }

    async deleteUserRole(userId: Id, roleId: Id) {
        await this.query("DELETE FROM venel.userRoles WHERE userId = ? AND roleId = ?", [userId, roleId]);
    }

    async getPermissions(): Promise<Permission[] | undefined> {
        return await this.query("SELECT * FROM venel.permissions");
    }

    async getRoles(): Promise<Role[] | undefined> {
        return await this.query("SELECT * FROM venel.roles");
    }

    async getUserRoles(userId: Id): Promise<Role[] | undefined> {
        return await this.query("SELECT r.id, r.name, r.description FROM venel.roles r INNER JOIN venel.userRoles ur ON r.id = ur.roleId WHERE ur.userId = ?", [userId]);
    }

    async getRolePermissions(roleId: Id): Promise<Permission[] | undefined> {
        return await this.query(`SELECT * FROM venel.permissions INNER JOIN venel.rolePermissions ON 
permissions.id = rolePermissions.permissionId WHERE rolePermissions.roleId = ?`, [roleId]);
    }

    async getUserPermissions(userId: Id): Promise<Permission[] | undefined> {
        return await this.query(`SELECT p.id, p.name, p.description FROM venel.permissions p INNER JOIN venel.rolePermissions rp ON 
p.id = rp.permissionId INNER JOIN venel.userRoles ur ON rp.roleId = ur.roleId 
WHERE ur.userId = ?`, [userId]);
    }

    async createMessage(channelId: Id, senderId: Id, text: string) {
        await this.query("INSERT INTO venel.messages (channelId, senderId, text) VALUES (?, ?, ?)", [channelId, senderId, text]);
    }

    async getChannelById(channelId: Id) {
        const rows = await this.query("SELECT * FROM venel.channels WHERE id = ?", [channelId]);
        return rows ? rows[0] : null;
    }

    async getMessagesForChannel(channelId: Id) {
        return await this.query("SELECT * FROM venel.messages WHERE channelId = ?", [channelId]);
    }

    async deleteUser(id: Id) {
        await this.query("DELETE FROM venel.users WHERE id = ?", [id]);
    }

    async createChannelDm(id: Id, targetUserId: Id) {
        await this.query("INSERT INTO venel.channels (type) VALUES ('dm')");
        const rows = await this.query("SELECT LAST_INSERT_ID() AS id");
        const channelId = rows ? rows[0].id : null;
        if (!channelId) {
            throw new Error("Could not create channel.");
        }

        await this.query("INSERT INTO venel.channelMembers (channelId, userId) VALUES (?, ?), (?, ?)", [
            channelId, id,
            channelId, targetUserId
        ]);
        return channelId;
    }
}